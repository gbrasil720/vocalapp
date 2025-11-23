'use client'

import {
  InboxIcon,
  Loading01Icon,
  MessageAdd01Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

const placeholders = [
  {
    title: 'Reserved for our first cohort',
    copy: 'We kick off user interviews the moment the next batch gets access. Your stories will help future teams decide faster.',
    icon: Loading01Icon
  },
  {
    title: 'Help us measure impact',
    copy: 'We’re gathering before-and-after snapshots of workflows, transcription accuracy, and time saved across real teams.',
    icon: InboxIcon
  },
  {
    title: 'Share your voice soon',
    copy: 'Closed beta testers will get a short template so it’s easy to share highlights, quotes, and lessons learned.',
    icon: MessageAdd01Icon
  }
]

export function BetaTestimonials() {
  return (
    <section
      className="relative z-10 py-16 md:py-20 px-6 md:px-6"
      id="beta-testimonials"
    >
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h2 className="font-['Satoshi'] text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
          Beta Stories Coming Soon
        </h2>
        <p className="text-xl text-primary/90 leading-relaxed max-w-2xl mx-auto">
          We’re onboarding the next wave of teams now. Once feedback lands,
          you’ll see real voices and results here— straight from the beta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {placeholders.map((item) => (
          <div
            key={item.title}
            className="bg-transparent backdrop-blur-2xl border border-dashed border-white/15 rounded-3xl p-8 text-left"
          >
            <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E5E5E5] border border-white/10">
              <HugeiconsIcon icon={item.icon} color="#1f1f1f" size={26} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              {item.title}
            </h3>
            <p className="text-gray-300 leading-relaxed">{item.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center max-w-2xl mx-auto">
        <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-10">
          <p className="text-lg text-gray-300 mb-6">
            Want to share your experience here? Join the closed beta, run your
            workflows, and we’ll feature your story as soon as you’re ready.
          </p>
          <Link
            href="#waitlist"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#d856bf] text-white font-semibold transition-transform duration-300 hover:scale-105"
          >
            Apply for Closed Beta
          </Link>
        </div>
      </div>
    </section>
  )
}
