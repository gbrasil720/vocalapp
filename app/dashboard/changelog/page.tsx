import dynamic from 'next/dynamic'
import Link from 'next/link'
import MarkdownViewer from '@/components/markdown-viewer'
import SpotlightCard from '@/components/SpotlightCard'
import { Badge } from '@/components/ui/badge'
import { getPublishedChangelogEntries } from '@/lib/data/beta-content'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

const TAG_STYLES = {
  feature: 'bg-[#03b3c3]/15 text-[#03b3c3] border border-[#03b3c3]/40',
  improvement: 'bg-[#d856bf]/15 text-[#d856bf] border border-[#d856bf]/40',
  fix: 'bg-red-500/15 text-red-400 border border-red-500/40',
  announcement: 'bg-purple-500/15 text-purple-300 border border-purple-500/40',
  other: 'bg-white/10 text-gray-200 border border-white/20'
} as const

const LazyHyperspeed = dynamic(() =>
  import('@/components/lazy-hyperspeed').then((mod) => mod.LazyHyperspeed)
)

export const metadata = generateSEOMetadata({
  title: 'Beta Changelog',
  description:
    'Track weekly improvements to vocalapp during the beta period. Fresh notes every Friday.',
  path: '/dashboard/changelog',
  noindex: true
})

export default async function ChangelogPage() {
  const entries = await getPublishedChangelogEntries()

  return (
    <>
      <div className="hidden md:block fixed inset-0 z-0 opacity-40">
        <LazyHyperspeed />
      </div>
      <div className="relative min-h-screen z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_30%,rgba(216,86,191,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_75%,rgba(3,179,195,0.12),transparent_60%)]" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-12 text-gray-200">
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d856bf]/40 bg-[#d856bf]/15 px-4 py-1 text-sm font-semibold text-[#d856bf]">
                Release notes
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-white md:text-5xl">
                  What shipped this week
                </h1>
                <p className="max-w-3xl text-lg text-gray-300">
                  Friday drops are the heartbeat of the beta. Browse new
                  features, improvements, and bug fixes, or jump to the roadmap
                  to see what’s next.
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
                  href="/dashboard/roadmap"
                  className="inline-flex items-center rounded-full border border-[#03b3c3]/30 bg-[#03b3c3]/10 px-4 py-2 font-semibold text-[#03b3c3] transition hover:border-[#03b3c3]/50 hover:bg-[#03b3c3]/20"
                >
                  View roadmap →
                </Link>
              </div>
            </header>

            {entries.length === 0 ? (
              <SpotlightCard className="bg-white/5 text-center text-gray-400">
                <div className="py-12">
                  <h2 className="text-xl font-semibold text-white">
                    No releases… yet
                  </h2>
                  <p className="mt-3 text-sm text-gray-400">
                    Release notes will appear here after the next deployment.
                    Keep an eye on the roadmap in the meantime.
                  </p>
                </div>
              </SpotlightCard>
            ) : (
              <div className="space-y-6">
                {entries.map((entry) => {
                  const tagClass = TAG_STYLES[entry.tag] ?? TAG_STYLES.other
                  const publishedDate = entry.publishedAt
                    ? new Date(entry.publishedAt)
                    : new Date(entry.createdAt)
                  const formattedDate = new Intl.DateTimeFormat('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }).format(publishedDate)

                  return (
                    <SpotlightCard
                      key={entry.id}
                      className="bg-white/5 backdrop-blur-xl border border-white/10"
                      spotlightColor="rgba(216, 86, 191, 0.25)"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <Badge
                            variant="outline"
                            className={`uppercase tracking-wide text-xs font-semibold ${tagClass}`}
                          >
                            {entry.tag.replace('_', ' ')}
                          </Badge>
                          <h2 className="text-2xl font-semibold text-white">
                            {entry.title}
                          </h2>
                          <p className="text-sm text-gray-400">
                            {formattedDate}
                            {entry.category ? ` · ${entry.category}` : ''}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>Entry ID</p>
                          <span className="text-sm font-mono text-white/80">
                            {entry.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 space-y-4">
                        <MarkdownViewer content={entry.content} />
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          Updated{' '}
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }).format(new Date(entry.updatedAt))}
                        </p>
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
