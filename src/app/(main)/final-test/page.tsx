'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Trophy, Award, ArrowRight } from 'lucide-react'

interface Question {
  id: string
  question: string
  type: string
}

interface Project {
  id: number
  title: string
  description: string
}

interface TestData {
  questions: Question[]
  projects: Project[]
  instructions: string
  alreadyPassed?: boolean
  score?: number
}

export default function FinalTestPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [testData, setTestData] = useState<TestData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [projectCode, setProjectCode] = useState('')
  const [currentStep, setCurrentStep] = useState<'instructions' | 'questions' | 'project'>(
    'instructions'
  )
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [result, setResult] = useState<{
    passed: boolean
    score: number
    questionsScore: number
    projectScore: number | null
    gemsEarned: number
    message: string
    certificateReady?: boolean
  } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTest()
  }, [])

  async function fetchTest() {
    try {
      const res = await fetch('/api/final-test')
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Chyba při načítání testu')
        return
      }

      setTestData(data)
    } catch {
      setError('Nepodařilo se načíst test')
    } finally {
      setLoading(false)
    }
  }

  async function submitTest() {
    if (!selectedProject) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/final-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          selectedProjectId: selectedProject,
          projectCode: projectCode || undefined,
        }),
      })

      const data = await res.json()
      setResult(data)
    } catch {
      setError('Nepodařilo se odeslat test')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center bg-gray-800/50">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Chyba</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>Zpět na dashboard</Button>
        </Card>
      </div>
    )
  }

  if (testData?.alreadyPassed) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center bg-gray-800/50">
          <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Již jsi absolvent!</h1>
          <p className="text-gray-400 mb-4">Finální test jsi již úspěšně složil.</p>
          <p className="text-2xl font-bold text-green-500 mb-6">Skóre: {testData.score}%</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/certificate')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
            >
              <Award className="w-4 h-4 mr-2" /> Zobrazit certifikát
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Zpět na dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center bg-gray-800/50">
          {result.passed ? (
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold text-white mb-2">
            {result.passed ? '🎓 Gratulujeme, absolvente!' : 'Test nesložen'}
          </h1>
          <p className="text-gray-400 mb-6">{result.message}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400">Celkové skóre</div>
              <div className="text-3xl font-bold text-white">{result.score}%</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400">Otázky</div>
              <div className="text-3xl font-bold text-white">{result.questionsScore}%</div>
            </div>
            {result.projectScore !== null && (
              <div className="bg-gray-700/50 rounded-lg p-4 col-span-2">
                <div className="text-sm text-gray-400">Projekt</div>
                <div className="text-3xl font-bold text-white">{result.projectScore}%</div>
              </div>
            )}
          </div>

          {result.gemsEarned > 0 && (
            <div className="bg-purple-500/20 rounded-lg p-4 mb-6">
              <span className="text-2xl text-purple-400">+{result.gemsEarned} 💎</span>
            </div>
          )}

          {result.certificateReady && (
            <Button
              onClick={() => router.push('/certificate')}
              className="w-full mb-4 bg-gradient-to-r from-yellow-500 to-orange-500"
            >
              <Award className="w-4 h-4 mr-2" /> Stáhnout certifikát
            </Button>
          )}

          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            Zpět na dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // Instructions
  if (currentStep === 'instructions') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card className="p-8 bg-gray-800/50">
          <div className="text-center mb-8">
            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Finální test</h1>
            <p className="text-gray-400">Poslední krok k certifikátu</p>
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            <pre className="whitespace-pre-wrap text-gray-300 bg-gray-700/50 p-4 rounded-lg">
              {testData?.instructions}
            </pre>
          </div>

          <Button
            onClick={() => setCurrentStep('questions')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            Začít test <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    )
  }

  // Questions
  if (currentStep === 'questions') {
    const question = testData?.questions[currentQuestion]
    const isLastQuestion = currentQuestion === (testData?.questions.length || 0) - 1

    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Finální test</h1>
          <p className="text-gray-400">
            Otázka {currentQuestion + 1} z {testData?.questions.length}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{
                width: `${((currentQuestion + 1) / (testData?.questions.length || 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {question && (
          <Card className="p-6 bg-gray-800/50 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">{question.question}</h2>

            <textarea
              value={answers[question.id] || ''}
              onChange={e => setAnswers({ ...answers, [question.id]: e.target.value })}
              placeholder="Napiš svou odpověď... (min. 50 znaků)"
              className="w-full h-40 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {(answers[question.id] || '').length} znaků
            </div>
          </Card>
        )}

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Předchozí
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={() => setCurrentStep('project')}
              disabled={(answers[question?.id || ''] || '').length < 50}
            >
              Pokračovat k projektu <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={(answers[question?.id || ''] || '').length < 50}
            >
              Další <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Project selection
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Vyber si projekt</h1>
        <p className="text-gray-400">Vyber jeden ze tří projektů a implementuj ho</p>
      </div>

      <div className="grid gap-4 mb-6">
        {testData?.projects.map(project => (
          <Card
            key={project.id}
            onClick={() => setSelectedProject(project.id)}
            className={`p-6 cursor-pointer transition-all ${
              selectedProject === project.id
                ? 'bg-indigo-500/20 border-indigo-500'
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              {selectedProject === project.id && (
                <CheckCircle className="w-5 h-5 inline mr-2 text-green-500" />
              )}
              {project.title}
            </h3>
            <p className="text-gray-400 whitespace-pre-line">{project.description}</p>
          </Card>
        ))}
      </div>

      {selectedProject && (
        <Card className="p-6 bg-gray-800/50 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tvůj kód</h3>
          <textarea
            value={projectCode}
            onChange={e => setProjectCode(e.target.value)}
            placeholder="Vlož svůj kód nebo odkaz na GitHub/Colab..."
            className="w-full h-48 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setCurrentStep('questions')}>
          Zpět k otázkám
        </Button>

        <Button
          onClick={submitTest}
          disabled={!selectedProject || submitting}
          className="bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Odesílám...
            </>
          ) : (
            <>
              Odeslat finální test <Trophy className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
