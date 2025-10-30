'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  const userAgent = navigator.userAgent || navigator.vendor
  const isMobileUA =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase()
    )
  const isSmallScreen = window.innerWidth < 768
  return isMobileUA || isSmallScreen
}

const MemoizedHyperspeed = dynamic(
  () => import('./memoized-hyperspeed').then((mod) => mod.MemoizedHyperspeed),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-b from-black via-gray-900 to-black" />
    )
  }
)

export const LazyHyperspeed = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsMobile(isMobileDevice())
  }, [])

  // Don't render anything on server or on mobile
  if (!mounted || isMobile) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-black via-gray-900 to-black" />
    )
  }

  return <MemoizedHyperspeed />
}
