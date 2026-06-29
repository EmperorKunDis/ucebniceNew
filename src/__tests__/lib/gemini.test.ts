import { reviewProjectWithGemini } from '@/lib/gemini'

describe('Gemini project review fallback', () => {
  const originalApiKey = process.env.GEMINI_API_KEY

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalApiKey
    jest.restoreAllMocks()
  })

  it('does not approve project when Gemini API key is missing', async () => {
    delete process.env.GEMINI_API_KEY

    const result = await reviewProjectWithGemini({
      projectCode: 'print("hello")',
      chapterTitle: 'Test',
      chapterDescription: 'Test chapter',
      projectRequirements: 'Submit code',
    })

    expect(result.approved).toBe(false)
    expect(result.score).toBe(0)
    expect(result.manualReviewRequired).toBe(true)
    expect(result.failureReason).toBe('missing_api_key')
  })

  it('does not approve project when Gemini returns invalid JSON', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'not json' }] } }],
      }),
    } as Response)

    const result = await reviewProjectWithGemini({
      projectCode: 'print("hello")',
      chapterTitle: 'Test',
      chapterDescription: 'Test chapter',
      projectRequirements: 'Submit code',
    })

    expect(result.approved).toBe(false)
    expect(result.manualReviewRequired).toBe(true)
    expect(result.failureReason).toBe('invalid_provider_json')
  })
})
