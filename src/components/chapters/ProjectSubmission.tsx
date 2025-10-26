'use client'

import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Upload, Zap, CheckCircle, Loader2 } from 'lucide-react'
import { GreySurface } from '@/components/ui/grey-surface'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface ProjectSubmissionProps {
  chapterId: string
}

export const ProjectSubmission = memo(function ProjectSubmission({
  chapterId,
}: ProjectSubmissionProps) {
  const [projectUrl, setProjectUrl] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)

  useEffect(() => {
    // Check if user has already submitted a project
    async function checkSubmission() {
      try {
        const response = await fetch(`/api/projects/submit?chapterId=${chapterId}`)
        const data = await response.json()

        if (data.submission) {
          setExistingSubmission(data.submission)
          setProjectUrl(data.submission.projectUrl)
          setDescription(data.submission.description || '')
          setSubmitted(true)
        }
      } catch (error) {
        console.error('Error checking submission:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSubmission()
  }, [chapterId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectUrl) {
      toast.error('Prosím vyplň URL projektu')
      return
    }

    // Validate URL
    try {
      new URL(projectUrl)
    } catch {
      toast.error('Prosím zadej platnou URL adresu')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId,
          projectUrl,
          description,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        setExistingSubmission({ projectUrl, description })
        toast.success(data.message)

        if (data.xpEarned > 0) {
          toast.success(`+${data.xpEarned} XP! 🎉`)
        }
      } else {
        toast.error(data.error || 'Něco se pokazilo')
      }
    } catch (error) {
      console.error('Error submitting project:', error)
      toast.error('Chyba při odesílání projektu')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <GreySurface className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      </GreySurface>
    )
  }

  return (
    <GreySurface className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Upload className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Odevzdej svůj projekt</h3>
        </div>
        <p className="text-gray-400 text-sm">
          Sdílej svou implementaci této kapitoly a získej třetí hvězdičku! 🌟
        </p>
      </div>

      {submitted && existingSubmission ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">Projekt odeslán!</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-400 block mb-1">URL projektu:</label>
                <a
                  href={existingSubmission.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-2 break-all"
                >
                  {existingSubmission.projectUrl}
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>

              {existingSubmission.description && (
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Popis:</label>
                  <p className="text-white">{existingSubmission.description}</p>
                </div>
              )}
            </div>
          </div>

          <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full">
            Aktualizovat projekt
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">URL projektu *</label>
            <input
              type="url"
              value={projectUrl}
              onChange={e => setProjectUrl(e.target.value)}
              placeholder="https://github.com/your-username/project nebo https://colab.research.google.com/..."
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              GitHub repozitář, Google Colab notebook, nebo jiný odkaz na tvůj projekt
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">
              Popis (volitelné)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Krátký popis toho, co jsi implementoval..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || !projectUrl}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Odesílám...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Odevzdat projekt
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 justify-center text-sm text-gray-400">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Získej +50 XP a třetí hvězdičku!</span>
          </div>
        </form>
      )}
    </GreySurface>
  )
})
