import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Sign In - vocalapp',
  description:
    'Sign in to your vocalapp account to access your transcriptions and continue using AI-powered audio transcription services.',
  path: '/sign-in'
})

export default function SignInLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
