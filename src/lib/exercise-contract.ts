import type { ExerciseType } from '@prisma/client'

type ExerciseData = Record<string, unknown>

const ANSWER_KEY_FIELDS = new Set([
  'correctanswer',
  'correctindex',
  'correctoption',
  'correctvalue',
  'expectedanswer',
  'acceptedanswers',
  'validanswers',
  'istrue',
  'answers',
  'answer',
  'alternatives',
  'solution',
  'solutions',
  'expectedoutput',
  'answerkey',
  'correctpairs',
])

/**
 * Build the public exercise payload. Answer keys stay in the database and are
 * evaluated only by the answer endpoint.
 */
export function toPublicExerciseData(type: ExerciseType | string, data: ExerciseData) {
  if (type === 'MATCH_PAIRS') {
    const pairs = Array.isArray(data.pairs) ? data.pairs : []
    const leftItems: string[] = []
    const rightItems: string[] = []

    for (const pair of pairs) {
      if (!isRecord(pair)) continue
      if (typeof pair.left === 'string') leftItems.push(pair.left)
      if (typeof pair.right === 'string') rightItems.push(pair.right)
    }

    return {
      leftItems,
      // Rotate instead of reversing: an odd-sized reverse leaves the middle
      // answer aligned with its source pair and therefore leaks one match.
      rightItems: rotateItems(rightItems),
    }
  }

  return sanitizePublicObject(data)
}

export function evaluateExerciseAnswer(
  type: ExerciseType | string,
  data: ExerciseData,
  answer: unknown
): boolean {
  switch (type) {
    case 'MULTIPLE_CHOICE':
    case 'CODE_OUTPUT':
      return typeof answer === 'number' && answer === data.correctIndex

    case 'TRUE_FALSE':
      return typeof answer === 'boolean' && answer === data.isTrue

    case 'FILL_IN_BLANK':
    case 'TYPE_ANSWER':
      return evaluateTextAnswer(data, answer)

    case 'MATCH_PAIRS':
      return evaluatePairs(data, answer)

    default:
      return false
  }
}

function evaluateTextAnswer(data: ExerciseData, answer: unknown): boolean {
  const expected = Array.isArray(data.answers)
    ? data.answers.filter((value): value is string => typeof value === 'string')
    : typeof data.answer === 'string'
      ? [data.answer]
      : []
  const submitted = Array.isArray(answer)
    ? answer.filter((value): value is string => typeof value === 'string')
    : typeof answer === 'string'
      ? [answer]
      : []

  if (expected.length === 0 || submitted.length !== expected.length) return false

  const alternatives = Array.isArray(data.alternatives) ? data.alternatives : []
  return expected.every((value, index) => {
    const normalized = normalizeText(submitted[index] ?? '')
    if (normalized === normalizeText(value)) return true

    const accepted = Array.isArray(alternatives[index]) ? alternatives[index] : []
    return accepted.some(candidate =>
      typeof candidate === 'string' ? normalizeText(candidate) === normalized : false
    )
  })
}

function evaluatePairs(data: ExerciseData, answer: unknown): boolean {
  if (!Array.isArray(data.pairs) || !Array.isArray(answer)) return false

  const expected = new Set(
    data.pairs.flatMap(pair => {
      if (!isRecord(pair) || typeof pair.left !== 'string' || typeof pair.right !== 'string') {
        return []
      }
      return [`${pair.left}\u0000${pair.right}`]
    })
  )
  const submitted = new Set(
    answer.flatMap(pair => {
      if (!isRecord(pair) || typeof pair.left !== 'string' || typeof pair.right !== 'string') {
        return []
      }
      return [`${pair.left}\u0000${pair.right}`]
    })
  )

  return (
    expected.size > 0 &&
    expected.size === submitted.size &&
    [...expected].every(v => submitted.has(v))
  )
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('cs-CZ')
}

function sanitizePublicObject(value: ExerciseData): ExerciseData {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, nestedValue]) => {
      if (ANSWER_KEY_FIELDS.has(key.toLocaleLowerCase('en-US'))) return []
      return [[key, sanitizePublicValue(nestedValue)]]
    })
  )
}

function sanitizePublicValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizePublicValue)
  if (isRecord(value)) return sanitizePublicObject(value)
  return value
}

function rotateItems(items: string[]) {
  if (items.length < 2) return items
  return [...items.slice(1), items[0]!]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
