'use client'

import {
  AudioLines,
  BarChart3,
  ChevronRight,
  Clock,
  Crown,
  Download,
  FileText,
  Globe,
  Settings,
  Sparkles,
  Upload,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BetaBadge } from '@/components/beta-badge'
import ElectricBorder from '@/components/ElectricBorder'
import { FileUpload } from '@/components/file-upload'
import { LazyHyperspeed } from '@/components/lazy-hyperspeed'
import { LoadingScreen } from '@/components/loading-screen'
import SpotlightCard from '@/components/SpotlightCard'
import { UserNav } from '@/components/user-nav'
import { authClient } from '@/lib/auth-client'

interface UserStats {
  credits: number
  plan: {
    name: string
    isActive: boolean
    totalCredits: number
    nextBillingDate: string | null
  }
  usage: {
    minutesUsed: number
    transcriptionsCount: number
    languagesUsed: number
  }
}

interface Transcription {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  duration: number | null
  language: string | null
  status: 'processing' | 'completed' | 'failed'
  creditsUsed: number | null
  createdAt: string
  completedAt: string | null
}

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])

  useEffect(() => {
    if (!isPending && !session) {
      redirect('/sign-in')
    }
  }, [session, isPending])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/user/stats', {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchTranscriptions = useCallback(async () => {
    try {
      const response = await fetch('/api/transcriptions', {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setTranscriptions(data.transcriptions || [])
      }
    } catch (error) {
      console.error('Error fetching transcriptions:', error)
    }
  }, [])

  // Memoized helper function to format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = useCallback((seconds: number | null): string => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Memoized helper function to format relative time
  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }, [])

  useEffect(() => {
    if (session) {
      fetchStats()
      fetchTranscriptions()
    }
  }, [session, fetchStats, fetchTranscriptions])

  if (isPending || loadingStats) {
    return <LoadingScreen />
  }

  if (!session || !stats) {
    return null
  }

  // Get the first 10 transcriptions for display
  const recentTranscriptions = transcriptions.slice(0, 10)

  return (
    <>
      <div className="hidden md:block fixed inset-0 z-0 opacity-40">
        <LazyHyperspeed />
      </div>

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
                  vocal.app
                </span>
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Billing
                </Link>
                <UserNav />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent">
                Welcome back, {session.user.name?.split(' ')[0] || 'there'}!
              </h1>
              <BetaBadge variant="large" />
            </div>
            <p className="text-gray-400 text-lg">
              You're a beta tester! Help us shape the future of transcription.
              🚀
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SpotlightCard
              className="bg-transparent backdrop-blur-xl"
              spotlightColor="rgba(3, 179, 195, 0.3)"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Credits Left</p>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {stats.credits}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {stats.plan.isActive
                      ? `of ${stats.plan.totalCredits} monthly`
                      : 'Free tier'}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-[#03b3c3]/20">
                  <Zap className="w-5 h-5 text-[#03b3c3]" />
                </div>
              </div>
              <div className="mt-4 w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#03b3c3] to-[#d856bf] h-2 rounded-full"
                  style={{
                    width: `${Math.min((stats.credits / stats.plan.totalCredits) * 100, 100)}%`
                  }}
                />
              </div>
            </SpotlightCard>

            <SpotlightCard
              className="bg-transparent backdrop-blur-xl"
              spotlightColor="rgba(200, 71, 172, 0.3)"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Minutes Used</p>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {stats.usage.minutesUsed}
                  </h3>
                  <p className="text-xs text-gray-500">total</p>
                </div>
                <div className="p-2 rounded-xl bg-[#c247ac]/20">
                  <Clock className="w-5 h-5 text-[#c247ac]" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-gray-400">
                <FileText className="w-3 h-3" />
                <span className="text-xs">
                  {stats.usage.transcriptionsCount} transcription
                  {stats.usage.transcriptionsCount !== 1 ? 's' : ''}
                </span>
              </div>
            </SpotlightCard>

            <SpotlightCard
              className="bg-transparent backdrop-blur-xl"
              spotlightColor="rgba(216, 86, 191, 0.3)"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Transcriptions</p>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {stats.usage.transcriptionsCount}
                  </h3>
                  <p className="text-xs text-gray-500">completed</p>
                </div>
                <div className="p-2 rounded-xl bg-[#d856bf]/20">
                  <FileText className="w-5 h-5 text-[#d856bf]" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  {stats.usage.minutesUsed} minute
                  {stats.usage.minutesUsed !== 1 ? 's' : ''} total
                </span>
              </div>
            </SpotlightCard>

            <SpotlightCard
              className="bg-transparent backdrop-blur-xl"
              spotlightColor="rgba(3, 179, 195, 0.3)"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Languages</p>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {stats.usage.languagesUsed}
                  </h3>
                  <p className="text-xs text-gray-500">available</p>
                </div>
                <div className="p-2 rounded-xl bg-[#03b3c3]/20">
                  <Globe className="w-5 h-5 text-[#03b3c3]" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                50+ languages supported
              </div>
            </SpotlightCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              {/* Mobile version - no electric border */}
              <div className="block md:hidden bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Upload Audio
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Drag and drop your audio file or click to browse
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#d856bf]/20">
                    <Upload className="w-6 h-6 text-[#d856bf]" />
                  </div>
                </div>

                <FileUpload
                  onUploadComplete={() => {
                    toast.success('Upload complete! Refreshing...')
                    setTimeout(() => {
                      fetchStats()
                      fetchTranscriptions()
                    }, 1000)
                  }}
                  isPro={stats.plan.isActive}
                />

                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.credits}
                    </p>
                    <p className="text-xs text-gray-400">Credits Available</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.usage.transcriptionsCount}
                    </p>
                    <p className="text-xs text-gray-400">Transcriptions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.usage.minutesUsed}
                    </p>
                    <p className="text-xs text-gray-400">Minutes</p>
                  </div>
                </div>
              </div>
              {/* Desktop version - with electric border */}
              <div className="hidden md:block">
                <ElectricBorder
                  color="#d856bf"
                  speed={1.5}
                  chaos={0.6}
                  thickness={2}
                  className="rounded-3xl h-full"
                >
                  <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Upload Audio
                        </h2>
                        <p className="text-gray-400 text-sm">
                          Drag and drop your audio file or click to browse
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#d856bf]/20">
                        <Upload className="w-6 h-6 text-[#d856bf]" />
                      </div>
                    </div>

                    <FileUpload
                      onUploadComplete={() => {
                        toast.success('Upload complete! Refreshing...')
                        setTimeout(() => {
                          fetchStats()
                          fetchTranscriptions()
                        }, 1000)
                      }}
                      isPro={stats.plan.isActive}
                    />

                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {stats.credits}
                        </p>
                        <p className="text-xs text-gray-400">
                          Credits Available
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {stats.usage.transcriptionsCount}
                        </p>
                        <p className="text-xs text-gray-400">Transcriptions</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {stats.usage.minutesUsed}
                        </p>
                        <p className="text-xs text-gray-400">Minutes</p>
                      </div>
                    </div>
                  </div>
                </ElectricBorder>
              </div>
            </div>

            <div className="lg:col-span-1">
              <SpotlightCard className="bg-transparent backdrop-blur-xl h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Your Plan</h2>
                    <Crown className="w-5 h-5 text-[#d856bf]" />
                  </div>

                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 ${
                        stats.plan.isActive
                          ? 'bg-gradient-to-r from-[#d856bf]/20 to-[#c247ac]/20 border border-[#d856bf]/30'
                          : 'bg-white/5 border border-white/10'
                      } rounded-full px-4 py-2 mb-4`}
                    >
                      {stats.plan.isActive ? (
                        <Crown className="w-4 h-4 text-[#d856bf]" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-semibold text-white">
                        {stats.plan.name
                          .split(' ')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(' ')}
                      </span>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${stats.plan.isActive ? 'bg-green-400' : 'bg-gray-400'}`}
                        />
                        <span className="text-sm text-gray-300">
                          {stats.plan.totalCredits} credits
                          {stats.plan.isActive ? '/month' : ' free'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${stats.plan.isActive ? 'bg-green-400' : 'bg-gray-400'}`}
                        />
                        <span className="text-sm text-gray-300">
                          50+ languages
                        </span>
                      </div>
                      {stats.plan.isActive && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-sm text-gray-300">
                            Priority support
                          </span>
                        </div>
                      )}
                    </div>

                    {stats.plan.isActive && stats.plan.nextBillingDate ? (
                      <div className="bg-white/5 rounded-2xl p-4 mb-4">
                        <p className="text-xs text-gray-400 mb-2">
                          Next billing
                        </p>
                        <p className="text-sm font-semibold text-white">
                          {stats.plan.nextBillingDate}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          $10.00/month
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-2xl p-4 mb-4">
                        <p className="text-xs text-gray-400 mb-2">
                          Want more credits?
                        </p>
                        <p className="text-sm font-semibold text-white">
                          Upgrade to Pro
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          600 credits/month
                        </p>
                      </div>
                    )}
                  </div>

                  {stats.plan.isActive ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/billing/portal', {
                            method: 'POST'
                          })
                          if (response.ok) {
                            const { url } = await response.json()
                            window.location.href = url
                          } else {
                            const errorData = await response.json()
                            if (errorData.error?.includes('configuration')) {
                              toast.error(
                                'Billing portal not configured yet. Please use the billing page.'
                              )
                            } else {
                              toast.error('Failed to open billing portal')
                            }
                          }
                        } catch (error) {
                          console.error('Error opening portal:', error)
                          toast.error('Failed to open billing portal')
                        }
                      }}
                      className="w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all text-center"
                    >
                      Manage Plan
                    </button>
                  ) : (
                    <Link
                      href="/#pricing"
                      className="w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all text-center"
                    >
                      Upgrade Plan
                    </Link>
                  )}
                </div>
              </SpotlightCard>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Recent Transcriptions
              </h2>
              <Link
                href="/dashboard/transcriptions"
                className="text-[#03b3c3] hover:text-[#d856bf] transition-colors text-sm flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentTranscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">
                    No transcriptions yet
                  </p>
                  <p className="text-gray-500 text-sm">
                    Upload an audio file to get started
                  </p>
                </div>
              ) : (
                recentTranscriptions.map((transcription) => (
                  <Link
                    key={transcription.id}
                    href={`/dashboard/transcription/${transcription.id}`}
                  >
                    <SpotlightCard className="bg-transparent backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 rounded-xl bg-white/5">
                            <FileText className="w-5 h-5 text-[#03b3c3]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">
                              {transcription.fileName}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(transcription.duration)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {transcription.language || 'Unknown'}
                              </span>
                              <span>
                                {formatRelativeTime(transcription.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {transcription.status === 'completed' ? (
                            <>
                              <span className="px-3 py-1 bg-green-400/20 text-green-400 text-xs rounded-full">
                                Completed
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                              >
                                <Download className="w-4 h-4 text-gray-400 hover:text-white" />
                              </button>
                            </>
                          ) : transcription.status === 'failed' ? (
                            <span className="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded-full">
                              Failed
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-[#d856bf]/20 text-[#d856bf] text-xs rounded-full animate-pulse">
                              Processing...
                            </span>
                          )}
                        </div>
                      </div>
                    </SpotlightCard>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard className="bg-transparent backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform">
              <div className="text-center">
                <div className="p-4 rounded-full bg-[#03b3c3]/20 inline-block mb-4">
                  <BarChart3 className="w-6 h-6 text-[#03b3c3]" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  View Analytics
                </h3>
                <p className="text-sm text-gray-400">
                  Track your usage and performance metrics
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-transparent backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform">
              <div className="text-center">
                <div className="p-4 rounded-full bg-[#c247ac]/20 inline-block mb-4">
                  <Zap className="w-6 h-6 text-[#c247ac]" />
                </div>
                <h3 className="font-semibold text-white mb-2">Buy Credits</h3>
                <p className="text-sm text-gray-400">
                  Top up your account with credit packs
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-transparent backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform">
              <div className="text-center">
                <div className="p-4 rounded-full bg-[#d856bf]/20 inline-block mb-4">
                  <Settings className="w-6 h-6 text-[#d856bf]" />
                </div>
                <h3 className="font-semibold text-white mb-2">Settings</h3>
                <p className="text-sm text-gray-400">
                  Customize your preferences and settings
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </>
  )
}
