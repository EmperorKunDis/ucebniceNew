'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/user-store'
import { useSession } from 'next-auth/react'

interface ProfilePhotoUploadProps {
  currentImage?: string | null
  userName?: string
  onUpload?: (file: File) => Promise<void>
}

export function ProfilePhotoUpload({
  currentImage,
  userName = 'Uživatel',
  onUpload,
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { setUser } = useUserStore()
  const { data: session, update } = useSession()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    try {
      if (onUpload) {
        await onUpload(file)
      } else {
        // Default upload implementation
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/user/profile-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
          const errorMessage =
            errorData.error || `Upload failed: ${response.status} ${response.statusText}`
          console.error('Upload error:', errorMessage, errorData)
          throw new Error(errorMessage)
        }

        const data = await response.json()

        // Update user store with new avatar
        if (session?.user) {
          setUser({
            userId: session.user.id,
            username: session.user.username || session.user.name || 'User',
            email: session.user.email || '',
            avatar: data.imageUrl,
          })
        }

        // Update NextAuth session
        await update({ ...session, user: { ...session?.user, image: data.imageUrl } })
      }
    } catch (error) {
      console.error('Upload failed:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Nepodařilo se nahrát obrázek. Zkuste to prosím znovu.'
      alert(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
      {/* Kruhové pole pro profilovku - nyní jako label pro input */}
      <label className="relative group cursor-pointer block">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <motion.div className="relative" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {/* Gradient border */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 p-1 shadow-lg shadow-purple-500/50">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden relative">
              {currentImage || previewUrl ? (
                <>
                  <img
                    src={previewUrl || currentImage || ''}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <span className="text-xs text-white">Nahrávám...</span>
                      </div>
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400 mb-2"></div>
                      <span className="text-xs font-medium">Nahrávám...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-10 h-10 mb-2" />
                      <span className="text-xs font-medium">Přidat</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Popisek pod avatarem */}
          {!currentImage && !previewUrl && !isUploading && (
            <p className="text-sm text-gray-400 mt-3 text-center">Přidat profilovou fotografii</p>
          )}
        </motion.div>
      </label>
    </div>
  )
}
