'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import 'swagger-ui-react/swagger-ui.css'

import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassSurface } from '@/components/ui/glass-surface'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <UnifiedPageLayout maxWidth="7xl">
      <SectionHeader subtitle="Complete API documentation for Učebnice programování AI">
        API Documentation
      </SectionHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassSurface className="p-8 bg-white/5">
          <div className="swagger-container">
            <SwaggerUI url="/api/swagger" />
          </div>
        </GlassSurface>
      </motion.div>
    </UnifiedPageLayout>
  )
}
