'use client'

import ReactMarkdown from 'react-markdown'
import { BookOpen, ExternalLink, FileCode2, Rocket } from 'lucide-react'
import { VideoPlayer } from '@/components/chapters/VideoPlayer'
import { GITHUB_CONFIG } from '@/lib/constants'

interface LessonArticleProps {
  content?: string | null
  videoFile?: string | null
  notebookLMUrl?: string | null
  colabNotebook?: string | null
  projectDescription?: string | null
  showContentPlaceholder?: boolean
}

function getColabUrl(colabNotebook: string) {
  if (/^https?:\/\//i.test(colabNotebook)) return colabNotebook

  return `https://colab.research.google.com/github/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/${colabNotebook}`
}

export function LessonArticle({
  content,
  videoFile,
  notebookLMUrl,
  colabNotebook,
  projectDescription,
  showContentPlaceholder = true,
}: LessonArticleProps) {
  const hasResources = Boolean(notebookLMUrl || colabNotebook)

  return (
    <div className="space-y-8">
      {videoFile && (
        <section aria-labelledby="lesson-video-heading" className="space-y-3">
          <h2 id="lesson-video-heading" className="text-xl font-bold text-white">
            Video lekce
          </h2>
          <VideoPlayer videoFile={videoFile} />
        </section>
      )}

      {(content?.trim() || showContentPlaceholder) && (
        <article className="rounded-2xl border border-white/10 bg-gray-950/55 p-5 shadow-2xl shadow-black/20 sm:p-8">
          {content?.trim() ? (
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
                  <h3 className="mb-3 mt-7 text-xl font-semibold text-gray-100">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-5 leading-8 text-gray-200">{children}</p>,
                ul: ({ children }) => (
                  <ul className="mb-5 list-disc space-y-2 pl-6 leading-8 text-gray-200">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-5 list-decimal space-y-2 pl-6 leading-8 text-gray-200">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-6 rounded-r-xl border-l-4 border-purple-400 bg-purple-500/10 py-3 pl-5 text-gray-100">
                    {children}
                  </blockquote>
                ),
                pre: ({ children }) => (
                  <pre className="mb-6 overflow-x-auto rounded-xl border border-white/10 bg-gray-950 p-4 text-sm leading-6 text-gray-200">
                    {children}
                  </pre>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-sm text-[#44d8ed]">
                    {children}
                  </code>
                ),
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
                hr: () => <hr className="my-8 border-white/10" />,
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <div className="py-8 text-center">
              <FileCode2 className="mx-auto mb-4 h-10 w-10 text-purple-300" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-white">Obsah lekce se připravuje</h2>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Jakmile bude publikovaný Markdown obsah dostupný, zobrazí se na tomto místě.
              </p>
            </div>
          )}
        </article>
      )}

      {hasResources && (
        <section
          aria-labelledby="lesson-resources-heading"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-sky-300" aria-hidden="true" />
            <h2 id="lesson-resources-heading" className="text-xl font-bold text-white">
              Interaktivní materiály
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {notebookLMUrl && (
              <a
                href={notebookLMUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 font-semibold text-sky-100 transition hover:bg-sky-500/20"
              >
                <BookOpen className="h-5 w-5" aria-hidden="true" />
                <span className="flex-1">Otevřít NotebookLM</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {colabNotebook && (
              <a
                href={getColabUrl(colabNotebook)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 font-semibold text-orange-100 transition hover:bg-orange-500/20"
              >
                <Rocket className="h-5 w-5" aria-hidden="true" />
                <span className="flex-1">Spustit v Google Colab</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </section>
      )}

      {projectDescription && (
        <section className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white">Projekt kapitoly</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-200">{projectDescription}</p>
        </section>
      )}
    </div>
  )
}
