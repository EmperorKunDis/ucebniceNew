import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultipleChoice } from '@/components/learning/exercise/exercises/MultipleChoice'
import { TrueFalse } from '@/components/learning/exercise/exercises/TrueFalse'
import { FillInBlank } from '@/components/learning/exercise/exercises/FillInBlank'
import { MatchPairs } from '@/components/learning/exercise/exercises/MatchPairs'
import { ExercisePlayer } from '@/components/learning/exercise/ExercisePlayer'

describe('server-authoritative exercise inputs', () => {
  it('submits a multiple-choice selection without evaluating it locally', async () => {
    const onAnswer = jest.fn()
    render(
      <MultipleChoice
        question="Vyber možnost"
        options={['První', 'Druhá', 'Třetí']}
        onAnswer={onAnswer}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Druhá' }))

    expect(onAnswer).toHaveBeenCalledWith(1)
    expect(screen.queryByText('Správně!')).not.toBeInTheDocument()
    expect(screen.queryByText('Špatně')).not.toBeInTheDocument()
  })

  it('submits true or false as the selected value only', async () => {
    const onAnswer = jest.fn()
    render(<TrueFalse statement="Python je jazyk." onAnswer={onAnswer} />)

    await userEvent.click(screen.getByRole('button', { name: 'Pravda' }))

    expect(onAnswer).toHaveBeenCalledWith(true)
  })

  it('derives fill-in inputs from public placeholders', async () => {
    const onAnswer = jest.fn()
    render(<FillInBlank text="Model má ___ vstup a ___ výstup." onAnswer={onAnswer} />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)

    await userEvent.type(inputs[0]!, 'jeden')
    await userEvent.type(inputs[1]!, 'jeden')
    await userEvent.click(screen.getByRole('button', { name: 'Odeslat odpověď' }))

    expect(onAnswer).toHaveBeenCalledWith(['jeden', 'jeden'])
  })

  it('submits pair labels in the order selected and waits for the server result', async () => {
    const onAnswer = jest.fn()
    render(<MatchPairs leftItems={['Python']} rightItems={['jazyk']} onAnswer={onAnswer} />)

    await userEvent.click(screen.getByRole('button', { name: 'Python' }))
    await userEvent.click(screen.getByRole('button', { name: 'jazyk' }))

    await waitFor(() => expect(onAnswer).toHaveBeenCalledWith([{ left: 'Python', right: 'jazyk' }]))
    expect(screen.queryByText('Správně!')).not.toBeInTheDocument()
  })

  it('reuses one idempotency key when a network failure retries the same explicit attempt', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new TypeError('connection reset'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ correct: true, xpEarned: 5 }),
      } as unknown as Response)

    render(
      <ExercisePlayer
        exercise={{
          id: 'exercise-1',
          type: 'MULTIPLE_CHOICE',
          question: 'Vyber možnost',
          data: { options: ['První', 'Druhá'] },
          xpReward: 5,
        }}
        onComplete={jest.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Druhá' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    const firstInit = fetchMock.mock.calls[0]?.[1]
    const retryInit = fetchMock.mock.calls[1]?.[1]
    const firstHeaders = firstInit?.headers as Record<string, string>
    const retryHeaders = retryInit?.headers as Record<string, string>
    const firstBody = JSON.parse(String(firstInit?.body)) as { idempotencyKey: string }
    const retryBody = JSON.parse(String(retryInit?.body)) as { idempotencyKey: string }

    expect(firstHeaders['Idempotency-Key']).toBeTruthy()
    expect(retryHeaders['Idempotency-Key']).toBe(firstHeaders['Idempotency-Key'])
    expect(firstBody.idempotencyKey).toBe(firstHeaders['Idempotency-Key'])
    expect(retryBody.idempotencyKey).toBe(firstBody.idempotencyKey)

    fetchMock.mockRestore()
  })
})
