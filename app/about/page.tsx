import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Vocal',
  description:
    'Learn why we are building Vocal and how our closed beta is shaping the future of voice-driven workflows.'
}

export default function AboutPage() {
  return (
    <div className="relative z-10 py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-12 text-gray-200">
        <header className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#03b3c3]/10 border border-[#03b3c3]/30 px-4 py-1 text-sm font-semibold text-[#03b3c3]">
            Behind the scenes
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            About Vocal
          </h1>
          <p className="text-lg text-gray-300">
            Vocal exists to make transcription fast, accurate, and accessible to
            every creator. We’re a small team exploring what happens when
            AI-native tooling meets human-first design.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            Why a closed beta?
          </h2>
          <p>
            We’re focused on building with intention, which means shipping
            features alongside the people who rely on them each day. The closed
            beta gives us space to learn from real teams, respond quickly, and
            keep things reliable before we invite everyone in.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            How we’re building
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>
              Transparent roadmap and changelog updates shared with our testers
            </li>
            <li>
              Open-source core that welcomes new contributors and community
              stewarding
            </li>
            <li>
              Privacy-by-design infrastructure backed by modern compliance
              standards
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            Join the journey
          </h2>
          <p>
            Want to help shape what we’re building? Join the waitlist,
            contribute on GitHub, or drop us a note. We’re always excited to
            hear from people who care about making voice more useful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#d856bf] to-[#03b3c3] px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105"
            >
              Join the waitlist
            </a>
            <a
              href="https://github.com/vocalapp-ai/vocalapp"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
            >
              Visit our GitHub
            </a>
          </div>
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
