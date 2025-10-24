'use client'

import dynamic from 'next/dynamic'

export const LazyHyperspeed = dynamic(
  () => import('./memoized-hyperspeed').then((mod) => mod.MemoizedHyperspeed),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-b from-black via-gray-900 to-black" />
    )
  }
)
