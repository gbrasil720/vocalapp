import type { Metadata } from 'next'
import Link from 'next/link'
import { FeedbackForm } from '@/components/forms/feedback-form'

export const metadata: Metadata = {
  title: 'Beta Feedback',
  description:
    'Share your experience with Vocal beta and help us build the roadmap together.',
  robots: {
    index: false
  }
}

const helperCards = [
  {
    title: 'Check release notes',
    description:
      'We publish a short changelog on the dashboard home every Friday. See what shipped before sending your idea.',
    label: 'View dashboard',
    href: '/dashboard'
  },
  {
    title: 'Need a deeper dive?',
    description:
      'If something is blocking your team, reply to any onboarding email or drop us a note—we’ll set up a quick call.',
    label: 'Email the team',
    href: 'mailto:hello@vocalapp.ai?subject=Beta%20support'
  }
]

export default function FeedbackPage() {
  return (
    <div className="relative z-10 py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-12 text-gray-200">
        <header className="space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#03b3c3]/10 border border-[#03b3c3]/30 px-4 py-1 text-sm font-semibold text-[#03b3c3]">
            Closed beta feedback
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Help us build the roadmap
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Send feedback without leaving the dashboard. We review every
            submission, tag it in the roadmap, and keep you updated as it makes
            progress.
          </p>
        </header>

        <FeedbackForm />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helperCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <h2 className="text-2xl font-semibold text-white mb-3">
                {card.title}
              </h2>
              <p className="text-gray-300 mb-6">{card.description}</p>
              <Link
                href={card.href}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
              >
                {card.label}
              </Link>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
