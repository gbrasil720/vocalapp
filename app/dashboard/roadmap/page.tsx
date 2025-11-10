import dynamic from 'next/dynamic'
import Link from 'next/link'
import MarkdownViewer from '@/components/markdown-viewer'
import SpotlightCard from '@/components/SpotlightCard'
import { Badge } from '@/components/ui/badge'
import { getPublishedRoadmapEntries } from '@/lib/data/beta-content'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

const LazyHyperspeed = dynamic(() =>
  import('@/components/lazy-hyperspeed').then((mod) => mod.LazyHyperspeed)
)

const STATUS_META = {
  planned: {
    label: 'Planned',
    badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-[#03b3c3]/20 text-[#03b3c3] border border-[#03b3c3]/40'
  },
  shipped: {
    label: 'Shipped',
    badge: 'bg-green-500/20 text-green-300 border border-green-500/30'
  }
} as const

export const metadata = generateSEOMetadata({
  title: 'Beta Roadmap',
  description:
    'See what the vocalapp team is building next. Updated continuously during the beta.',
  path: '/dashboard/roadmap',
  noindex: true
})

export default async function RoadmapPage() {
  const entries = await getPublishedRoadmapEntries()

  return (
    <>
      <div className="hidden md:block fixed inset-0 z-0 opacity-40">
        <LazyHyperspeed />
      </div>
      <div className="relative min-h-screen z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(3,179,195,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(216,86,191,0.12),transparent_60%)]" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-12 text-gray-200">
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#03b3c3]/40 bg-[#03b3c3]/15 px-4 py-1 text-sm font-semibold text-[#03b3c3]">
                Beta roadmap
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-white md:text-5xl">
                  Building vocalapp in the open
                </h1>
                <p className="max-w-3xl text-lg text-gray-300">
                  Every roadmap item starts as tester feedback. Follow what’s
                  planned, what we’re actively building, and the milestones we
                  just shipped.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  ← Back to dashboard
                </Link>
                <Link
                  href="/dashboard/changelog"
                  className="inline-flex items-center rounded-full border border-[#d856bf]/30 bg-[#d856bf]/10 px-4 py-2 font-semibold text-[#d856bf] transition hover:border-[#d856bf]/50 hover:bg-[#d856bf]/20"
                >
                  View latest changelog →
                </Link>
              </div>
            </header>

            {entries.length === 0 ? (
              <SpotlightCard className="bg-white/5 text-center text-gray-400">
                <div className="py-12">
                  <h2 className="text-xl font-semibold text-white">
                    Roadmap coming soon
                  </h2>
                  <p className="mt-3 text-sm text-gray-400">
                    We’ll publish upcoming milestones here as soon as they’re
                    ready. Check back after the next release cycle.
                  </p>
                </div>
              </SpotlightCard>
            ) : (
              <div className="space-y-6">
                {entries.map((entry) => {
                  const meta = STATUS_META[entry.status]
                  const formattedDate = new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }).format(new Date(entry.updatedAt))

                  return (
                    <SpotlightCard
                      key={entry.id}
                      className="bg-white/5 backdrop-blur-xl border border-white/10"
                      spotlightColor="rgba(3, 179, 195, 0.2)"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <Badge
                            variant="outline"
                            className={`uppercase tracking-wide text-xs font-semibold ${meta.badge}`}
                          >
                            {meta.label}
                          </Badge>
                          <h2 className="text-2xl font-semibold text-white">
                            {entry.title}
                          </h2>
                          <p className="text-sm text-gray-400">
                            {entry.category ?? 'General'} · Updated{' '}
                            {formattedDate}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>Sort priority</p>
                          <span className="text-lg font-semibold text-white">
                            {entry.sortOrder}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 space-y-4">
                        <MarkdownViewer content={entry.content} />
                        {entry.status === 'shipped' ? (
                          <p className="text-sm text-[#03b3c3]">
                            ✅ Available for all beta users now.
                          </p>
                        ) : null}
                      </div>
                    </SpotlightCard>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
