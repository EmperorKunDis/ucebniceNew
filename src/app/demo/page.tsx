import { Box, Stack, Button } from '@/components/ui';
import Link from 'next/link';
import { Play, Code2, Sparkles, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Demo | Učebnice programování AI',
  description: 'Vyzkoušejte si interaktivní demo naší učebnice',
};

export default function DemoPage() {
  return (
    <Box className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <Box className="fixed top-0 left-0 right-0 z-50">
        <Box className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
          <Box className="max-w-7xl mx-auto px-4 py-4">
            <Stack direction="row" justify="between" align="center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Učebnice AI
              </Link>
              
              <Stack direction="row" gap={4}>
                <Link href="/lessons" className="text-gray-300 hover:text-white transition-colors">
                  Lekce
                </Link>
                <Link href="/chapters" className="text-gray-300 hover:text-white transition-colors">
                  Kapitoly
                </Link>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Domů
                </Link>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Hero Section */}
      <Box className="pt-24 pb-12 px-4">
        <Box className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Interaktivní Demo
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Vyzkoušejte si, jak funguje naše učebnice programování s AI
          </p>
        </Box>
      </Box>

      {/* Demo Cards */}
      <Box className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Python v prohlížeči */}
          <Box className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-600/50 transition-all">
            <Code2 className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Python v prohlížeči
            </h3>
            <p className="text-gray-400 mb-6">
              Spouštějte Python kód přímo ve vašem prohlížeči bez instalace
            </p>
            <Link href="/chapters/01">
              <Button variant="secondary" className="w-full gap-2">
                Vyzkoušet
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Box>

          {/* AI Asistent */}
          <Box className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-600/50 transition-all">
            <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              AI Asistent
            </h3>
            <p className="text-gray-400 mb-6">
              Získejte okamžitou pomoc s kódem od našeho AI asistenta
            </p>
            <Link href="/lessons">
              <Button variant="secondary" className="w-full gap-2">
                Zkusit asistenta
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Box>

          {/* Interaktivní cvičení */}
          <Box className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-600/50 transition-all">
            <Play className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Interaktivní cvičení
            </h3>
            <p className="text-gray-400 mb-6">
              Procvičujte si programování s okamžitou zpětnou vazbou
            </p>
            <Link href="/chapters/05">
              <Button variant="secondary" className="w-full gap-2">
                Začít cvičit
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Box>
        </div>

        {/* Sample Code Demo */}
        <Box className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Ukázka kódu
          </h2>
          <Box className="bg-gray-800 rounded-xl p-8 border border-gray-700">
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
          </Box>
          <Box className="text-center mt-6">
            <Link href="/chapters/01">
              <Button variant="primary" size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Spustit tento kód
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}