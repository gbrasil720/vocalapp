import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { StructuredData } from '@/components/structured-data'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { satoshi } from './fonts'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: true
})

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: 'vocalapp - AI-Powered Audio Transcription',
    description:
      'Transform any audio into precise text with cutting-edge AI. 100% accurate transcription with support for 50+ languages. Fast, secure, and easy to use.',
    path: '/'
  }),
  viewport: {
    width: 'device-width',
    initialScale: 1
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#03b3c3' },
    { media: '(prefers-color-scheme: dark)', color: '#03b3c3' }
  ],
  colorScheme: 'dark light',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    telephone: false
  }
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className={`${satoshi.variable} ${inter.variable} antialiased`}>
        <StructuredData />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SpeedInsights />
          <Analytics />
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
