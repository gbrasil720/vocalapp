/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { AudioLines } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLoading() {
  return (
    <>
      <div className="fixed inset-0 z-0 opacity-40 bg-gradient-to-b from-black via-gray-900 to-black" />

      <div className="relative min-h-screen z-10">
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <AudioLines
                  size={24}
                  strokeWidth={1.5}
                  className="text-[#03b3c3]"
                />
                <span className="font-['Satoshi'] font-medium text-xl">
                  vocalapp
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="h-8 w-24 bg-white/10 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-12 w-96 bg-gradient-to-r from-white/10 to-white/5 rounded-lg mb-2 animate-pulse" />
            <div className="h-6 w-64 bg-white/5 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={`stat-card-${i}`}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-white/10 rounded mb-3" />
                    <div className="h-8 w-16 bg-white/20 rounded mb-2" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="h-6 w-32 bg-white/10 rounded mb-4 animate-pulse" />
              <div className="h-32 bg-white/5 rounded-2xl mb-4 animate-pulse" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={`upload-stat-${i}`} className="text-center">
                    <div className="h-8 w-16 bg-white/10 rounded mx-auto mb-2 animate-pulse" />
                    <div className="h-3 w-20 bg-white/5 rounded mx-auto animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="h-6 w-24 bg-white/10 rounded mb-6 animate-pulse" />
              <div className="h-8 w-32 bg-white/10 rounded mb-4 animate-pulse" />
              <div className="space-y-4 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`plan-feature-${i}`}
                    className="h-4 bg-white/5 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-6 w-24 bg-white/5 rounded animate-pulse" />
            </div>

            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`transcription-skeleton-${i}`}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-white/10 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-5 w-48 bg-white/10 rounded mb-2" />
                        <div className="h-3 w-64 bg-white/5 rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-24 bg-white/10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
