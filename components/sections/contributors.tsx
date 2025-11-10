'use client'

import {
  Building02Icon,
  CompassIcon,
  PuzzleIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

const partnerHighlights = [
  {
    title: 'Ship features with us',
    description:
      'Pick up an issue, ship a PR, and shape the roadmap for accessible voice tooling. We celebrate every contribution publicly.',
    icon: CompassIcon
  },
  {
    title: 'Join the maintainer crew',
    description:
      'Collaborators who return often get early feature previews, design reviews, and a seat in our contributor syncs.',
    icon: Building02Icon
  },
  {
    title: 'Show up on the wall',
    description:
      'Merge something meaningful and we’ll spotlight you on this page, release notes, and inside the app once we launch.',
    icon: PuzzleIcon
  }
]

export function Contributors() {
  return (
    <section className="relative z-10 py-20 px-6" id="contributors">
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight mb-6">
          Community Contributors
        </h2>
        <p className="text-xl text-[#03b3c3]/90 leading-relaxed max-w-2xl mx-auto">
          Vocal is open source. This space highlights the builders who keep the
          project moving—your name can live here next.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {partnerHighlights.map((highlight) => (
          <div
            key={highlight.title}
            className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-2 hover:border-white/20"
          >
            <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E5E5E5] border border-white/10">
              <HugeiconsIcon icon={highlight.icon} color="#1f1f1f" size={28} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              {highlight.title}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {highlight.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 max-w-3xl mx-auto text-center">
        <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-10">
          <p className="text-lg text-gray-300 mb-6">
            Want to see your avatar here? Dive into an issue, open a pull
            request, or share improvements—we review contributions every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://github.com/gbrasil720/vocalapp/issues"
              className="px-8 py-3 rounded-full bg-[#d856bf] text-white font-semibold transition-transform duration-300 hover:scale-105"
            >
              Browse Open Issues
            </Link>
            <Link
              href="https://github.com/gbrasil720/vocalapp"
              className="px-8 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-transform duration-300 hover:scale-105"
            >
              Contribute on GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
