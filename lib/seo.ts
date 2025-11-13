import type { Metadata } from 'next'
import { env } from './env'

const baseUrl = env.NEXT_PUBLIC_URL || 'https://vocalapp.io'
const siteName = 'vocalapp'
const defaultTitle = 'vocalapp - AI-Powered Audio Transcription'
const defaultDescription =
  'Transform any audio into precise text with cutting-edge AI. 100% accurate transcription with support for 50+ languages. Fast, secure, and easy to use.'

interface SEOProps {
  title?: string
  description?: string
  path?: string
  noindex?: boolean
  image?: string
  type?: 'website' | 'article'
}

export function generateMetadata({
  title,
  description,
  path = '',
  noindex = false,
  image,
  type = 'website'
}: SEOProps): Metadata {
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle
  const url = `${baseUrl}${path}`
  const ogImage = image || `${baseUrl}/og-image.png`

  return {
    title: fullTitle,
    description: description || defaultDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description: description || defaultDescription,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || siteName
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || defaultDescription,
      images: [ogImage]
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png'
    },
    manifest: '/manifest.json',
    verification: {}
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'vocalapp',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://x.com/guitrynacode',
      'https://github.com/gbrasil720/vocalapp'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'dev.guilhermebrasil@gmail.com'
    }
  }
}

export function generateWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'vocalapp',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'AI-powered transcription',
      '100% accuracy',
      '50+ languages',
      'Real-time processing',
      'Secure and private',
      'Multiple export formats'
    ],
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareRequirements: 'Web browser with JavaScript enabled'
  }
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'vocalapp',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      offerCount: '3',
      lowPrice: '0',
      highPrice: '10',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150'
    },
    description:
      'AI-powered audio transcription service with 100% accuracy, supporting 50+ languages'
  }
}

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}
