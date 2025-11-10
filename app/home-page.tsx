'use client'

import { Navbar } from '@/components/navbar'
import { BetaTestimonials } from '@/components/sections/beta-testimonials'
import { CTA } from '@/components/sections/cta'
import { FAQ } from '@/components/sections/faq'
import { Features } from '@/components/sections/features'
import { Footer } from '@/components/sections/footer'
import { Partners } from '@/components/sections/partners'
import { Pricing } from '@/components/sections/pricing'
import { WaitlistSection } from '@/components/sections/waitlist-section'

export function HomePage() {
  const isWaitlistMode = true

  return (
    <>
      <Navbar waitlistMode={isWaitlistMode} />
      <CTA />
      <Features />
      <Partners />
      <Pricing waitlistMode={isWaitlistMode} />
      {isWaitlistMode && <BetaTestimonials />}
      <FAQ />
      {isWaitlistMode && <WaitlistSection />}
      <Footer />
    </>
  )
}
