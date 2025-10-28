'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { isMobileDevice } from '@/lib/device-utils'
import { LazyHyperspeed } from '../lazy-hyperspeed'
import { Button } from '../ui/button'

export function CTA() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileDevice())

    const handleResize = () => {
      setIsMobile(isMobileDevice())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Only render 3D background on non-mobile devices for better performance */}
      {!isMobile ? (
        <div className="fixed inset-0 z-0">
          <LazyHyperspeed />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      )}

      {/* Text content on top */}
      <div className="relative w-screen h-[100vh] z-40 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="font-['Satoshi'] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-7xl bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight drop-shadow-lg max-w-4xl">
            The best speech-to-text experience you'll ever have.
          </h1>
          <p className="font-['Inter'] font-normal text-base sm:text-lg lg:text-2xl mt-4 sm:mt-6 text-[#03b3c3]/90 max-w-3xl leading-relaxed text-center mx-auto">
            Transform any audio into precise text with cutting-edge AI. 100%
            accurate transcription. No more manual transcription.
          </p>
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              asChild
              className="rounded-full backdrop-blur-xl bg-transparent text-whtie px-8 py-6 text-lg cursor-pointer hover:bg-[#03b3c3]/20 transition-all"
            >
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              className="rounded-full backdrop-blur-xl bg-transparent text-whtie px-8 py-6 text-lg cursor-pointer hover:bg-[#d856bf]/20 transition-all"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
