'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useUserStore } from '@/store/user-store'

interface LightningBackgroundProps {
  hue?: number
  baseSpeed?: number
  baseIntensity?: number
  className?: string
}

export function LightningBackground({
  hue = 272,
  baseSpeed = 0.8,
  baseIntensity = 0.8,
  className = '',
}: LightningBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { streak, level } = useUserStore()

  // Dynamically adjust based on user progress
  const speed = useMemo(() => baseSpeed + streak * 0.05, [baseSpeed, streak])
  const intensity = useMemo(() => baseIntensity + level * 0.1, [baseIntensity, level])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Lightning bolt class
    class LightningBolt {
      x: number = 0
      y: number = 0
      targetX: number = 0
      targetY: number = 0
      segments: { x: number; y: number }[] = []
      alpha: number = 0
      life: number = 0
      maxLife: number = 0
      thickness: number = 0

      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * (canvas?.width ?? 800)
        this.y = 0
        this.targetX = this.x + (Math.random() - 0.5) * 400
        this.targetY = canvas?.height ?? 600
        this.segments = this.generateSegments()
        this.life = 0
        this.maxLife = 60 + Math.random() * 60
        this.alpha = 0
        this.thickness = 1 + Math.random() * 2
      }

      generateSegments() {
        const segments = []
        const steps = 15 + Math.floor(Math.random() * 10)

        for (let i = 0; i <= steps; i++) {
          const progress = i / steps
          const x = this.x + (this.targetX - this.x) * progress
          const y = this.y + (this.targetY - this.y) * progress

          // Add random offset for lightning effect
          const offset = (Math.random() - 0.5) * 50 * Math.sin(progress * Math.PI)
          segments.push({
            x: x + offset,
            y: y,
          })
        }

        return segments
      }

      update() {
        this.life++

        // Fade in and out
        if (this.life < 10) {
          this.alpha = this.life / 10
        } else if (this.life > this.maxLife - 10) {
          this.alpha = (this.maxLife - this.life) / 10
        } else {
          this.alpha = 1
        }

        // Reset when life ends
        if (this.life > this.maxLife) {
          this.reset()
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.segments.length === 0) return

        ctx.beginPath()
        ctx.moveTo(this.segments[0]?.x ?? 0, this.segments[0]?.y ?? 0)

        for (let i = 1; i < this.segments.length; i++) {
          const seg = this.segments[i]
          if (seg) {
            ctx.lineTo(seg.x, seg.y)
          }
        }

        // Main bolt
        ctx.strokeStyle = `hsla(${hue}, 60%, 40%, ${this.alpha * intensity})`
        ctx.lineWidth = this.thickness * intensity
        ctx.stroke()

        // Glow effect
        ctx.strokeStyle = `hsla(${hue}, 60%, 40%, ${this.alpha * 0.5 * intensity})`
        ctx.lineWidth = this.thickness * 3 * intensity
        ctx.stroke()
      }
    }

    // Create lightning bolts
    const bolts: LightningBolt[] = []
    const boltCount = 5 + Math.floor(streak / 2) // More bolts with higher streak

    for (let i = 0; i < boltCount; i++) {
      bolts.push(new LightningBolt())
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw bolts
      bolts.forEach(bolt => {
        bolt.update()
        bolt.draw(ctx)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start with clear canvas
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [hue, speed, intensity, streak, level])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{
        background: `radial-gradient(ellipse at center, hsl(${hue}, 50%, 10%) 0%, #000 100%)`,
      }}
    />
  )
}
