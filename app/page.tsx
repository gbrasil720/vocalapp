'use client'

import { Navbar } from '@/components/navbar'
import { CTA } from '@/components/sections/cta'
import { FAQ } from '@/components/sections/faq'
import { Features } from '@/components/sections/features'
import { Footer } from '@/components/sections/footer'
import { Pricing } from '@/components/sections/pricing'
import { Testimonials } from '@/components/sections/testimonials'
import { authClient } from '@/lib/auth-client'
export default function Home() {
  return (
    <>
      <Navbar />
      <CTA />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </>
  )
}
