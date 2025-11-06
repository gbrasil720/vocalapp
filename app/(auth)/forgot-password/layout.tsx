import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Forgot Password - vocalapp',
  description:
    'Reset your vocalapp password securely. Enter your email to receive password reset instructions.',
  path: '/forgot-password'
})

export default function ForgotPasswordLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
