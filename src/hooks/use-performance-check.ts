'use client'

import { useEffect, useState } from 'react'

/**
 * Hook pro detekci výkonu zařízení
 * Kontroluje hardwarovou akceleraci a FPS pro určení, zda použít glass efekty
 */
export function usePerformanceCheck() {
  const [hasGoodPerformance, setHasGoodPerformance] = useState(false)

  useEffect(() => {
    // Kontrola na serveru - vždy false
    if (typeof window === 'undefined') {
      return
    }

    // Kontrola počtu CPU jader
    const cores = navigator.hardwareConcurrency || 2

    // Kontrola paměti (pokud je dostupná)
    const memory = (navigator as any).deviceMemory || 4

    // Kontrola, zda je GPU dostupné
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    const hasWebGL = !!gl

    // Detekce mobilního zařízení
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

    // Detekce touchscreen (další indikátor mobilního zařízení)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Kritéria pro dobrý výkon:
    // - Desktop (ne mobile a ne touch)
    // - WebGL podpora (GPU akcelerace)
    // - Minimálně 4 CPU jádra
    // - Minimálně 4 GB RAM (pokud je dostupné)
    const meetsPerformanceCriteria =
      !isMobile && !isTouchDevice && hasWebGL && cores >= 4 && memory >= 4

    setHasGoodPerformance(meetsPerformanceCriteria)
  }, [])

  return hasGoodPerformance
}
