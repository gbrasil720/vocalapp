import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Dashboard - vocalapp',
  description: 'Manage your transcriptions and account settings.',
  path: '/dashboard',
  noindex: true
})

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
