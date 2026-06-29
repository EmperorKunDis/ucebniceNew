'use client'

import { Stack, Grid, Box } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { GlassSurface } from '@/components/ui/glass-surface'
import { Lightning } from '@/components/ui/lightning'

/**
 * Příklady použití nových layout komponent
 * Demonstruje jak správně používat layout komponenty místo inline stylů
 */
export default function LayoutExamplePage() {
  return (
    <Box className="min-h-screen bg-black relative overflow-hidden">
      <Lightning />

      {/* Hlavní kontejner s max šířkou a centrováním */}
      <Box as="main" className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Stack příklad - vertikální rozložení */}
        <Stack direction="col" gap={8}>
          <Stack direction="col" gap={4}>
            <h1 className="text-4xl font-bold text-white">Layout komponenty - příklady použití</h1>
            <p className="text-gray-400 text-lg">
              Demonstrace jak používat Stack, Grid a Box komponenty pro čisté layouty
            </p>
          </Stack>

          {/* Grid příklad - responzivní mřížka */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Grid komponenta - Responzivní karty
            </h2>

            <Grid columns={1} md={2} lg={3} gap={6}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <GlassSurface key={i} className="p-6">
                  <Stack direction="col" gap={4}>
                    <h3 className="text-xl font-semibold text-white">Karta {i}</h3>
                    <p className="text-gray-400">
                      Tato karta používá GlassSurface bez width/height props. Velikost je
                      kontrolována Grid komponentou.
                    </p>
                    <Button variant="secondary" className="self-start">
                      Akce {i}
                    </Button>
                  </Stack>
                </GlassSurface>
              ))}
            </Grid>
          </section>

          {/* Stack příklad - horizontální tlačítka */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Stack komponenta - Horizontální layout
            </h2>

            <GlassSurface className="p-6">
              <Stack direction="col" gap={4}>
                <p className="text-gray-300">Tlačítka níže používají Stack s různými parametry:</p>

                {/* Tlačítka zarovnaná vlevo */}
                <Stack direction="row" gap={4}>
                  <Button variant="primary">Primární</Button>
                  <Button variant="secondary">Sekundární</Button>
                  <Button variant="ghost">Ghost</Button>
                </Stack>

                {/* Tlačítka roztažená na celou šířku */}
                <Stack direction="row" gap={4} justify="between">
                  <Button variant="primary">Vlevo</Button>
                  <Button variant="secondary">Uprostřed</Button>
                  <Button variant="ghost">Vpravo</Button>
                </Stack>

                {/* Tlačítka vycentrovaná */}
                <Stack direction="row" gap={4} justify="center">
                  <Button variant="destructive" size="sm">
                    Malé
                  </Button>
                  <Button variant="primary" size="md">
                    Střední
                  </Button>
                  <Button variant="secondary" size="lg">
                    Velké
                  </Button>
                </Stack>
              </Stack>
            </GlassSurface>
          </section>

          {/* Box příklad - custom sekce */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Box komponenta - Flexibilní wrapper
            </h2>

            <Stack direction="col" gap={4}>
              <Box className="p-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/20">
                <Stack direction="row" gap={6} align="center" justify="between">
                  <Box>
                    <h3 className="text-2xl font-bold text-white mb-2">Speciální nabídka</h3>
                    <p className="text-gray-300">
                      Box komponenta umožňuje vytvářet custom layouty s libovolnými styly.
                    </p>
                  </Box>
                  <Button variant="primary" size="lg" className="shrink-0">
                    Zjistit více
                  </Button>
                </Stack>
              </Box>

              {/* Vnořené Boxy */}
              <Grid columns={1} md={2} gap={4}>
                <Box as="article" className="p-6 bg-white/5 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">Box jako article</h4>
                  <p className="text-gray-400">
                    Box může renderovat různé HTML tagy pomocí prop "as".
                  </p>
                </Box>

                <Box as="aside" className="p-6 bg-white/5 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">Box jako aside</h4>
                  <p className="text-gray-400">To pomáhá se sémantickým HTML.</p>
                </Box>
              </Grid>
            </Stack>
          </section>

          {/* Komplexní příklad */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Komplexní layout - kombinace všech komponent
            </h2>

            <GlassSurface className="p-8">
              <Grid columns={1} lg={2} gap={8}>
                {/* Levá strana */}
                <Stack direction="col" gap={6}>
                  <Box>
                    <h3 className="text-2xl font-bold text-white mb-4">Výhody tohoto přístupu</h3>
                    <Stack direction="col" gap={3}>
                      {[
                        'Maximální znovupoužitelnost komponent',
                        'Konzistentní spacing a layout',
                        'Jednodušší maintenance',
                        'Čistší a čitelnější kód',
                        'Lepší responzivita',
                      ].map((benefit, i) => (
                        <Box key={i} className="flex items-center gap-3">
                          <Box className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                            <span className="text-green-400 text-sm">✓</span>
                          </Box>
                          <span className="text-gray-300">{benefit}</span>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>

                {/* Pravá strana */}
                <Stack direction="col" gap={4}>
                  <Box className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Kód je mnohem čitelnější
                    </h4>
                    <p className="text-gray-400 mb-4">
                      Místo komplexních className řetězců používáme sémantické komponenty.
                    </p>
                    <Stack direction="row" gap={3}>
                      <Button variant="primary" className="flex-1">
                        Souhlasím
                      </Button>
                      <Button variant="secondary" className="flex-1">
                        Chci vědět víc
                      </Button>
                    </Stack>
                  </Box>

                  <Box className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="text-yellow-300 text-sm">
                      💡 Tip: Vždy preferujte layout komponenty před inline styly
                    </p>
                  </Box>
                </Stack>
              </Grid>
            </GlassSurface>
          </section>
        </Stack>
      </Box>
    </Box>
  )
}
