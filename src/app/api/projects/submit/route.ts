import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { isCanonicalChapterId } from '@/lib/canonical-content-keys'
import { reviewProjectWithGemini } from '@/lib/gemini'
import {
  applyProjectApproval,
  assertProjectSubmissionAllowed,
  LearningServiceError,
  runLearningTransaction,
} from '@/lib/learning-service'
import {
  validateAPIRequest,
  validateQueryParams,
  submitProjectSchema,
  chapterProgressQuerySchema,
} from '@/lib/validation-schemas'
import type { Prisma } from '@prisma/client'

const PROJECT_XP_REWARD = 50
const GEMS_FOR_APPROVED_PROJECT = 100

function readProjectClaim(
  metadata: unknown,
  expected: { chapterId: string; projectUrl: string; description: string | null }
): { pending: boolean; response?: Record<string, unknown> } {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new LearningServiceError('Idempotency claim projektu je neplatný', 409)
  }
  const claim = metadata as Record<string, unknown>
  if (
    claim.chapterId !== expected.chapterId ||
    claim.projectUrl !== expected.projectUrl ||
    claim.description !== expected.description
  ) {
    throw new LearningServiceError('Idempotency klíč už byl použit pro jiný projekt', 409)
  }
  if (claim.status === 'pending') return { pending: true }
  if (
    claim.status !== 'completed' ||
    !claim.response ||
    typeof claim.response !== 'object' ||
    Array.isArray(claim.response)
  ) {
    throw new LearningServiceError('Idempotency claim projektu nelze zopakovat', 409)
  }
  return { pending: false, response: claim.response as Record<string, unknown> }
}

export async function POST(request: NextRequest) {
  let acquiredClaim: { userId: string; dedupeKey: string } | null = null
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validation = await validateAPIRequest(request, submitProjectSchema)
    if (!validation.success) return validation.response
    const { chapterId, projectUrl, description } = validation.data
    if (!isCanonicalChapterId(chapterId)) {
      return NextResponse.json({ error: 'Kapitola nenalezena' }, { status: 404 })
    }
    const normalizedDescription = description ?? null
    const idempotencyKey = request.headers.get('Idempotency-Key')?.trim()
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 200) {
      return NextResponse.json(
        { error: 'Platný Idempotency-Key header je povinný' },
        { status: 400 }
      )
    }

    // Public chapter slugs are translated to the internal Chapter.id at this boundary.
    const chapter = await prisma.chapter.findUnique({
      where: { chapterId },
      select: {
        id: true,
        chapterId: true,
        order: true,
        title: true,
        description: true,
        projectRequirements: true,
      },
    })
    if (!chapter) {
      return NextResponse.json({ error: 'Kapitola nenalezena' }, { status: 404 })
    }

    // Fail before invoking the external reviewer, then repeat the guard in the
    // write transaction below. Chapter progress is monotonic, so this preflight
    // cannot invalidate an otherwise eligible request.
    await runLearningTransaction(tx => assertProjectSubmissionAllowed(tx, session.user.id, chapter))

    const dedupeKey = `PROJECT_SUBMIT:${chapter.id}:${idempotencyKey}`
    const expectedClaim = {
      chapterId: chapter.chapterId,
      projectUrl,
      description: normalizedDescription,
    }
    const claim = await runLearningTransaction(async tx => {
      const existing = await tx.rewardLedger.findUnique({
        where: { userId_dedupeKey: { userId: session.user.id, dedupeKey } },
        select: { metadata: true },
      })
      if (existing) return readProjectClaim(existing.metadata, expectedClaim)

      const metadata: Prisma.InputJsonObject = {
        status: 'pending',
        ...expectedClaim,
      }
      const inserted = await tx.rewardLedger.createMany({
        data: [
          {
            userId: session.user.id,
            sourceType: 'PROJECT_SUBMIT',
            sourceId: `${chapter.id}:${idempotencyKey}`,
            dedupeKey,
            xpAmount: 0,
            gemAmount: 0,
            metadata,
          },
        ],
        skipDuplicates: true,
      })
      return { pending: inserted.count !== 1 }
    })
    if (claim.response) return NextResponse.json(claim.response)
    if (claim.pending) {
      return NextResponse.json(
        { error: 'Odevzdání se už zpracovává; zopakuj stejný požadavek za chvíli' },
        { status: 409, headers: { 'Retry-After': '2' } }
      )
    }
    acquiredClaim = { userId: session.user.id, dedupeKey }

    const aiReview = await reviewProjectWithGemini({
      projectCode: normalizedDescription || projectUrl,
      chapterTitle: chapter.title,
      chapterDescription: chapter.description ?? '',
      projectRequirements:
        chapter.projectRequirements ?? 'Implementovat praktické řešení dle pracovního sešitu',
    })

    const buildResponseBody = (outcome: {
      xpEarned: number
      gemsEarned: number
      submittedProject: boolean
      approved: boolean
    }) => ({
      message: outcome.approved
        ? outcome.xpEarned > 0
          ? 'Projekt byl schválen AI a ohodnocen!'
          : 'Projekt zůstává schválen; odměna už byla připsána dříve.'
        : aiReview.manualReviewRequired
          ? 'Projekt byl odevzdán a čeká na ruční kontrolu.'
          : 'Projekt byl odevzdán, ale nedosáhl požadovaného skóre.',
      xpEarned: outcome.xpEarned,
      gemsEarned: outcome.gemsEarned,
      submittedProject: outcome.submittedProject,
      updated: true,
      aiReview: {
        score: aiReview.score,
        feedback: aiReview.feedback,
        strengths: aiReview.strengths,
        improvements: aiReview.improvements,
        approved: outcome.approved,
        latestReviewApproved: aiReview.approved,
        model: aiReview.model,
        promptVersion: aiReview.promptVersion,
        latencyMs: aiReview.latencyMs,
        tokenCount: aiReview.tokenCount,
        failureReason: aiReview.failureReason,
        safetyStatus: aiReview.safetyStatus,
        manualReviewRequired: aiReview.manualReviewRequired,
      },
      // Achievement effects have their own ledger. The stored project response
      // never causes that secondary reconciliation to run twice.
      newAchievements: [] as string[],
    })

    const transactionResult = await runLearningTransaction(async tx => {
      await assertProjectSubmissionAllowed(tx, session.user.id, chapter)

      const existingSubmission = await tx.projectSubmission.findUnique({
        where: {
          userId_chapterId: { userId: session.user.id, chapterId: chapter.chapterId },
        },
        select: { aiApproved: true },
      })
      const preserveApprovedReview = existingSubmission?.aiApproved && !aiReview.approved
      const reviewedAt = new Date()
      const reviewFields = {
        aiReviewScore: aiReview.score,
        aiReviewFeedback: aiReview.feedback,
        aiReviewedAt: reviewedAt,
        aiApproved: aiReview.approved,
        aiReviewModel: aiReview.model,
        aiReviewPromptVersion: aiReview.promptVersion,
        aiReviewLatencyMs: aiReview.latencyMs,
        aiReviewTokenCount: aiReview.tokenCount,
        aiReviewFailureReason: aiReview.failureReason,
        aiManualReviewRequired: aiReview.manualReviewRequired,
        aiSafetyStatus: aiReview.safetyStatus,
      }
      const submission = await tx.projectSubmission.upsert({
        where: {
          userId_chapterId: { userId: session.user.id, chapterId: chapter.chapterId },
        },
        create: {
          userId: session.user.id,
          chapterId: chapter.chapterId,
          projectUrl,
          description,
          ...reviewFields,
        },
        update: {
          projectUrl,
          description,
          // A later failed review cannot revoke an already-earned third star.
          // Keep the approved review metadata because this schema has one
          // current review slot and canonical progress must never decrease.
          ...(preserveApprovedReview ? { aiApproved: true } : reviewFields),
        },
      })

      let outcome: {
        xpEarned: number
        gemsEarned: number
        submittedProject: boolean
        approved: boolean
      }
      if (!submission.aiApproved) {
        outcome = {
          xpEarned: 0,
          gemsEarned: 0,
          submittedProject: false,
          approved: false,
        }
      } else {
        const approval = await applyProjectApproval(tx, {
          userId: session.user.id,
          chapter,
          xpAmount: PROJECT_XP_REWARD,
          gemAmount: GEMS_FOR_APPROVED_PROJECT,
        })
        if (approval.awarded) {
          await tx.projectSubmission.update({
            where: { id: submission.id },
            data: {
              xpEarned: { increment: approval.xpEarned },
              gemsEarned: { increment: approval.gemsEarned },
            },
          })
        }
        outcome = {
          xpEarned: approval.xpEarned,
          gemsEarned: approval.gemsEarned,
          submittedProject: true,
          approved: true,
        }
      }

      const responseBody = buildResponseBody(outcome)
      const response = JSON.parse(JSON.stringify(responseBody)) as Prisma.InputJsonObject
      await tx.rewardLedger.update({
        where: {
          userId_dedupeKey: { userId: session.user.id, dedupeKey },
        },
        data: {
          metadata: {
            status: 'completed',
            ...expectedClaim,
            response,
          },
        },
      })
      return { outcome, responseBody }
    })
    acquiredClaim = null

    const newAchievements = transactionResult.outcome.approved
      ? await checkAndAwardAchievements(session.user.id)
      : []
    return NextResponse.json({ ...transactionResult.responseBody, newAchievements })
  } catch (error) {
    if (acquiredClaim) {
      await prisma.rewardLedger.deleteMany({
        where: {
          userId: acquiredClaim.userId,
          dedupeKey: acquiredClaim.dedupeKey,
          metadata: { path: ['status'], equals: 'pending' },
        },
      })
    }
    if (error instanceof LearningServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Error submitting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const validation = validateQueryParams(searchParams, chapterProgressQuerySchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const submission = await prisma.projectSubmission.findUnique({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId: validation.data.chapterId,
        },
      },
    })
    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Error getting project submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
