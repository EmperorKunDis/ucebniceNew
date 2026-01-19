import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.error('Unauthorized: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Profile image upload request from user:', session.user.id)

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('No file provided in request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg' // Default to jpg if no extension
    // Sanitize extension to prevent path traversal
    const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, '')
    const filename = `${session.user.id}-${timestamp}.${safeExtension}`

    // Create avatars directory if it doesn't exist
    const avatarsDir = join(process.cwd(), 'public', 'avatars')
    try {
      if (!existsSync(avatarsDir)) {
        await mkdir(avatarsDir, { recursive: true })
        console.log('Created avatars directory:', avatarsDir)
      }
    } catch (dirError) {
      console.error('Error creating avatars directory:', dirError)
      throw new Error('Failed to create upload directory. Please check server permissions.')
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(avatarsDir, filename)

    try {
      await writeFile(filepath, buffer)
      console.log('File saved successfully:', filepath)
    } catch (writeError) {
      console.error('Error writing file:', writeError)
      throw new Error('Failed to save file. Please check server permissions.')
    }

    // Update user profile in database
    const imageUrl = `/avatars/${filename}`
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: imageUrl },
      })
      console.log('User profile updated successfully:', session.user.id, imageUrl)
    } catch (dbError) {
      console.error('Error updating user profile in database:', dbError)
      // Try to clean up the uploaded file if database update fails
      try {
        const filepath = join(process.cwd(), 'public', 'avatars', filename)
        const { unlink } = await import('fs/promises')
        await unlink(filepath)
        console.log('Cleaned up uploaded file after database error')
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError)
      }
      throw new Error('Failed to update profile in database. Please try again.')
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Profile image uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading profile image:', error)

    // Provide more specific error messages
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })

      // Check for common errors
      if (error.message.includes('ENOENT') || error.message.includes('permission')) {
        return NextResponse.json(
          { error: 'File system error. Please check server permissions.' },
          { status: 500 }
        )
      }

      if (error.message.includes('database') || error.message.includes('prisma')) {
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to upload image. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove profile image from database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile image removed successfully',
    })
  } catch (error) {
    console.error('Error removing profile image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
