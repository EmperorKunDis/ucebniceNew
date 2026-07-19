import './globals.css'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Montserrat, Open_Sans } from 'next/font/google'
import { Providers } from '@/components/providers'

// Design system type stack: Montserrat = display voice, Open Sans = body,
// JetBrains Mono = technical voice (code, meta, stats).
const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Učebnice programování AI',
    template: '%s | Učebnice AI',
  },
  description: 'Prémiový vzdělávací ekosystém pro výuku programování s AI asistentem',
  keywords: [
    'programování',
    'Python',
    'AI',
    'strojové učení',
    'kurz',
    'vzdělávání',
    'machine learning',
    'deep learning',
    'neural networks',
  ],
  authors: [{ name: 'Martin Švanda' }],
  creator: 'Martin Švanda',
  publisher: 'Učebnice AI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: '/',
    siteName: 'Učebnice programování AI',
    title: 'Učebnice programování AI',
    description: 'Prémiový vzdělávací ekosystém pro výuku programování s AI asistentem',
  },
  icons: {
    icon: '/favicon.ico',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Učebnice programování AI',
    description: 'Prémiový vzdělávací ekosystém pro výuku programování s AI asistentem',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification tokens when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="cs"
      className={`${montserrat.variable} ${openSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans bg-gray-900 text-gray-100 min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
