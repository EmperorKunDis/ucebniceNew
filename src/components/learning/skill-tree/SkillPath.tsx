'use client'

import { motion } from 'framer-motion'
import type { SkillNodeData } from './SkillNode'

interface SkillPathProps {
  fromNode: SkillNodeData
  toNode: SkillNodeData
  index: number
}

export function SkillPath({ fromNode, toNode, index }: SkillPathProps) {
  const from = fromNode.position
  const to = toNode.position

  // Calculate control points for a smooth curve
  const midY = (from.y + to.y) / 2
  const controlOffset = Math.abs(to.x - from.x) * 0.5

  // Create bezier curve path
  const pathD = `
    M ${from.x} ${from.y}
    C ${from.x} ${midY - controlOffset},
      ${to.x} ${midY + controlOffset},
      ${to.x} ${to.y}
  `

  // Determine path color based on node statuses
  const getPathColor = () => {
    if (fromNode.status === 'completed' && toNode.status === 'completed') {
      return '#fbbf24' // yellow-400 - both completed
    }
    if (fromNode.status === 'completed' && toNode.status === 'active') {
      return '#4ade80' // green-400 - going to active
    }
    return '#6b7280' // gray-500 - locked
  }

  const strokeColor = getPathColor()
  const isActive = toNode.status === 'active'

  return (
    <g>
      {/* Background path (thicker, dimmer) */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      />

      {/* Main path */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
      />

      {/* Animated dot for active paths */}
      {isActive && (
        <motion.circle
          r={4}
          fill="#4ade80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
        </motion.circle>
      )}
    </g>
  )
}
