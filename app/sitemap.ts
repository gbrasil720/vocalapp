import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

const baseUrl = env.NEXT_PUBLIC_URL || 'https://vocalapp.io'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/success`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3
    }
  ]
}
