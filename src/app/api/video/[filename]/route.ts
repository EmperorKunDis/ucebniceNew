import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { stat } from 'fs/promises'

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const filename = params.filename
  // Ensure we are only reading from the allowed directory and prevent directory traversal
  const safeFilename = path.basename(filename)
  const videoPath = path.join('/data/videa', safeFilename)

  try {
    const stats = await stat(videoPath)
    if (!stats.isFile()) {
      return new NextResponse('Not found', { status: 404 })
    }

    const fileSize = stats.size
    const range = request.headers.get('range')

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunksize = end - start + 1
      const file = fs.createReadStream(videoPath, { start, end })

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
      }

      // In Node.js environment, we can return the stream directly
      // Type assertion is needed because Next.js types for BodyInit are Web Streams
      return new NextResponse(file as any, {
        status: 206,
        headers,
      })
    } else {
      const headers = {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
      }

      const file = fs.createReadStream(videoPath)

      return new NextResponse(file as any, {
        status: 200,
        headers,
      })
    }
  } catch (error) {
    console.error('Error serving video:', error)
    return new NextResponse('Video not found', { status: 404 })
  }
}
