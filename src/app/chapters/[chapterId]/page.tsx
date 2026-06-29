import { notFound } from 'next/navigation'
import { ChapterLayout } from '@/components/chapters/ChapterLayout'
import { getChapterById } from '@/data/chapters'

export async function generateStaticParams() {
  return Array.from({ length: 40 }, (_, i) => ({
    chapterId: String(i + 1).padStart(2, '0'),
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params
  const chapter = getChapterById(chapterId)

  if (!chapter) {
    return {
      title: 'Kapitola nenalezena',
    }
  }

  return {
    title: `Kapitola ${chapter.number}: ${chapter.title} | Učebnice programování AI`,
    description: chapter.description,
  }
}

export default async function ChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params
  const chapter = getChapterById(chapterId)

  if (!chapter) {
    notFound()
  }

  return <ChapterLayout chapter={chapter} />
}
