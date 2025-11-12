'use client'

import { useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [isModalOpen, setIsModalOpen] = useState(false)
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
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
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

        // Reload page to show new image
        window.location.reload()
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Nepodařilo se nahrát obrázek. Zkuste to prosím znovu.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      {/* Kruhové pole pro profilovku */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
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
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
                <Camera className="w-10 h-10 mb-2" />
                <span className="text-xs font-medium">Přidat</span>
              </div>
            )}
          </div>
        </div>

        {/* Popisek pod avatarem */}
        {!currentImage && !previewUrl && (
          <p className="text-sm text-gray-400 mt-3 text-center">Přidat profilovou fotografii</p>
        )}
      </motion.button>

      {/* Modální okno */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Heading */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                  <Upload className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Nahrát profilovou fotografii</h2>
                <p className="text-gray-400 text-sm">Vyberte obrázek ze svého zařízení</p>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="mb-6 flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50">
                    <img src={previewUrl} alt="Náhled" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Upload button */}
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full py-4 px-6 rounded-xl font-medium text-center cursor-pointer
                    bg-gradient-to-r from-purple-500 to-pink-500
                    hover:from-purple-600 hover:to-pink-600
                    text-white shadow-lg shadow-purple-500/50
                    transition-all flex items-center justify-center gap-2
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Upload className="w-5 h-5" />
                  {isUploading ? 'Nahrávám...' : 'Vybrat obrázek'}
                </motion.div>
              </label>

              {/* Info */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Podporované formáty: JPG, PNG, GIF (max 5MB)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
