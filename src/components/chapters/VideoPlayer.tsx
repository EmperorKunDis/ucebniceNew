'use client'

import { memo, useState } from 'react'
import { Box } from '@/components/ui'
import { AlertCircle, Download } from 'lucide-react'

interface VideoPlayerProps {
  videoFile: string
}

function VideoPlayerComponent({ videoFile }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false)
  const videoPath = `/api/video/${encodeURIComponent(videoFile)}`

  return (
    <Box className="overflow-hidden rounded-xl border border-white/10 bg-gray-950 shadow-2xl shadow-black/30">
      <div className="aspect-video bg-black">
        {hasError ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="rounded-full border border-red-400/30 bg-red-500/10 p-3">
              <AlertCircle className="h-8 w-8 text-red-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Video se nepodařilo načíst</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-gray-300">
                Soubor může být dočasně nedostupný nebo prohlížeč nepodporuje použitý kodek.
              </p>
            </div>
            <a
              href={videoPath}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition-colors hover:bg-sky-500/20"
            >
              <Download className="h-4 w-4" />
              Stáhnout video
            </a>
          </div>
        ) : (
          <video
            controls
            preload="metadata"
            className="h-full w-full bg-black object-contain"
            onError={() => setHasError(true)}
          >
            <source src={videoPath} type="video/mp4" />
            Video se nepodařilo načíst.
          </video>
        )}
      </div>

      {!hasError && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-sm text-gray-300">
          <span>Pokud přehrávání selže, stáhni si video přímo.</span>
          <a href={videoPath} download className="font-semibold text-sky-300 hover:text-sky-200">
            Stáhnout video
          </a>
        </div>
      )}
    </Box>
  )
}

// Memoize to prevent unnecessary re-renders when videoFile doesn't change
export const VideoPlayer = memo(VideoPlayerComponent)
