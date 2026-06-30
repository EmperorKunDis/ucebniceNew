'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SkillNode, type SkillNodeData } from './SkillNode'
import { SkillPath } from './SkillPath'
import { SkillCheckpoint } from './SkillCheckpoint'
import { Loader2 } from 'lucide-react'

interface Edge {
  from: string
  to: string
}

interface Module {
  id: number
  name: string
  chaptersRange: string[]
}

interface UserProgress {
  totalCompleted: number
  totalChapters: number
  currentChapter: string | null
  totalStars: number
  maxStars: number
  percentage: number
}

interface LearningPathData {
  nodes: SkillNodeData[]
  edges: Edge[]
  modules: Module[]
  userProgress: UserProgress
}

export function SkillTreeContainer() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<LearningPathData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Fetch learning path data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/learning-path')
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        } else {
          throw new Error(json.error || 'Unknown error')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Auto-scroll to active node
  useEffect(() => {
    if (data && containerRef.current) {
      const activeNode = data.nodes.find(n => n.status === 'active')
      if (activeNode) {
        const scrollY = activeNode.position.y - window.innerHeight / 2
        containerRef.current.scrollTo({
          top: Math.max(0, scrollY),
          behavior: 'smooth',
        })
      }
    }
  }, [data])

  // Handle node click
  const handleNodeClick = (node: SkillNodeData) => {
    setSelectedNode(node.id)
    router.push(`/learn/${node.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96 text-red-400">
        <p>Chyba: {error || 'Data nenalezena'}</p>
      </div>
    )
  }

  if (data.nodes.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-md rounded-xl border border-white/10 bg-gray-950/70 p-6 text-center shadow-2xl shadow-purple-950/20">
          <h2 className="text-xl font-semibold text-white">Postupová cesta není načtená</h2>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            Učení je správně napojené na domovskou obrazovku, ale databáze teď nevrátila žádné
            kapitoly. Po načtení kapitol se tady zobrazí postupová cesta.
          </p>
        </div>
      </div>
    )
  }

  // Create node map for path rendering
  const nodeMap = new Map(data.nodes.map(n => [n.id, n]))

  // Calculate container height based on nodes
  const maxY = Math.max(...data.nodes.map(n => n.position.y))
  const containerHeight = maxY + 200

  // Calculate checkpoint positions (between modules)
  const checkpoints = data.modules.map((module, index) => {
    const moduleNodes = data.nodes.filter(n => n.module === module.id)
    const firstNode = moduleNodes[0]
    const completedCount = moduleNodes.filter(n => n.status === 'completed').length
    const isUnlocked =
      index === 0 || data.nodes.filter(n => n.module === index).every(n => n.status === 'completed')
    const isCompleted = moduleNodes.every(n => n.status === 'completed')

    return {
      module,
      position: {
        x: 200,
        y: firstNode ? firstNode.position.y - 60 : index * 600,
      },
      isUnlocked,
      isCompleted,
      completedChapters: completedCount,
      totalChapters: moduleNodes.length,
    }
  })

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Progress header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Tvůj progres</span>
            <span className="text-white font-semibold">{data.userProgress.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.userProgress.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>
              ⭐ {data.userProgress.totalStars}/{data.userProgress.maxStars} hvězd
            </span>
            <span>
              📚 {data.userProgress.totalCompleted}/{data.userProgress.totalChapters} kapitol
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable skill tree */}
      <div
        ref={containerRef}
        className="relative overflow-auto"
        style={{ height: 'calc(100vh - 100px)' }}
      >
        <div className="relative mx-auto" style={{ width: 400, height: containerHeight }}>
          {/* SVG layer for paths */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            {data.edges.map((edge, index) => {
              const fromNode = nodeMap.get(edge.from)
              const toNode = nodeMap.get(edge.to)
              if (!fromNode || !toNode) return null
              return (
                <SkillPath
                  key={`${edge.from}-${edge.to}`}
                  fromNode={fromNode}
                  toNode={toNode}
                  index={index}
                />
              )
            })}
          </svg>

          {/* Checkpoints layer */}
          {checkpoints.map(checkpoint => (
            <SkillCheckpoint key={checkpoint.module.id} {...checkpoint} />
          ))}

          {/* Nodes layer */}
          {data.nodes.map(node => (
            <SkillNode
              key={node.id}
              node={node}
              onClick={handleNodeClick}
              isSelected={selectedNode === node.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
