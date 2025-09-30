import { Box, Stack, Grid } from '@/components/ui';
import { chapters } from '@/data/chapters';
import { ChapterCard } from '@/components/chapters/ChapterCard';
import { BookOpen, Brain, Target } from 'lucide-react';

export const metadata = {
  title: 'Všechny kapitoly | Učebnice programování AI',
  description: 'Kompletní seznam všech 40 kapitol učebnice programování s AI',
};

export default function ChaptersPage() {
  // Seskupení kapitol do modulů
  const modules = [
    {
      id: 'intro',
      title: 'Úvod do umělé inteligence',
      icon: <Brain className="w-6 h-6" />,
      chapters: chapters.slice(0, 10),
      description: 'Základy AI, historie, budoucnost a filozofie',
    },
    {
      id: 'algorithms',
      title: 'Jak AI řeší problémy',
      icon: <Target className="w-6 h-6" />,
      chapters: chapters.slice(10, 20),
      description: 'Algoritmy, hledání, pravděpodobnost a klasifikace',
    },
    {
      id: 'ml',
      title: 'Strojové učení',
      icon: <BookOpen className="w-6 h-6" />,
      chapters: chapters.slice(20, 30),
      description: 'Zpracování dat, regrese, klasifikace a vizualizace',
    },
    {
      id: 'nn',
      title: 'Neuronové sítě a budoucnost',
      icon: <Brain className="w-6 h-6" />,
      chapters: chapters.slice(30, 40),
      description: 'Neuronové sítě, deep learning, etika a budoucnost AI',
    },
  ];

  return (
    <Box className="min-h-screen bg-gray-900">
      <Box className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <Stack className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Všechny kapitoly
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            40 kapitol pokrývajících kompletní cestu od základů umělé inteligence až po pokročilé koncepty a etické otázky
          </p>
        </Stack>

        {/* Moduly */}
        <Stack className="space-y-12">
          {modules.map((module, index) => (
            <Box key={module.id}>
              {/* Module Header */}
              <Box className="mb-6 pb-4 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-blue-400">{module.icon}</span>
                  <h2 className="text-2xl font-semibold text-gray-100">
                    Modul {index + 1}: {module.title}
                  </h2>
                </div>
                <p className="text-gray-400 ml-9">{module.description}</p>
              </Box>

              {/* Kapitoly v modulu */}
              <Grid className="grid-cols-1 md:grid-cols-2 gap-4">
                {module.chapters.map((chapter) => (
                  <ChapterCard key={chapter.id} chapter={chapter} />
                ))}
              </Grid>
            </Box>
          ))}
        </Stack>

        {/* Footer info */}
        <Box className="mt-16 text-center">
          <Box className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-600/30">
            <h3 className="text-2xl font-semibold text-gray-100 mb-4">
              Připraveni začít?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Každá kapitola obsahuje interaktivní materiály, videa a praktická cvičení. 
              Projděte si celý kurz postupně nebo si vyberte témata, která vás nejvíce zajímají.
            </p>
            <a
              href="/chapters/01"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Začít od první kapitoly
              <BookOpen className="w-5 h-5" />
            </a>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}