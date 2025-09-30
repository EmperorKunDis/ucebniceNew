'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion } from 'framer-motion'
import { Info, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { useUserStore } from '@/store/user-store'
import { skillNodes, skillLinks } from '@/data/skills-graph'
import { SKILL_CATEGORIES, SkillNode, SkillLink } from '@/types/skills'

interface CompetenceNebulaProps {
  width?: number
  height?: number
  interactive?: boolean
  showMiniMap?: boolean
}

export function CompetenceNebula({ 
  width = 800, 
  height = 600,
  interactive = true,
  showMiniMap = false
}: CompetenceNebulaProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null)
  const [zoom, setZoom] = useState(1)
  const { progress } = useUserStore()
  
  // Calculate skill levels based on completed lessons
  const getSkillLevel = (skillId: string): number => {
    const skill = skillNodes.find(s => s.id === skillId)
    if (!skill) return 0
    
    const completedLessons = skill.lessons.filter(lessonId => 
      progress.some(p => p.lessonId === lessonId)
    )
    
    return Math.min(5, Math.round((completedLessons.length / skill.lessons.length) * 5))
  }
  
  useEffect(() => {
    if (!svgRef.current) return
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove()
    
    const svg = d3.select(svgRef.current)
    const g = svg.append('g')
    
    // Define gradients and filters
    const defs = svg.append('defs')
    
    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur')
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur')
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')
    
    // Create gradients for each category
    Object.entries(SKILL_CATEGORIES).forEach(([key, category]) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${key}`)
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', category.color)
        .attr('stop-opacity', 0.8)
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', category.color)
        .attr('stop-opacity', 0.2)
    })
    
    // Set up force simulation
    const simulation = d3.forceSimulation(skillNodes as any)
      .force('link', d3.forceLink(skillLinks)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))
    
    // Create links (skill dependencies)
    const link = g.selectAll('.link')
      .data(skillLinks)
      .enter().append('line')
      .attr('class', 'link')
      .style('stroke', (d: SkillLink) => {
        const sourceLevel = getSkillLevel(d.source as string)
        const targetLevel = getSkillLevel(d.target as string)
        return sourceLevel > 0 && targetLevel > 0 ? '#fff' : '#333'
      })
      .style('stroke-opacity', (d: SkillLink) => {
        const sourceLevel = getSkillLevel(d.source as string)
        const targetLevel = getSkillLevel(d.target as string)
        return sourceLevel > 0 && targetLevel > 0 ? d.strength : 0.2
      })
      .style('stroke-width', 2)
    
    // Create node groups
    const node = g.selectAll('.node')
      .data(skillNodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', interactive ? 'pointer' : 'default')
    
    // Add circles for nodes
    node.append('circle')
      .attr('r', (d: SkillNode) => {
        const level = getSkillLevel(d.id)
        return 20 + level * 3
      })
      .style('fill', (d: SkillNode) => {
        const level = getSkillLevel(d.id)
        return level > 0 ? `url(#gradient-${d.category})` : '#1a1a1a'
      })
      .style('stroke', (d: SkillNode) => {
        const level = getSkillLevel(d.id)
        return level > 0 ? SKILL_CATEGORIES[d.category].color : '#333'
      })
      .style('stroke-width', 2)
      .style('filter', (d: SkillNode) => {
        const level = getSkillLevel(d.id)
        return level > 0 ? 'url(#glow)' : 'none'
      })
    
    // Add node icons
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .style('font-size', '18px')
      .style('user-select', 'none')
      .text((d: SkillNode) => d.icon || '⭐')
    
    // Add node labels
    node.append('text')
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '12px')
      .style('user-select', 'none')
      .text((d: SkillNode) => d.name)
    
    // Add level indicators
    node.each(function(d: SkillNode) {
      const level = getSkillLevel(d.id)
      if (level > 0) {
        const g = d3.select(this)
        for (let i = 0; i < level; i++) {
          g.append('circle')
            .attr('cx', -10 + i * 5)
            .attr('cy', -30)
            .attr('r', 2)
            .style('fill', SKILL_CATEGORIES[d.category].color)
        }
      }
    })
    
    // Add interactivity
    if (interactive) {
      node
        .on('mouseenter', function(event, d: SkillNode) {
          setHoveredNode(d)
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', (d: SkillNode) => {
              const level = getSkillLevel(d.id)
              return 25 + level * 3
            })
        })
        .on('mouseleave', function(event, d: SkillNode) {
          setHoveredNode(null)
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', (d: SkillNode) => {
              const level = getSkillLevel(d.id)
              return 20 + level * 3
            })
        })
        .on('click', function(event, d: SkillNode) {
          setSelectedNode(d)
        })
      
      // Drag functionality
      const drag = d3.drag<SVGGElement, SkillNode>()
        .on('start', function(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', function(event, d) {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', function(event, d) {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      
      node.call(drag as any)
    }
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)
      
      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })
    
    // Zoom functionality
    if (interactive) {
      const zoomBehavior = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
          setZoom(event.transform.k)
        })
      
      svg.call(zoomBehavior as any)
    }
    
  }, [width, height, progress, interactive])
  
  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom().scaleBy as any,
      1.3
    )
  }
  
  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom().scaleBy as any,
      0.7
    )
  }
  
  const handleReset = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom().transform as any,
      d3.zoomIdentity
    )
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)' }}
      />
      
      {/* Controls */}
      {interactive && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
            title="Přiblížit"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
            title="Oddálit"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
            title="Resetovat zobrazení"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4">
        <GlassSurface className="p-4">
          <h4 className="text-sm font-semibold text-white mb-2">Kategorie dovedností</h4>
          <div className="space-y-1">
            {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
              <div key={key} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs text-gray-300">{category.name}</span>
              </div>
            ))}
          </div>
        </GlassSurface>
      </div>
      
      {/* Node info panel */}
      {hoveredNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-4 left-4 max-w-xs"
        >
          <GlassSurface className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{hoveredNode.icon}</div>
              <div>
                <h3 className="font-semibold text-white">{hoveredNode.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{hoveredNode.description}</p>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Úroveň:</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < getSkillLevel(hoveredNode.id)
                              ? 'bg-purple-500'
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {hoveredNode.dependencies.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Požaduje: {hoveredNode.dependencies.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </GlassSurface>
        </motion.div>
      )}
      
      {/* Selected node detail modal */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setSelectedNode(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ElectricBorder className="rounded-lg">
              <GlassSurface className="p-8 max-w-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{selectedNode.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedNode.name}</h2>
                    <p className="text-gray-400">{SKILL_CATEGORIES[selectedNode.category].name}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{selectedNode.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Úroveň zvládnutí</h3>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                            i < getSkillLevel(selectedNode.id)
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedNode.dependencies.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-white mb-2">Prerekvizity</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.dependencies.map(depId => {
                          const dep = skillNodes.find(n => n.id === depId)
                          return dep ? (
                            <span 
                              key={depId}
                              className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300"
                            >
                              {dep.icon} {dep.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">Související lekce</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.lessons.map(lessonId => (
                        <a
                          key={lessonId}
                          href={`/lessons/${lessonId}`}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm hover:bg-purple-500/30 transition-all"
                        >
                          {lessonId}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedNode(null)}
                  className="mt-6 w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Zavřít
                </button>
              </GlassSurface>
            </ElectricBorder>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}