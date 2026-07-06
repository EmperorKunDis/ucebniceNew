import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectSubmission } from '@/components/chapters/ProjectSubmission'
import toast from 'react-hot-toast'

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

describe('ProjectSubmission', () => {
  let fetchMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    fetchMock = jest.fn()
    global.fetch = fetchMock
  })

  it('shows pending manual review state for an existing submission', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        submission: {
          projectUrl: 'https://github.com/student/project',
          description: 'Moje reseni',
          aiApproved: false,
          aiManualReviewRequired: true,
          aiReviewFeedback: 'Provider je docasne nedostupny.',
          aiReviewScore: 0,
        },
      }),
    })

    render(<ProjectSubmission chapterId="01" />)

    expect(await screen.findByText('Čeká na ruční kontrolu')).toBeInTheDocument()
    expect(screen.getByText(/XP a hvězdička se připíšou až po kontrole/)).toBeInTheDocument()
    expect(screen.getByText('Provider je docasne nedostupny.')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('does not mark progress complete when a new submission needs manual review', async () => {
    const onProjectSubmitted = jest.fn()

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submission: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Projekt byl odevzdán a čeká na ruční kontrolu.',
          xpEarned: 0,
          submittedProject: false,
          aiReview: {
            approved: false,
            manualReviewRequired: true,
            feedback: 'Kontrola probehne rucne.',
            score: 0,
          },
        }),
      })

    render(<ProjectSubmission chapterId="01" onProjectSubmitted={onProjectSubmitted} />)

    await screen.findByLabelText('URL projektu *')
    await userEvent.type(
      screen.getByLabelText('URL projektu *'),
      'https://github.com/student/project'
    )
    await userEvent.type(screen.getByLabelText('Popis (volitelné)'), 'Projekt ke kontrole')
    await userEvent.click(screen.getByRole('button', { name: /Odevzdat projekt/ }))

    expect(await screen.findByText('Čeká na ruční kontrolu')).toBeInTheDocument()
    expect(screen.getByText('Kontrola probehne rucne.')).toBeInTheDocument()
    expect(onProjectSubmitted).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Projekt byl odevzdán a čeká na ruční kontrolu.')
  })

  it('marks progress complete only for approved submissions', async () => {
    const onProjectSubmitted = jest.fn()

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submission: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Projekt byl schválen AI a ohodnocen!',
          xpEarned: 50,
          submittedProject: true,
          aiReview: {
            approved: true,
            manualReviewRequired: false,
            feedback: 'Projekt splnuje zadani.',
            score: 92,
          },
        }),
      })

    render(<ProjectSubmission chapterId="01" onProjectSubmitted={onProjectSubmitted} />)

    await screen.findByLabelText('URL projektu *')
    await userEvent.type(
      screen.getByLabelText('URL projektu *'),
      'https://github.com/student/project'
    )
    await userEvent.click(screen.getByRole('button', { name: /Odevzdat projekt/ }))

    expect(await screen.findByText('Projekt schválen!')).toBeInTheDocument()
    expect(screen.getByText('Projekt splnuje zadani.')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(onProjectSubmitted).toHaveBeenCalledTimes(1)

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('+50 XP! 🎉'))
  })
})
