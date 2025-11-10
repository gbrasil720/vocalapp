import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Support',
  description:
    'Reach the Vocal team for beta access questions, billing help, or technical issues.'
}

export default function SupportPage() {
  return (
    <div className="relative z-10 py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-12 text-gray-200">
        <header className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#d856bf]/10 border border-[#d856bf]/30 px-4 py-1 text-sm font-semibold text-[#d856bf]">
            Need assistance?
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Contact Support
          </h1>
          <p className="text-lg text-gray-300">
            We’re here to help current and future beta testers stay productive.
            Choose the path that matches what you need.
          </p>
        </header>

        <section className="grid gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">
              Beta onboarding questions
            </h2>
            <p className="mt-3 text-gray-300">
              Waiting for access or need to update your details? Reply to any
              waitlist email or send a note to{' '}
              <a
                href="mailto:hello@vocalapp.ai"
                className="text-[#03b3c3] hover:underline"
              >
                hello@vocalapp.ai
              </a>{' '}
              and we’ll get back to you within two business days.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">
              Bug reports & feature requests
            </h2>
            <p className="mt-3 text-gray-300">
              Found something unexpected or want to see a new workflow? Head to
              our GitHub repository to open an issue or contribute a fix—we tag
              good first issues and roadmap priorities.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <a
                href="https://github.com/vocalapp-ai/vocalapp/issues/new/choose"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#d856bf] to-[#03b3c3] px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105"
              >
                Open an issue
              </a>
              <a
                href="https://github.com/vocalapp-ai/vocalapp"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
              >
                View repository
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">
              Billing or account issues
            </h2>
            <p className="mt-3 text-gray-300">
              Billing is paused during the closed beta, but if you have account
              concerns or compliance requests, let us know and we’ll coordinate
              a secure channel for any sensitive data.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-transparent p-8 text-center backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Prefer async updates?
          </h2>
          <p className="text-gray-300 mb-6">
            We share release notes and upcoming cohort details via email. Join
            the waitlist to get updates the moment we expand access.
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#d856bf] to-[#03b3c3] px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105"
          >
            Join the waitlist
          </a>
        </section>

        <div className="pt-8">
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
