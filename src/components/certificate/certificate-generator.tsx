'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Award, Sparkles, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { useUserStore } from '@/store/user-store'

interface CertificateGeneratorProps {
  courseName?: string
  completionDate?: Date
  instructorName?: string
  certificateId?: string
}

export function CertificateGenerator({ 
  courseName = 'Učebnice programování s AI',
  completionDate = new Date(),
  instructorName = 'AI Mentor',
  certificateId = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}: CertificateGeneratorProps) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number }>>([])
  const { username, level, xp, badges, progress } = useUserStore()
  
  // Generate random stars for background
  useEffect(() => {
    const newStars = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1
    }))
    setStars(newStars)
  }, [])
  
  const generatePDF = async () => {
    if (!certificateRef.current) return
    
    setIsGenerating(true)
    
    try {
      // Capture the certificate as canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false
      })
      
      // Convert to PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`certificate-${username}-${certificateId}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const shareOnLinkedIn = () => {
    const text = `Právě jsem úspěšně dokončil kurz "${courseName}"! 🎓\n\nDosáhl jsem úrovně ${level} s ${xp} XP a získal ${badges.length} odznaků.\n\n#programming #AI #learning`
    const url = window.location.origin
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank')
  }
  
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Certificate Preview */}
      <div className="mb-8">
        <div 
          ref={certificateRef}
          className="relative aspect-[1.414/1] w-full bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-lg overflow-hidden p-12"
        >
          {/* Animated stars background */}
          <div className="absolute inset-0">
            {stars.map((star, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
          
          {/* Lightning effects */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {[...Array(3)].map((_, i) => (
                <motion.path
                  key={i}
                  d={`M${100 + i * 300},0 L${150 + i * 300},200 L${120 + i * 300},400 L${180 + i * 300},600`}
                  stroke="rgba(147, 51, 234, 0.5)"
                  strokeWidth="2"
                  fill="none"
                  filter="url(#glow)"
                  animate={{
                    opacity: [0, 1, 0],
                    pathLength: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.7,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </svg>
          </div>
          
          {/* Certificate content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                <h1 className="text-4xl font-bold">Certifikát o absolvování</h1>
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-lg text-purple-200">Tímto potvrzujeme, že</p>
            </motion.div>
            
            {/* Student name */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {username || 'Student'}
              </h2>
              <div className="h-1 w-64 mx-auto bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full" />
            </motion.div>
            
            {/* Course completion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 max-w-2xl"
            >
              <p className="text-lg mb-2">úspěšně dokončil/a kurz</p>
              <h3 className="text-3xl font-bold mb-4">{courseName}</h3>
              <p className="text-purple-200">
                s celkovým počtem {xp} XP, dosažením úrovně {level} a ziskem {badges.length} odznaků
              </p>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-8 mb-8"
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{progress.length}</p>
                <p className="text-sm text-purple-200">Dokončených lekcí</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{level}</p>
                <p className="text-sm text-purple-200">Dosažená úroveň</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{badges.length}</p>
                <p className="text-sm text-purple-200">Získaných odznaků</p>
              </div>
            </motion.div>
            
            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-auto"
            >
              <div className="flex items-center justify-center gap-12 text-sm">
                <div>
                  <p className="text-purple-200">Datum dokončení</p>
                  <p className="font-semibold">{completionDate.toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                </div>
                <Award className="w-16 h-16 text-yellow-400" />
                <div>
                  <p className="text-purple-200">Instruktor</p>
                  <p className="font-semibold">{instructorName}</p>
                </div>
              </div>
              <p className="text-xs text-purple-300 mt-4">ID: {certificateId}</p>
            </motion.div>
          </div>
          
          {/* Decorative borders */}
          <div className="absolute inset-4 border-2 border-purple-400/20 rounded-lg pointer-events-none" />
          <div className="absolute inset-8 border border-purple-300/10 rounded-lg pointer-events-none" />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <ElectricBorder className="rounded-lg">
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            {isGenerating ? 'Generování...' : 'Stáhnout PDF'}
          </button>
        </ElectricBorder>
        
        <button
          onClick={shareOnLinkedIn}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Sdílet na LinkedIn
        </button>
      </div>
    </div>
  )
}
