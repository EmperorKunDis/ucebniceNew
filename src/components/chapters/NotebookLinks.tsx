'use client'

import { memo } from 'react'
import { Chapter } from '@/data/chapters'
import { Box, Button, Stack } from '@/components/ui'
import { BookOpen, Download, Rocket, ExternalLink } from 'lucide-react'
import { GITHUB_CONFIG } from '@/lib/constants'

interface NotebookLinksProps {
  chapter: Chapter
}

function NotebookLinksComponent({ chapter }: NotebookLinksProps) {
  // Colab notebooks are in the root of the GitHub repo
  const colabUrl = chapter.colabNotebook
    ? `https://colab.research.google.com/github/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/${chapter.colabNotebook}`
    : null

  // Direct GitHub raw file download
  const downloadUrl = chapter.colabNotebook
    ? `https://raw.githubusercontent.com/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${chapter.colabNotebook}`
    : null

  return (
    <Box className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6">
      <Stack className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-100">Interaktivní materiály</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* NotebookLM */}
          {chapter.notebookLMUrl && (
            <a
              href={chapter.notebookLMUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button
                variant="secondary"
                className="w-full justify-start gap-3 hover:bg-blue-600/20 hover:border-blue-500"
              >
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="flex-1 text-left">NotebookLM sešit</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
              </Button>
            </a>
          )}

          {/* Google Colab */}
          {colabUrl && (
            <a href={colabUrl} target="_blank" rel="noopener noreferrer" className="group">
              <Button
                variant="secondary"
                className="w-full justify-start gap-3 hover:bg-orange-600/20 hover:border-orange-500"
              >
                <Rocket className="w-5 h-5 text-orange-400" />
                <span className="flex-1 text-left">Spustit v Colab</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-400" />
              </Button>
            </a>
          )}

          {/* Stáhnout notebook */}
          {downloadUrl && (
            <a href={downloadUrl} download className="group">
              <Button
                variant="secondary"
                className="w-full justify-start gap-3 hover:bg-green-600/20 hover:border-green-500"
              >
                <Download className="w-5 h-5 text-green-400" />
                <span className="flex-1 text-left">Stáhnout sešit</span>
              </Button>
            </a>
          )}
        </div>

        {/* Informace pro chybějící odkazy */}
        {!chapter.notebookLMUrl && !chapter.colabNotebook && (
          <p className="text-gray-400 text-sm italic">
            Pro tuto kapitolu zatím nejsou k dispozici interaktivní materiály.
          </p>
        )}
      </Stack>
    </Box>
  )
}

// Memoize to prevent unnecessary re-renders
export const NotebookLinks = memo(NotebookLinksComponent)
