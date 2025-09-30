import './globals.css'
import type { Metadata } from 'next'
import { Roboto, Roboto_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
})

const robotoMono = Roboto_Mono({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  title: 'Učebnice programování AI',
  description: 'Prémiový vzdělávací ekosystém pro výuku programování s AI asistentem',
  keywords: 'programování, Python, AI, strojové učení, kurz, vzdělávání',
  authors: [{ name: 'Martin Švanda' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" className={`${roboto.variable} ${robotoMono.variable}`}>
      <body className="font-sans bg-gray-900 text-gray-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}