'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  User,
  Target,
  Sparkles,
  Rocket,
  Brain,
  Code,
  Zap,
  Award,
  Briefcase,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'
import { GreySurface } from '@/components/ui/grey-surface'
import { Lightning } from '@/components/ui/lightning'
import { useUserStore } from '@/store/user-store'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { Grid } from '@/components/ui/grid'
import { Button } from '@/components/ui/button'
import {
  nameSchema,
  emailSchema,
  passwordSchema,
  onboardingGoalSchema,
  onboardingExperienceSchema,
} from '@/lib/validation-schemas'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

export function OnboardingFlow() {
  const router = useRouter()
  const { setUsername, completeOnboarding } = useUserStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [goal, setGoal] = useState<string>('')
  const [experience, setExperience] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [registrationError, setRegistrationError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Vítej v Učebnici AI! 🎆',
      description: 'Začni svou cestu k mistrovství v programování',
      icon: <Sparkles className="w-8 h-8 text-purple-400" />,
      content: (
        <Stack gap={6} align="center">
          <Box className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Rocket className="w-16 h-16 text-white" />
          </Box>
          <Box as="p" className="text-lg text-gray-300 text-center">
            Připrav se na interaktivní cestu světem programování s umělou inteligencí jako tvým
            průvodcem!
          </Box>
          <Grid columns={3} gap={4} className="text-center">
            <Stack gap={1} align="center">
              <Box className="text-3xl font-bold text-purple-400">60+</Box>
              <Box as="p" className="text-sm text-gray-400">
                Interaktivních lekcí
              </Box>
            </Stack>
            <Stack gap={1} align="center">
              <Box className="text-3xl font-bold text-pink-400">AI</Box>
              <Box as="p" className="text-sm text-gray-400">
                Asistent 24/7
              </Box>
            </Stack>
            <Stack gap={1} align="center">
              <Box className="text-3xl font-bold text-yellow-400">XP</Box>
              <Box as="p" className="text-sm text-gray-400">
                Gamifikace
              </Box>
            </Stack>
          </Grid>
        </Stack>
      ),
    },
    {
      id: 1,
      title: 'Jak se jmenuješ? 👋',
      description: 'Pojďme se poznat',
      icon: <User className="w-8 h-8 text-purple-400" />,
      content: (
        <Stack gap={6}>
          <Stack gap={4} align="center">
            <Box className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </Box>
          </Stack>
          <Stack gap={2}>
            <Box as="label" className="block text-sm font-medium text-gray-400">
              Tvé jméno nebo přezdívka
            </Box>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Např. Jan, CodeMaster, PyNinja..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all"
              autoFocus
            />
          </Stack>
          <Box as="p" className="text-sm text-gray-400 text-center">
            Toto jméno se bude zobrazovat v žebříčcích a na tvém profilu
          </Box>
        </Stack>
      ),
    },
    {
      id: 2,
      title: 'Vytvoř si účet 📧',
      description: 'Zaregistruj se a ulož svůj postup',
      icon: <Mail className="w-8 h-8 text-purple-400" />,
      content: (
        <Box
          as="form"
          onSubmit={e => {
            e.preventDefault()
            if (canProceed()) handleNext()
          }}
        >
          <Stack gap={6}>
            {registrationError && (
              <Box className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <Box as="p" className="text-red-300 text-sm">
                  {registrationError}
                </Box>
              </Box>
            )}
            <Stack gap={4}>
              <Stack gap={2}>
                <Box as="label" className="block text-sm font-medium text-gray-400">
                  Email
                </Box>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tvuj@email.cz"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all"
                />
              </Stack>
              <Stack gap={2}>
                <Box as="label" className="block text-sm font-medium text-gray-400">
                  Heslo
                </Box>
                <Box className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimálně 6 znaků"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all pr-12"
                  />
                  <Box
                    as="button"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Box>
                </Box>
              </Stack>
              <Stack gap={2}>
                <Box as="label" className="block text-sm font-medium text-gray-400">
                  Potvrzení hesla
                </Box>
                <Box className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Zadej heslo znovu"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all pr-12"
                  />
                  <Box
                    as="button"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </Box>
                </Box>
              </Stack>
            </Stack>
            <Box as="p" className="text-sm text-gray-400 text-center">
              Tvé údaje jsou v bezpečí a slouží pouze pro ukládání tvého postupu
            </Box>
          </Stack>
        </Box>
      ),
    },
    {
      id: 3,
      title: 'Jaký je tvůj cíl? 🎯',
      description: 'Pomůže nám připravit ideální cestu',
      icon: <Target className="w-8 h-8 text-purple-400" />,
      content: (
        <Stack gap={4}>
          <Box as="p" className="text-gray-300">
            Co tě přivedlo k programování? Vyber svůj hlavní cíl:
          </Box>
          <Stack gap={3}>
            {[
              {
                value: 'career',
                label: 'Změna kariéry',
                icon: <Briefcase className="w-5 h-5" />,
                description: 'Chci se stát profesionálním vývojářem',
              },
              {
                value: 'skills',
                label: 'Nové dovednosti',
                icon: <Brain className="w-5 h-5" />,
                description: 'Chci se naučit programovat pro své projekty',
              },
              {
                value: 'ai',
                label: 'AI a ML',
                icon: <Zap className="w-5 h-5" />,
                description: 'Zajímá mě umělá inteligence a strojové učení',
              },
              {
                value: 'fun',
                label: 'Zábava a kreativita',
                icon: <Sparkles className="w-5 h-5" />,
                description: 'Chci vytvářet cool věci a bavit se',
              },
            ].map(option => (
              <Box
                key={option.value}
                as="button"
                onClick={() => setGoal(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  goal === option.value
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <Stack direction="horizontal" gap={3} align="start">
                  <Box className="text-purple-400">{option.icon}</Box>
                  <Stack gap={1}>
                    <Box as="h3" className="font-semibold text-white">
                      {option.label}
                    </Box>
                    <Box as="p" className="text-sm text-gray-400">
                      {option.description}
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>
      ),
    },
    {
      id: 4,
      title: 'Jaká je tvá zkušenost? 💪',
      description: 'Přizpůsobíme tempo tvým znalostem',
      icon: <Code className="w-8 h-8 text-purple-400" />,
      content: (
        <Stack gap={4}>
          <Box as="p" className="text-gray-300">
            Už jsi někdy programoval/a?
          </Box>
          <Stack gap={3}>
            {[
              {
                value: 'beginner',
                label: 'Úplný začátečník',
                icon: '🌱',
                description: 'Nikdy jsem neprogramoval/a',
              },
              {
                value: 'some',
                label: 'Mám základy',
                icon: '🌳',
                description: 'Zkusil/a jsem pár tutoriálů nebo kurzů',
              },
              {
                value: 'intermediate',
                label: 'Středně pokročilý',
                icon: '🌲',
                description: 'Umím základy a chci se zlepšit',
              },
              {
                value: 'advanced',
                label: 'Pokročilý',
                icon: '🌴',
                description: 'Programuji pravidelně, chci se specializovat',
              },
            ].map(option => (
              <Box
                key={option.value}
                as="button"
                onClick={() => setExperience(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  experience === option.value
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <Stack direction="horizontal" gap={3} align="start">
                  <Box className="text-2xl">{option.icon}</Box>
                  <Stack gap={1}>
                    <Box as="h3" className="font-semibold text-white">
                      {option.label}
                    </Box>
                    <Box as="p" className="text-sm text-gray-400">
                      {option.description}
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>
      ),
    },
    {
      id: 5,
      title: 'Vše připraveno! 🎉',
      description: 'Začneme tvou cestu',
      icon: <Award className="w-8 h-8 text-yellow-400" />,
      content: (
        <Stack gap={6} align="center">
          <Box className="relative">
            <Box className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl">
              🚀
            </Box>
            <motion.div
              className="absolute -inset-4"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {[...Array(8)].map((_, i) => (
                <Box
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateX(80px) translateY(-50%)`,
                  }}
                />
              ))}
            </motion.div>
          </Box>

          <Stack gap={2} align="center">
            <Box as="h2" className="text-2xl font-bold text-white">
              Ahoj {name || 'Student'}! 👋
            </Box>
            <Box as="p" className="text-gray-300">
              Tvá cesta k mistrovství v programování začíná právě teď!
            </Box>
          </Stack>

          <Box className="bg-white/10 rounded-lg p-4 max-w-md mx-auto">
            <Stack gap={4}>
              <Box as="h3" className="font-semibold text-white">
                Co tě čeká:
              </Box>
              <Stack gap={2} as="ul" className="text-sm text-gray-300">
                <Stack direction="horizontal" gap={2} align="center" as="li">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <Box as="span">První XP body za dokončení onboardingu</Box>
                </Stack>
                <Stack direction="horizontal" gap={2} align="center" as="li">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <Box as="span">AI asistent připravený pomoci 24/7</Box>
                </Stack>
                <Stack direction="horizontal" gap={2} align="center" as="li">
                  <Award className="w-4 h-4 text-pink-400" />
                  <Box as="span">Systém odznaků a úrovní pro motivaci</Box>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      ),
    },
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Validate name with Zod
        return nameSchema.safeParse(name.trim()).success
      case 2: {
        // Validate email and password with Zod
        const emailValid = emailSchema.safeParse(email.trim()).success
        const passwordValid = passwordSchema.safeParse(password).success
        const passwordsMatch = password === confirmPassword
        return emailValid && passwordValid && passwordsMatch
      }
      case 3:
        // Validate goal
        return onboardingGoalSchema.safeParse({ goal }).success
      case 4:
        // Validate experience
        return onboardingExperienceSchema.safeParse({ experience }).success
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (!canProceed()) return

    setIsAnimating(true)

    // Handle registration step
    if (currentStep === 2) {
      try {
        setRegistrationError('')

        // Generate username from name (remove spaces, special chars, lowercase)
        const username =
          name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20) || 'user' + Date.now()

        // Call registration API
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            username,
            password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setRegistrationError(data.error || 'Registrace selhala')
          setIsAnimating(false)
          return
        }

        // Automatically sign in after successful registration
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (signInResult?.error) {
          setRegistrationError('Registrace proběhla, ale přihlášení selhalo')
          setIsAnimating(false)
          return
        }

        // Continue to next step
        setTimeout(() => {
          setCurrentStep(currentStep + 1)
          setIsAnimating(false)
        }, 300)
      } catch (error) {
        console.error('Registration error:', error)
        setRegistrationError('Něco se pokazilo. Zkuste to znovu.')
        setIsAnimating(false)
      }
      return
    }

    if (currentStep === steps.length - 1) {
      // Complete onboarding - persist to database
      try {
        const response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal,
            experience,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          toast.error(data.error || 'Nepodařilo se dokončit onboarding')
          setIsAnimating(false)
          return
        }

        // Update local state
        setUsername(name)
        completeOnboarding()

        // Show success message
        toast.success(`Gratulujeme! +${data.xpEarned} XP a nový odznak!`)

        // Navigate to chapters
        setTimeout(() => {
          router.push('/chapters')
        }, 1000)
      } catch (error) {
        console.error('Error completing onboarding:', error)
        toast.error('Něco se pokazilo. Zkuste to znovu.')
        setIsAnimating(false)
      }
    } else {
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleBack = () => {
    if (currentStep === 0) {
      // On first step, go back to homepage
      router.push('/')
    } else {
      // On other steps, go to previous step
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  return (
    <Box className="min-h-screen relative flex items-center justify-center p-4">
      <Lightning />

      <Stack gap={8} className="relative z-10 w-full max-w-2xl">
        {/* Progress bar */}
        <Box>
          <Stack direction="horizontal" justify="between" align="center" className="mb-2">
            {steps.map((step, index) => (
              <Stack
                key={step.id}
                direction="horizontal"
                align="center"
                className={index === steps.length - 1 ? '' : 'flex-1'}
              >
                <Box
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    index <= currentStep ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </Box>
                {index < steps.length - 1 && (
                  <Box
                    className={`flex-1 h-1 mx-2 transition-all ${
                      index < currentStep ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Content */}
        <GreySurface className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: isAnimating ? 20 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAnimating ? -20 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Stack gap={8}>
                <Stack gap={4} align="center">
                  <Box className="inline-block">{steps[currentStep]?.icon}</Box>
                  <Stack gap={2} align="center">
                    <Box as="h1" className="text-3xl font-bold text-white">
                      {steps[currentStep]?.title}
                    </Box>
                    <Box as="p" className="text-gray-400">
                      {steps[currentStep]?.description}
                    </Box>
                  </Stack>
                </Stack>

                <Box>{steps[currentStep]?.content}</Box>

                {/* Navigation buttons */}
                <Stack direction="horizontal" justify="between">
                  <Button onClick={handleBack} variant="ghost" size="lg">
                    Zpět
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    variant="primary"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {currentStep === steps.length - 1 ? 'Začít učení' : 'Pokračovat'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Stack>
              </Stack>
            </motion.div>
          </AnimatePresence>
        </GreySurface>
      </Stack>
    </Box>
  )
}
