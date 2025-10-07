'use client'

import { memo } from 'react'
import { Box } from '@/components/ui'
import { Play, AlertCircle } from 'lucide-react'

interface VideoPlayerProps {
  videoFile: string
}

function VideoPlayerComponent({ videoFile }: VideoPlayerProps) {
  // Cesta k video souboru
  const videoPath = `/videa/${videoFile}`

  return (
    <Box className="relative rounded-lg overflow-hidden bg-gray-800">
      <div className="aspect-video">
        <video
          controls
          className="w-full h-full object-contain bg-black"
          poster="/video-poster.jpg"
        >
          <source src={videoPath} type="video/mp4" />
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p>Váš prohlížeč nepodporuje přehrávání videa.</p>
            <a
              href={videoPath}
              download
              className="mt-4 text-blue-400 hover:text-blue-300 underline"
            >
              Stáhnout video
            </a>
          </div>
        </video>
      </div>

      {/* Overlay s play buttonem před spuštěním */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity bg-black/20">
        <div className="bg-blue-600 rounded-full p-4">
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </div>
      </div>
    </Box>
  )
}

// Memoize to prevent unnecessary re-renders when videoFile doesn't change
export const VideoPlayer = memo(VideoPlayerComponent)
