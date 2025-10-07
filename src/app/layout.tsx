import './globals.css'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Providers } from '@/components/providers'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: 'Učebnice programování AI',
  description: 'Prémiový vzdělávací ekosystém pro výuku programování s AI asistentem',
  keywords: 'programování, Python, AI, strojové učení, kurz, vzdělávání',
  authors: [{ name: 'Martin Švanda' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={montserrat.variable}>
      <body className="font-sans bg-gray-900 text-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
