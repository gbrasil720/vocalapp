'use client'

import {
  Clock01Icon,
  EarthIcon,
  File02Icon,
  GlobeIcon,
  Upload01Icon,
  ZapIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AudioLines,
  BarChart3,
  ChevronRight,
  Clock,
  Crown,
  Download,
  FileText,
  Globe,
  Map as MapIcon,
  Newspaper,
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
import { CommandInput } from '@/components/command-input'
import { DashboardFooter } from '@/components/dashboard-footer'
import ElectricBorder from '@/components/ElectricBorder'
import { FileUpload } from '@/components/file-upload'
import { LazyHyperspeed } from '@/components/lazy-hyperspeed'
import { LoadingScreen } from '@/components/loading-screen'
import SpotlightCard from '@/components/SpotlightCard'
import { TranscriptionCard } from '@/components/transcription-card'
import { UserNav } from '@/components/user-nav'
import { UserPlanCard } from '@/components/user-plan-card'
import { authClient } from '@/lib/auth-client'

interface UserStats {
  credits: number
  isBetaUser: boolean
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

  const recentTranscriptions = transcriptions.slice(0, 10)
  const sessionBetaUser =
    session.user && 'isBetaUser' in session.user
      ? Boolean((session.user as { isBetaUser?: unknown }).isBetaUser)
      : false
  const isBetaUser = stats?.isBetaUser ?? sessionBetaUser

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
                  vocalapp
                </span>
              </Link>

              <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  <CommandInput />
                </div>

                <UserNav />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <h1 className="font-['Satoshi'] text-4xl md:text-5xl font-bold text-primary">
                Welcome back, {session.user.name?.split(' ')[0] || 'there'}!
              </h1>
              {isBetaUser ? <BetaBadge variant="large" /> : null}
            </div>
            <p className="text-gray-400 text-lg">
              {isBetaUser
                ? "You're a beta tester! Help us shape the future of transcription. 🚀"
                : 'Need more credits or features? Upgrade to Pro for the full experience.'}
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
                  <HugeiconsIcon icon={ZapIcon} size={22} color="#03b3c3" />
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
                  <HugeiconsIcon icon={Clock01Icon} size={22} color="#c247ac" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-gray-400">
                <HugeiconsIcon icon={File02Icon} size={16} />
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
                  <HugeiconsIcon icon={File02Icon} size={22} color="#d856bf" />
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
                  <HugeiconsIcon icon={GlobeIcon} size={22} color="#03b3c3" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                {stats.plan.isActive
                  ? `50+ languages supported`
                  : '10 languages supported'}
              </div>
            </SpotlightCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="block md:hidden bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-['Satoshi'] text-2xl font-bold text-primary mb-2">
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
                        <h2 className="font-['Satoshi'] text-2xl font-bold text-primary mb-2">
                          Upload Audio
                        </h2>
                        <p className="text-gray-400 text-sm">
                          Drag and drop your audio file or click to browse
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#d856bf]/20">
                        <HugeiconsIcon
                          icon={Upload01Icon}
                          size={22}
                          color="#d856bf"
                        />
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

            <UserPlanCard stats={stats} />
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
                  <TranscriptionCard
                    transcription={transcription}
                    key={transcription.id}
                  />
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/analytics">
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
            </Link>

            <Link href="/dashboard/billing">
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
            </Link>

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

          <DashboardFooter isBetaUser={isBetaUser} />
        </div>
      </div>
    </>
  )
}
