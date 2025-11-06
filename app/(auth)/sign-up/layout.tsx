import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Sign Up - vocalapp',
  description:
    'Create your vocalapp account and start transcribing audio with cutting-edge AI. Free trial available. Support for 50+ languages.',
  path: '/sign-up'
})

export default function SignUpLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
