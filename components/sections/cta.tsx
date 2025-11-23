'use client'

import { CheckmarkBadge01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { LazyHyperspeed } from '../lazy-hyperspeed'
import { Button } from '../ui/button'

export function CTA() {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <LazyHyperspeed />
      </div>

      <div className="relative w-screen h-[100vh] z-40 flex flex-col items-center justify-center text-center px-6 sm:px-6 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="inline-flex items-center gap-2 bg-[#03b3c3]/20 border border-[#03b3c3]/50 rounded-full px-4 py-2 mb-4 sm:mb-6">
            <span className="text-sm sm:text-base font-semibold text-[#03b3c3] flex items-center gap-2">
              <HugeiconsIcon
                icon={CheckmarkBadge01Icon}
                color="#03b3c3"
                size={20}
              />
              Now in Closed Beta
            </span>
          </div>

          <h1 className="font-['Satoshi'] font-medium text-3xl sm:text-3xl md:text-4xl lg:text-7xl text-primary leading-tight drop-shadow-lg max-w-4xl">
            The best speech-to-text experience you'll ever have.
          </h1>
          <p className="font-['Inter'] font-normal text-lg sm:text-lg lg:text-2xl mt-4 sm:mt-6 text-primary/90 max-w-3xl leading-relaxed text-center mx-auto">
            Transform any audio into precise text with cutting-edge AI. 100%
            accurate transcription. No more manual transcription.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-4 mt-6 sm:mt-8">
            <Button
              asChild
              className="rounded-full backdrop-blur-xl bg-[#d856bf] text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg cursor-pointer hover:scale-105 hover:bg-[#d856bf]/90 hover:shadow-[#d856bf]/25 hover:shadow-2xl transition-all border-0 w-full sm:w-auto"
            >
              <Link href="#waitlist">Join Waitlist</Link>
            </Button>
            <Button
              asChild
              className="rounded-full backdrop-blur-xl bg-transparent text-whtie px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg cursor-pointer hover:bg-[#d856bf]/20 transition-all w-full sm:w-auto"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
