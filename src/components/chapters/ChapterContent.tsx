'use client'

import { useState, useEffect } from 'react'
import { Box } from '@/components/layout'
import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChapterContentProps {
  content: string
  type: 'text' | 'lecture'
}

export function ChapterContent({ content, type }: ChapterContentProps) {
  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cesta k souboru - vždy z /prednasky
        const response = await fetch(`/prednasky/${content}`)

        if (!response.ok) {
          throw new Error(`Nepodařilo se načíst obsah: ${response.status}`)
        }

        const text = await response.text()
        setMarkdownContent(text)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Neznámá chyba')
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [content, type])

  if (loading) {
    return (
      <Box className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box className="text-red-400 py-8 text-center bg-red-900/20 rounded-lg p-6 border border-red-900/50">
        <h3 className="text-lg font-semibold mb-2">Chyba při načítání obsahu</h3>
        <p className="text-sm text-gray-400 mb-4">
          Nepodařilo se načíst soubor:{' '}
          <code className="bg-black/30 px-2 py-1 rounded">{content}</code>
        </p>
        <p className="text-sm opacity-80">{error}</p>
        <div className="mt-4 text-xs text-gray-500">
          Zkontrolujte, zda soubor existuje ve složce <code>public/prednasky</code>
        </div>
      </Box>
    )
  }

  return (
    <Box className="mx-auto max-w-3xl text-[1.02rem]">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 text-3xl font-bold leading-tight text-white">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-10 text-2xl font-semibold leading-tight text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-7 text-xl font-semibold leading-tight text-gray-100">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-5 leading-8 text-gray-200">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-5 list-disc space-y-2 pl-6 leading-8 text-gray-200">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 list-decimal space-y-2 pl-6 leading-8 text-gray-200">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => (
            <strong className="text-gray-100 font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="text-gray-200 italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-lg border-l-4 border-purple-400 bg-purple-500/10 py-3 pl-5 text-gray-100">
              {children}
            </blockquote>
          ),
          code: ({ inline, children }: any) => {
            return inline ? (
              <code className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-sm text-pink-200">
                {children}
              </code>
            ) : (
              <pre className="mb-6 overflow-x-auto rounded-lg border border-white/10 bg-gray-950 p-4">
                <code className="font-mono text-sm leading-6 text-gray-200">{children}</code>
              </pre>
            )
          },
          hr: () => <hr className="my-8 border-white/10" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-300 underline decoration-sky-300/40 underline-offset-4 hover:text-sky-200"
            >
              {children}
            </a>
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </Box>
  )
}
