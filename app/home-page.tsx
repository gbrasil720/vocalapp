'use client'

import { Navbar } from '@/components/navbar'
import { CTA } from '@/components/sections/cta'
import { Features } from '@/components/sections/features'
import { Footer } from '@/components/sections/footer'
import { Pricing } from '@/components/sections/pricing'
import { WaitlistSection } from '@/components/sections/waitlist-section'

export function HomePage() {
  // Toggle this to switch between waitlist mode and normal mode
  const isWaitlistMode = true

  return (
    <>
      <Navbar waitlistMode={isWaitlistMode} />
      <CTA />
      <Features />
      <Pricing waitlistMode={isWaitlistMode} />
      {isWaitlistMode && <WaitlistSection />}
      <Footer />
    </>
  )
}



