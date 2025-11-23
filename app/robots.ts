import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://vocalapp.io'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api', '/admin', '/auth/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
