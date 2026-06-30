import { redirect } from 'next/navigation'

/**
 * /learn redirects to /dashboard (skill tree view)
 * Individual v2 chapter overviews are at /learn/[chapterId].
 */
export default function LearnPage() {
  redirect('/dashboard')
}
