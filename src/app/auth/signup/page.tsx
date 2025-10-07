'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to onboarding - registration is now part of the onboarding flow
    router.replace('/onboarding')
  }, [router])

  return null
}
