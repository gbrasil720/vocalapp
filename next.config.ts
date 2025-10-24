import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256]
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@hugeicons/react',
      'three',
      'postprocessing'
    ],
    scrollRestoration: true
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false
  },
  poweredByHeader: false,
  compress: true
}

export default nextConfig
