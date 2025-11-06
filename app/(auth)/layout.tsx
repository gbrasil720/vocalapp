import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Authentication - vocalapp',
  description:
    'Sign in or create an account to start using AI-powered audio transcription. Secure authentication with Google OAuth support.',
  path: '/sign-in'
})

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
