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

      {/* Text content on top */}
      <div className="relative w-screen h-[100vh] z-40 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Closed Beta Badge */}
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

          <h1 className="font-['Satoshi'] font-medium text-3xl sm:text-3xl md:text-4xl lg:text-7xl bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight drop-shadow-lg max-w-4xl px-2">
            The best speech-to-text experience you'll ever have.
          </h1>
          <p className="font-['Inter'] font-normal text-lg sm:text-lg lg:text-2xl mt-4 sm:mt-6 text-[#03b3c3]/90 max-w-3xl leading-relaxed text-center mx-auto px-4">
            Transform any audio into precise text with cutting-edge AI. 100%
            accurate transcription. No more manual transcription.
          </p>
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              asChild
              className="rounded-full backdrop-blur-xl bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white px-8 py-6 text-lg cursor-pointer hover:from-[#d856bf]/90 hover:to-[#c247ac]/90 transition-all border-0"
            >
              <Link href="#waitlist">Join Waitlist</Link>
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
