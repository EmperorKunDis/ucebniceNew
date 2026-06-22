import { redirect } from 'next/navigation'

/**
 * /learn redirects to /dashboard (skill tree view)
 * Individual chapters are at /chapters/[id]
 */
export default function LearnPage() {
  redirect('/dashboard')
}
