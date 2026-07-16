import { permanentRedirect } from 'next/navigation'

interface LegacyChapterRedirectPageProps {
  params: Promise<{ chapterId: string }>
}

export default async function LegacyChapterRedirectPage({
  params,
}: LegacyChapterRedirectPageProps) {
  const { chapterId } = await params
  permanentRedirect(`/learn/${encodeURIComponent(chapterId)}`)
}
