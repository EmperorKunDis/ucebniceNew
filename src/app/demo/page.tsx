'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Code2, Sparkles, ArrowRight } from 'lucide-react'

import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Button } from '@/components/ui/button'
import { Box, Grid } from '@/components/layout'

export default function DemoPage() {
  return (
    <UnifiedPageLayout maxWidth="7xl">
      <SectionHeader subtitle="Vyzkoušejte si, jak funguje naše učebnice programování s AI">
        Interaktivní Demo
      </SectionHeader>

      {/* Demo Cards */}
      <Grid columns={1} md={3} gap={8}>
        {[
          {
            icon: <Code2 className="w-12 h-12" />,
            title: 'Python v prohlížeči',
            description: 'Spouštějte Python kód přímo ve vašem prohlížeči bez instalace',
            href: '/chapters/01',
            color: 'text-blue-400',
            hoverColor: 'hover:border-blue-500/30',
          },
          {
            icon: <Sparkles className="w-12 h-12" />,
            title: 'AI Asistent',
            description: 'Získejte okamžitou pomoc s kódem od našeho AI asistenta',
            href: '/lessons',
            color: 'text-purple-400',
            hoverColor: 'hover:border-purple-500/30',
          },
          {
            icon: <Play className="w-12 h-12" />,
            title: 'Interaktivní cvičení',
            description: 'Procvičujte si programování s okamžitou zpětnou vazbou',
            href: '/chapters/05',
            color: 'text-green-400',
            hoverColor: 'hover:border-green-500/30',
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassSurface className={`p-6 h-full ${item.hoverColor} transition-all`}>
              <Box className={`${item.color} mb-4`}>{item.icon}</Box>
              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 mb-6">{item.description}</p>
              <Button variant="secondary" className="w-full gap-2" asChild>
                <Link href={item.href}>
                  Vyzkoušet
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </GlassSurface>
          </motion.div>
        ))}
      </Grid>

      {/* Sample Code Demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Ukázka kódu</h2>
        <GlassSurface className="p-8">
          <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
            <code>{`# Vyzkoušejte si náš interaktivní editor
import numpy as np
import matplotlib.pyplot as plt

# Vytvoření dat pro vizualizaci
x = np.linspace(0, 2 * np.pi, 100)
y = np.sin(x)

# Vykreslení grafu
plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2)
plt.title('Sinusová funkce')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.grid(True, alpha=0.3)
plt.show()`}</code>
          </pre>
        </GlassSurface>

        <Box className="text-center mt-6">
          <ElectricBorder className="inline-block rounded-lg">
            <Button variant="primary" size="lg" asChild>
              <Link href="/chapters/01">
                <Play className="w-5 h-5 mr-2" />
                Spustit tento kód
              </Link>
            </Button>
          </ElectricBorder>
        </Box>
      </motion.div>
    </UnifiedPageLayout>
  )
}
