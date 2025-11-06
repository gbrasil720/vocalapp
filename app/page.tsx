import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { HomePage } from './home-page'

export const metadata: Metadata = generateSEOMetadata({
  title: 'AI-Powered Audio Transcription - Transform Speech to Text',
  description:
    'Transform any audio into precise text with cutting-edge AI. 100% accurate transcription with support for 50+ languages. Fast, secure, and easy to use. Free trial available.',
  path: '/'
})

export default function Home() {
  return <HomePage />
}
