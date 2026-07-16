import { describe, expect, it } from 'vitest'
import { evaluateExerciseAnswer, toPublicExerciseData } from '../exercise-contract'

describe('public exercise contract', () => {
  it('removes multiple-choice answer keys while preserving display options', () => {
    const result = toPublicExerciseData('MULTIPLE_CHOICE', {
      options: ['A', 'B', 'C'],
      correctIndex: 1,
      answerKey: 'B',
    })

    expect(result).toEqual({ options: ['A', 'B', 'C'] })
    expect(result).not.toHaveProperty('correctIndex')
  })

  it('does not expose the pairing map', () => {
    const result = toPublicExerciseData('MATCH_PAIRS', {
      pairs: [
        { left: 'pes', right: 'dog' },
        { left: 'kočka', right: 'cat' },
      ],
    })

    expect(result).toEqual({
      leftItems: ['pes', 'kočka'],
      rightItems: ['cat', 'dog'],
    })
    expect(result).not.toHaveProperty('pairs')
  })

  it('removes answer keys recursively and case-insensitively', () => {
    const result = toPublicExerciseData('MULTIPLE_CHOICE', {
      options: ['A', 'B'],
      feedback: {
        CorrectAnswer: 1,
        nested: { expectedAnswer: 'B', safeText: 'Zkus to znovu' },
      },
    })

    expect(result).toEqual({
      options: ['A', 'B'],
      feedback: { nested: { safeText: 'Zkus to znovu' } },
    })
  })

  it('does not leave a fixed-position pair when an odd number of pairs is published', () => {
    const result = toPublicExerciseData('MATCH_PAIRS', {
      pairs: [
        { left: 'A', right: '1' },
        { left: 'B', right: '2' },
        { left: 'C', right: '3' },
      ],
    })

    expect(result).toEqual({
      leftItems: ['A', 'B', 'C'],
      rightItems: ['2', '3', '1'],
    })
  })
})

describe('exercise answer evaluation', () => {
  it('evaluates answers only against private exercise data', () => {
    const data = { options: ['A', 'B'], correctIndex: 1 }

    expect(evaluateExerciseAnswer('MULTIPLE_CHOICE', data, 1)).toBe(true)
    expect(evaluateExerciseAnswer('MULTIPLE_CHOICE', data, 0)).toBe(false)
  })
})
