import type { Metadata } from 'next'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export const metadata: Metadata = {
  title: 'Registrace | Učebnice AI',
  description: 'Registrace do Učebnice AI a úvodní nastavení studijní cesty',
}

export default function SignUpPage() {
  return (
    <OnboardingFlow
      entryTitle="Registrace do Učebnice AI"
      entryDescription="Vytvoř si účet a nastav si studijní cestu v několika krátkých krocích"
    />
  )
}
