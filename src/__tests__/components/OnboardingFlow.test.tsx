import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

jest.mock('@/components/ui/lightning', () => ({
  Lightning: () => null,
}))

async function goToRegistrationStep() {
  await userEvent.click(screen.getByRole('button', { name: /Pokračovat/ }))
  await screen.findByRole('heading', { name: /Jak se jmenuješ/ })

  await userEvent.type(screen.getByLabelText('Tvé jméno nebo přezdívka'), 'Test User')
  await userEvent.click(screen.getByRole('button', { name: /Pokračovat/ }))

  await screen.findByRole('heading', { name: /Vytvoř si účet/ })
}

describe('OnboardingFlow', () => {
  let fetchMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    fetchMock = jest.fn()
    global.fetch = fetchMock
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  })

  it('associates registration labels with their form controls', async () => {
    render(<OnboardingFlow />)

    await goToRegistrationStep()

    expect(screen.getByLabelText('Email')).toHaveAttribute('name', 'email')
    expect(screen.getByLabelText('Heslo')).toHaveAttribute('name', 'password')
    expect(screen.getByLabelText('Potvrzení hesla')).toHaveAttribute('name', 'confirmPassword')
  })

  it('clears registration errors when the email changes', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Email už je registrovaný' }),
    })
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true })

    render(<OnboardingFlow />)

    await goToRegistrationStep()

    await userEvent.type(screen.getByLabelText('Email'), 'used@example.com')
    await userEvent.type(screen.getByLabelText('Heslo'), 'Password1')
    await userEvent.type(screen.getByLabelText('Potvrzení hesla'), 'Password1')
    await userEvent.click(screen.getByRole('button', { name: /Pokračovat/ }))

    expect(await screen.findByText('Email už je registrovaný')).toBeInTheDocument()

    await userEvent.clear(screen.getByLabelText('Email'))
    await userEvent.type(screen.getByLabelText('Email'), 'new@example.com')

    await waitFor(() =>
      expect(screen.queryByText('Email už je registrovaný')).not.toBeInTheDocument()
    )
  })
})
