'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react'

interface Question {
  id: string
  order: number
  question: string
  options: string[]
  chapterTitle: string
}

interface TestData {
  milestone: number
  questions: Question[]
  projectDescription: string
  chapters: { id: string; title: string }[]
  alreadyPassed?: boolean
  score?: number
}

export default function MilestoneTestPage() {
  const params = useParams()
  const router = useRouter()
  const milestone = parseInt(params.milestone as string)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [testData, setTestData] = useState<TestData | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [projectCode, setProjectCode] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [result, setResult] = useState<{
    passed: boolean
    score: number
    questionsScore: number
    projectScore: number | null
    gemsEarned: number
    message: string
  } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTest()
  }, [milestone])

  async function fetchTest() {
    try {
      const res = await fetch(`/api/milestone-test?milestone=${milestone}`)
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
    setSubmitting(true)
    try {
      const res = await fetch('/api/milestone-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone,
          answers,
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
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Test již složen!</h1>
          <p className="text-gray-400 mb-2">Tento milestone test jsi již úspěšně složil.</p>
          <p className="text-2xl font-bold text-green-500 mb-6">Skóre: {testData.score}%</p>
          <Button onClick={() => router.push('/dashboard')}>Zpět na dashboard</Button>
        </Card>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center bg-gray-800/50">
          {result.passed ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-white mb-2">
            {result.passed ? '🎉 Gratulujeme!' : 'Test nesložen'}
          </h1>
          <p className="text-gray-400 mb-4">{result.message}</p>

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
              <span className="text-purple-400">+{result.gemsEarned} 💎</span>
            </div>
          )}

          <Button onClick={() => router.push('/dashboard')}>Zpět na dashboard</Button>
        </Card>
      </div>
    )
  }

  const question = testData?.questions[currentQuestion]
  const isLastQuestion = currentQuestion === (testData?.questions.length || 0) - 1
  const allAnswered = Object.keys(answers).length === testData?.questions.length

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Milestone Test: Kapitola {milestone}</h1>
        <p className="text-gray-400">
          {testData?.questions.length} otázek z kapitol {milestone - 9}-{milestone}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>
            Otázka {currentQuestion + 1} z {testData?.questions.length}
          </span>
          <span>{Object.keys(answers).length} zodpovězeno</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all"
            style={{
              width: `${((currentQuestion + 1) / (testData?.questions.length || 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      {question && (
        <Card className="p-6 bg-gray-800/50 mb-6">
          <div className="text-sm text-indigo-400 mb-2">{question.chapterTitle}</div>
          <h2 className="text-xl font-semibold text-white mb-4">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setAnswers({ ...answers, [question.id]: idx })}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  answers[question.id] === idx
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-gray-600 hover:border-gray-500 text-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation */}
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
            onClick={() => setCurrentQuestion(testData?.questions.length || 0)}
            disabled={!answers[question?.id || '']}
          >
            Přejít k projektu <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={!answers[question?.id || '']}
          >
            Další <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Project section */}
      {currentQuestion >= (testData?.questions.length || 0) && (
        <Card className="p-6 bg-gray-800/50 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">📝 Projekt</h2>
          <p className="text-gray-400 mb-4 whitespace-pre-line">{testData?.projectDescription}</p>

          <textarea
            value={projectCode}
            onChange={e => setProjectCode(e.target.value)}
            placeholder="Vlož svůj kód nebo odkaz na Colab notebook..."
            className="w-full h-48 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />

          <div className="mt-6 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentQuestion((testData?.questions.length || 1) - 1)}
            >
              Zpět k otázkám
            </Button>

            <Button
              onClick={submitTest}
              disabled={!allAnswered || submitting}
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Odesílám...
                </>
              ) : (
                'Odeslat test'
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
