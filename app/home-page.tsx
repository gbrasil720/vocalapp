'use client'

import { Navbar } from '@/components/navbar'
import { Testimonials } from '@/components/sections/beta-testimonials'
import { CTA } from '@/components/sections/cta'
import { FAQ } from '@/components/sections/faq'
import { Features } from '@/components/sections/features'
import { Footer } from '@/components/sections/footer'
import { Pricing } from '@/components/sections/pricing'
import { WaitlistSection } from '@/components/sections/waitlist-section'

export function HomePage() {
  const isWaitlistMode = false

  return (
    <>
      <Navbar waitlistMode={isWaitlistMode} />
      <CTA />
      <Features />
      <Pricing waitlistMode={isWaitlistMode} />
      {isWaitlistMode && <Testimonials />}
      {isWaitlistMode && <WaitlistSection />}
      <FAQ />
      <Footer />
    </>
  )
}
