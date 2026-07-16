import { permanentRedirect } from 'next/navigation'

export default function ChaptersRedirectPage() {
  permanentRedirect('/dashboard')
}
