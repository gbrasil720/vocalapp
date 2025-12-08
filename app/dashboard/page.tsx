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
  TriangleAlert,
  Upload,
  X,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { UserNav } from '@/components/user-nav'
import { UserPlanCard } from '@/components/user-plan-card'
import { authClient } from '@/lib/auth-client'
import { useHyperspeed } from '@/lib/hyperspeed-context'

interface UserStats {
  credits: number
  isBetaUser: boolean
  hasPassword?: boolean
  signupMethod?: 'google' | 'magic-link' | 'email'
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
  isPublic: boolean
}

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession()
  const { hyperspeedEnabled } = useHyperspeed()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  // const [showPasswordAlert, setShowPasswordAlert] = useState(true)

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

  const recentTranscriptions = transcriptions.slice(0, 6)
  const sessionBetaUser =
    session.user && 'isBetaUser' in session.user
      ? Boolean((session.user as { isBetaUser?: unknown }).isBetaUser)
      : false
  const isBetaUser = stats?.isBetaUser ?? sessionBetaUser

  return (
    <>
      {hyperspeedEnabled && (
        <div className="hidden md:block fixed inset-0 z-0 opacity-40">
          <LazyHyperspeed />
        </div>
      )}

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
          {/* {stats.hasPassword === false && showPasswordAlert && (
            <div className="mb-8">
              <Alert
                variant="destructive"
                className="bg-red-900/10 border-red-900/20 text-red-200 pr-12"
              >
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>No Password Set</AlertTitle>
                <AlertDescription>
                  <p>
                    We detected that{' '}
                    {stats.signupMethod === 'google'
                      ? 'you signed up via Google. '
                      : stats.signupMethod === 'magic-link'
                        ? 'you signed up via Magic Link. '
                        : "you currently don't have a password set. "}
                    We strongly recommend setting a password in your{' '}
                    <Link
                      href="/dashboard/settings"
                      className="font-medium underline underline-offset-4 hover:text-red-100"
                    >
                      settings
                    </Link>{' '}
                    to enable email/password authentication.
                  </p>
                </AlertDescription>
                <button
                  onClick={() => setShowPasswordAlert(false)}
                  className="absolute right-4 top-4 p-1 rounded-md hover:bg-red-900/20 text-red-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </Alert>
            </div>
          )} */}

          {hyperspeedEnabled && (
            <div className="hidden md:flex mb-6 flex items-center justify-center">
              <p className="text-xs text-gray-500">
                <span className="opacity-70">💡 Tip:</span> You can disable the background effect in{' '}
                <Link href="/dashboard/settings" className="text-gray-400 hover:text-white underline underline-offset-2">
                  Settings → Appearance
                </Link>
              </p>
            </div>
          )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Credits Left */}
            <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">
                    Credits Left
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {stats.credits}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <HugeiconsIcon icon={ZapIcon} size={18} className="text-cyan-400" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    {stats.plan.isActive ? `of ${stats.plan.totalCredits} monthly` : 'Free tier'}
                  </span>
                  <span className="text-gray-400">
                    {Math.round((stats.credits / stats.plan.totalCredits) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-[#d856bf] h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min((stats.credits / stats.plan.totalCredits) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Minutes Used */}
            <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">
                    Minutes Used
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {stats.usage.minutesUsed}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-[#c247ac]/10 border border-[#c247ac]/20">
                  <HugeiconsIcon icon={Clock01Icon} size={18} className="text-[#c247ac]" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <HugeiconsIcon icon={File02Icon} size={14} />
                <span className="text-xs">
                  {stats.usage.transcriptionsCount} transcription{stats.usage.transcriptionsCount !== 1 ? 's' : ''} total
                </span>
              </div>
            </div>

            {/* Transcriptions */}
            <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">
                    Transcriptions
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {stats.usage.transcriptionsCount}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-[#d856bf]/10 border border-[#d856bf]/20">
                  <HugeiconsIcon icon={File02Icon} size={18} className="text-[#d856bf]" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <HugeiconsIcon icon={Clock01Icon} size={14} />
                <span className="text-xs">
                  {stats.usage.minutesUsed} minute{stats.usage.minutesUsed !== 1 ? 's' : ''} processed
                </span>
              </div>
            </div>

            {/* Languages */}
            <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">
                    Languages
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {stats.usage.languagesUsed}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <HugeiconsIcon icon={GlobeIcon} size={18} className="text-cyan-400" />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {stats.plan.isActive
                  ? '50+ languages supported'
                  : '10 languages available'}
              </div>
            </div>
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-700 hover:border-zinc-600 text-gray-300 hover:text-white rounded-lg transition-all text-sm font-medium"
              >
                View All Transcriptions
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTranscriptions.length === 0 ? (
                <div className="col-span-full text-center py-12">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/analytics"
              className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
            >
              <div className="text-center">
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 inline-flex mb-4 group-hover:border-cyan-500/40 transition-all">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">View Analytics</h3>
                <p className="text-xs text-gray-500">
                  Track your usage and performance metrics
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/billing"
              className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
            >
              <div className="text-center">
                <div className="p-3 rounded-lg bg-[#c247ac]/10 border border-[#c247ac]/20 inline-flex mb-4 group-hover:border-[#c247ac]/40 transition-all">
                  <Zap className="w-5 h-5 text-[#c247ac]" />
                </div>
                <h3 className="font-semibold text-white mb-2">Buy Credits</h3>
                <p className="text-xs text-gray-500">
                  Top up your account with credit packs
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings"
              className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
            >
              <div className="text-center">
                <div className="p-3 rounded-lg bg-[#d856bf]/10 border border-[#d856bf]/20 inline-flex mb-4 group-hover:border-[#d856bf]/40 transition-all">
                  <Settings className="w-5 h-5 text-[#d856bf]" />
                </div>
                <h3 className="font-semibold text-white mb-2">Settings</h3>
                <p className="text-xs text-gray-500">
                  Customize your preferences and settings
                </p>
              </div>
            </Link>
          </div>

          <DashboardFooter isBetaUser={isBetaUser} />
        </div>
      </div>
    </>
  )
}
