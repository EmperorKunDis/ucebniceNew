import { QuestCategory } from '@prisma/client'
import { BADGES, type BadgeId } from '@/lib/gamification'
import { awardCanonicalReward, runLearningTransaction } from '@/lib/learning-service'
import {
  canonicalChapterIdsThrough,
  canonicalExerciseSourceKeysForCourse,
} from '@/lib/canonical-content-keys'

/**
 * Evaluate canonical progress and grant each newly unlocked achievement and
 * its reward in one serializable transaction. The reward ledger makes the
 * operation safe to replay or run concurrently from multiple learning APIs.
 */
export async function checkAndAwardAchievements(userId: string): Promise<BadgeId[]> {
  try {
    return await runLearningTransaction(async tx => {
      const [user, userAchievements, correctExercises, chapterProgress, milestoneTests, finalTest] =
        await Promise.all([
          tx.user.findUnique({
            where: { id: userId },
            select: { currentStreak: true },
          }),
          tx.userAchievement.findMany({
            where: { userId },
            select: { achievement: { select: { badgeId: true } } },
          }),
          tx.exerciseProgress.count({
            where: {
              userId,
              completed: true,
              exercise: {
                sourceKey: { in: canonicalExerciseSourceKeysForCourse() },
                microLesson: {
                  isPublished: true,
                  chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
                },
              },
            },
          }),
          tx.chapterProgress.findMany({
            where: {
              userId,
              chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
            },
            select: {
              contentCompleted: true,
              exercisesCompleted: true,
              projectApproved: true,
            },
          }),
          tx.milestoneTest.findMany({
            where: { userId, passed: true, milestone: { in: [10, 20, 30, 40] } },
            select: { score: true, startedAt: true, completedAt: true },
          }),
          tx.finalTest.findUnique({ where: { userId } }),
        ])

      if (!user) return []

      const existingBadgeIds = new Set(userAchievements.map(item => item.achievement.badgeId))
      const candidates = new Set<BadgeId>()
      const completedChapters = chapterProgress.filter(progress => progress.contentCompleted).length
      const answeredChapters = chapterProgress.filter(
        progress => progress.exercisesCompleted
      ).length
      const approvedProjects = chapterProgress.filter(progress => progress.projectApproved).length
      const perfectChapters = chapterProgress.filter(
        progress =>
          progress.contentCompleted && progress.exercisesCompleted && progress.projectApproved
      ).length

      const add = (badge: BadgeId, condition: boolean) => {
        if (condition && !existingBadgeIds.has(BADGES[badge].id)) candidates.add(badge)
      }

      add('FIRST_CHAPTER', completedChapters >= 1)
      add('FIVE_CHAPTERS', completedChapters >= 5)
      add('TEN_CHAPTERS', completedChapters >= 10)
      add('ALL_CHAPTERS', completedChapters >= 40)
      add('WEEK_STREAK', user.currentStreak >= 7)
      add('MONTH_STREAK', user.currentStreak >= 30)
      add('QUESTION_MASTER', correctExercises >= 50)
      add('PROJECT_STARTER', approvedProjects >= 1)
      add('PROJECT_ENTHUSIAST', approvedProjects >= 10)
      add('FIRST_STAR_TWO', answeredChapters >= 1)
      add('FIRST_STAR_THREE', approvedProjects >= 1)
      add('FIVE_PERFECT_CHAPTERS', perfectChapters >= 5)
      add('ALL_THREE_STARS', perfectChapters >= 40)
      add('GRADUATE', finalTest?.passed === true)

      const milestoneHighScores = milestoneTests.filter(test => test.score >= 90)
      const finalHighScore = finalTest?.passed === true && finalTest.questionsScore >= 90
      const canonicalHighScores = milestoneHighScores.length + Number(finalHighScore)
      add('TEST_ACE', canonicalHighScores > 0)
      add(
        'SPEED_DEMON',
        milestoneTests.some(
          test =>
            test.score === 100 &&
            test.completedAt !== null &&
            test.completedAt.getTime() - test.startedAt.getTime() < 5 * 60 * 1000
        ) ||
          (finalTest?.passed === true &&
            finalTest.questionsScore === 100 &&
            finalTest.completedAt !== null &&
            finalTest.completedAt.getTime() - finalTest.startedAt.getTime() < 5 * 60 * 1000)
      )
      add('MODULE_MASTER', canonicalHighScores > 0)
      add('ALL_MODULES_PERFECT', canonicalHighScores >= 4)

      const unlocked: BadgeId[] = []
      for (const badgeKey of candidates) {
        const badge = BADGES[badgeKey]
        const achievement = await tx.achievement.upsert({
          where: { badgeId: badge.id },
          create: {
            badgeId: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            xpReward: badge.xpReward,
            rarity: badge.rarity,
          },
          update: {
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            xpReward: badge.xpReward,
            rarity: badge.rarity,
          },
        })
        const inserted = await tx.userAchievement.createMany({
          data: [{ userId, achievementId: achievement.id }],
          skipDuplicates: true,
        })
        if (inserted.count !== 1) continue

        await awardCanonicalReward(tx, {
          userId,
          sourceType: 'ACHIEVEMENT_UNLOCK',
          sourceId: badge.id,
          xpAmount: achievement.xpReward,
          gemAmount: achievement.gemReward,
          questCategories: [QuestCategory.XP_EARNED],
        })
        unlocked.push(badgeKey)
      }

      return unlocked
    })
  } catch (error) {
    console.error('Error checking achievements:', error)
    return []
  }
}
