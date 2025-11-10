import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Find quick answers, beta onboarding tips, and ways to reach the Vocal team.'
}

const faqItems = [
  {
    question: 'How do I join the closed beta?',
    answer:
      'Add your team to the waitlist from our homepage. We review new applications every Friday and follow up via email when a slot opens.'
  },
  {
    question: 'Where do I share product feedback?',
    answer:
      'Use the in-app feedback panel or open a GitHub issue if you prefer. We read everything and respond within two business days.'
  },
  {
    question: 'Is there a public roadmap?',
    answer:
      'Yes! Once you are in the beta you’ll receive a link to our roadmap board so you can track what we’re exploring next.'
  }
]

export default function HelpPage() {
  return (
    <div className="relative z-10 py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-12 text-gray-200">
        <header className="space-y-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#03b3c3]/10 border border-[#03b3c3]/30 px-4 py-1 text-sm font-semibold text-[#03b3c3]">
            Help Center
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            How can we help?
          </h1>
          <p className="text-lg text-gray-300">
            If you’re already in the beta, you have a direct line to us. If
            you’re waiting to get in, here’s how to stay in the loop and prep
            your team.
          </p>
        </header>

        <section className="grid gap-6">
          {faqItems.map((item) => (
            <div
              key={item.question}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <h2 className="text-2xl font-semibold text-white">
                {item.question}
              </h2>
              <p className="mt-3 text-gray-300">{item.answer}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-transparent p-8 text-center backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Still need a hand?
          </h2>
          <p className="text-gray-300 mb-6">
            Ping us at{' '}
            <a
              href="mailto:hello@vocalapp.ai"
              className="text-[#03b3c3] hover:underline"
            >
              hello@vocalapp.ai
            </a>{' '}
            or jump into our GitHub discussions to reach the team and community
            maintainers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/vocalapp-ai/vocalapp/discussions"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
            >
              Join discussions
            </a>
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#d856bf] to-[#03b3c3] px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105"
            >
              Check waitlist status
            </a>
          </div>
        </section>

        <div className="flex justify-center pt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
