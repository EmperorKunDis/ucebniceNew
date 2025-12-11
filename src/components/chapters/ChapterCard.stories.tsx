import type { Meta, StoryObj } from '@storybook/nextjs'
import { ChapterCard } from './ChapterCard'
import type { Chapter } from '@/data/chapters'

const meta = {
  title: 'Chapters/ChapterCard',
  component: ChapterCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChapterCard>

export default meta
type Story = StoryObj<typeof meta>

// Mock chapter data
const mockChapterBasic: Chapter = {
  id: 'uvod-do-programovani',
  number: 1,
  title: 'Úvod do programování',
  description: 'Základy programování v Pythonu. Naučíme se první příkazy a principy.',
  hours: '1',
  textFile: 'chapter-1.md',
  lectureFile: 'lecture-1.md',
  videoFile: '/videos/chapter-1.mp4',
  notebookLMUrl: 'https://notebooklm.google.com/notebook/123',
}

const mockChapterWithNotebook: Chapter = {
  id: 'promenne-a-datove-typy',
  number: 2,
  title: 'Proměnné a datové typy',
  description:
    'Práce s proměnnými, čísly, textem a dalšími základními datovými typy. Naučíme se ukládat a zpracovávat data.',
  hours: '2',
  textFile: 'chapter-2.md',
  lectureFile: 'lecture-2.md',
  videoFile: '/videos/chapter-2.mp4',
  notebookLMUrl: 'https://notebooklm.google.com/notebook/456',
  colabNotebook: 'https://colab.research.google.com/drive/xyz',
}

const mockChapterNoVideo: Chapter = {
  id: 'podminky-a-cykly',
  number: 3,
  title: 'Podmínky a cykly',
  description: 'Řízení toku programu pomocí podmínek if/else a cyklů for/while.',
  hours: '3',
  textFile: 'chapter-3.md',
  lectureFile: 'lecture-3.md',
  notebookLMUrl: 'https://notebooklm.google.com/notebook/789',
}

const mockChapterLongDescription: Chapter = {
  id: 'funkce-a-moduly',
  number: 4,
  title: 'Funkce a moduly',
  description:
    "Vytváření vlastních funkcí pro organizaci kódu. Import a použití externích knihoven. Naučíme se strukturovat větší projekty do modulů a balíčků. Pochopíme koncept DRY (Don't Repeat Yourself) a jak psát znovupoužitelný kód.",
  hours: '4',
  textFile: 'chapter-4.md',
  lectureFile: 'lecture-4.md',
  videoFile: '/videos/chapter-4.mp4',
  notebookLMUrl: 'https://notebooklm.google.com/notebook/abc',
  colabNotebook: 'https://colab.research.google.com/drive/abc',
}

// Default chapter card
export const Default: Story = {
  args: {
    chapter: mockChapterBasic,
  },
}

// Chapter with both NotebookLM and Colab
export const WithNotebooks: Story = {
  args: {
    chapter: mockChapterWithNotebook,
  },
}

// Chapter without video
export const NoVideo: Story = {
  args: {
    chapter: mockChapterNoVideo,
  },
}

// Chapter with long description (tests line-clamp)
export const LongDescription: Story = {
  args: {
    chapter: mockChapterLongDescription,
  },
}

// Multiple chapters showcase
export const MultipleChapters: Story = {
  args: {
    chapter: mockChapterBasic,
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <ChapterCard chapter={mockChapterBasic} />
      <ChapterCard chapter={mockChapterWithNotebook} />
      <ChapterCard chapter={mockChapterNoVideo} />
      <ChapterCard chapter={mockChapterLongDescription} />
    </div>
  ),
}
