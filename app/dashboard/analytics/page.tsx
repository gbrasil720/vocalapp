'use client'

import {
  Activity03Icon,
  BarChartHorizontalIcon,
  Calendar02Icon,
  Chart03Icon,
  Clock01Icon,
  Download01Icon,
  LanguageCircleIcon,
  SecurityCheckIcon,
  TradeUpIcon,
  Wallet02Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  AudioLines,
  Wallet2
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BetaBadge } from '@/components/beta-badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardFooter } from '@/components/dashboard-footer'
import ElectricBorder from '@/components/ElectricBorder'
import { LazyHyperspeed } from '@/components/lazy-hyperspeed'
import { LoadingScreen } from '@/components/loading-screen'
import SpotlightCard from '@/components/SpotlightCard'
import { UserNav } from '@/components/user-nav'
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

interface CreditTransaction {
  id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund' | 'subscription_grant'
  description: string | null
  stripePaymentIntentId: string | null
  dodoPaymentsPaymentId: string | null
  createdAt: string
}

interface UsageSeriesPoint {
  dayLabel: string
  count: number
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

function formatCredits(value: number) {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  return `${value > 0 ? '+' : ''}${formatter.format(value)} credits`
}

function formatMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60
  return `${hours}h ${restMinutes}m`
}

function averageDuration(transcriptions: Transcription[]) {
  const completed = transcriptions.filter(
    (t) => t.status === 'completed' && typeof t.duration === 'number'
  )
  if (!completed.length) return 0
  const totalSeconds = completed.reduce((sum, t) => sum + (t.duration ?? 0), 0)
  return totalSeconds / completed.length
}

function secondsToMinutes(seconds: number) {
  return `${Math.round(seconds / 60)} min`
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getUsageSeries(transcriptions: Transcription[]): UsageSeriesPoint[] {
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - i)
    days.push(date)
  }

  const counts = new Map<string, number>()
  days.forEach((date) => {
    counts.set(getLocalDateKey(date), 0)
  })

  transcriptions.forEach((t) => {
    const created = new Date(t.createdAt)
    const key = getLocalDateKey(created)
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  })

  return days.map((date) => {
    const key = getLocalDateKey(date)
    return {
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: counts.get(key) ?? 0
    }
  })
}

function getTopLanguages(transcriptions: Transcription[]) {
  const counts: Record<string, number> = {}
  transcriptions.forEach((t) => {
    const lang = t.language ?? 'unknown'
    counts[lang] = (counts[lang] ?? 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([language, count]) => ({ language, count }))
}

function getLongestRecordings(transcriptions: Transcription[]) {
  return transcriptions
    .filter((t) => typeof t.duration === 'number')
    .sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0))
    .slice(0, 3)
}

function getRecentFailures(transcriptions: Transcription[]) {
  return transcriptions.filter((t) => t.status === 'failed').slice(0, 3)
}

export default function AnalyticsPage() {
  const { data: session, isPending } = authClient.useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      redirect('/sign-in')
    }
  }, [session, isPending])

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const [statsRes, transcriptionsRes, transactionsRes] = await Promise.all([
        fetch('/api/user/stats', { cache: 'no-store' }),
        fetch('/api/transcriptions', { cache: 'no-store' }),
        fetch('/api/credits/transactions', { cache: 'no-store' })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else {
        throw new Error('Failed to load usage stats')
      }

      if (transcriptionsRes.ok) {
        const transcriptionData = await transcriptionsRes.json()
        setTranscriptions(transcriptionData.transcriptions ?? [])
      } else {
        throw new Error('Failed to load transcriptions')
      }

      if (transactionsRes.ok) {
        const transactionData = await transactionsRes.json()
        setTransactions(transactionData.transactions ?? [])
      } else {
        throw new Error('Failed to load transactions')
      }
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : 'Unable to load analytics'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchAnalyticsData()
    }
  }, [session, fetchAnalyticsData])

  const derived = useMemo(() => {
    const totalTranscriptions = transcriptions.length
    const completed = transcriptions.filter((t) => t.status === 'completed')
    const failed = transcriptions.filter((t) => t.status === 'failed')
    const successRate = totalTranscriptions
      ? Math.round((completed.length / totalTranscriptions) * 100)
      : 100
    const avgDurationSeconds = averageDuration(completed)
    const usageSeries = getUsageSeries(transcriptions)
    const topLanguages = getTopLanguages(transcriptions)
    const longestRecordings = getLongestRecordings(completed)
    const recentFailures = getRecentFailures(transcriptions)

    const positiveTransactions = transactions.filter((t) => t.amount > 0)
    const negativeTransactions = transactions.filter((t) => t.amount < 0)
    const lifetimeCreditsPurchased = positiveTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    )
    const lifetimeCreditsUsed = negativeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    )
    const lastPurchase = positiveTransactions[0] ?? null

    return {
      totalTranscriptions,
      completedCount: completed.length,
      failedCount: failed.length,
      successRate,
      avgDurationSeconds,
      usageSeries,
      topLanguages,
      longestRecordings,
      recentFailures,
      lifetimeCreditsPurchased,
      lifetimeCreditsUsed,
      lastPurchase
    }
  }, [transcriptions, transactions])

  if (isPending || loading || !stats || !session) {
    return <LoadingScreen />
  }

  const cycleStart = new Date()
  cycleStart.setDate(cycleStart.getDate() - 30)
  const usageThisCycle = transactions
    .filter((t) => t.amount < 0 && new Date(t.createdAt) >= cycleStart)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const planUsagePercent = stats.plan.totalCredits
    ? Math.min((usageThisCycle / stats.plan.totalCredits) * 100, 100)
    : 0

  const maxUsageCount = Math.max(
    ...derived.usageSeries.map((point) => point.count),
    1
  )

  const isBetaUser = stats.isBetaUser

  return (
    <>
      <div className="hidden md:block fixed inset-0 z-0 opacity-40">
        <LazyHyperspeed />
      </div>

      <div className="relative min-h-screen z-10">
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <AudioLines
                        size={22}
                        strokeWidth={1.5}
                        className="text-[#03b3c3]"
                      />
                      <h1 className="text-2xl font-bold text-white">
                        Analytics
                      </h1>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Track usage, success rates, and financial activity
                  </p>
                </div>

                <UserNav />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-[#03b3c3]">
                  Usage intelligence
                </p>
                <h1 className="font-['Satoshi'] text-4xl md:text-5xl font-bold text-white">
                  Analytics & performance
                </h1>
                <p className="text-gray-400 mt-2">
                  Understand how your transcription workload impacts credits,
                  languages, and success over time.
                </p>
              </div>
              {isBetaUser ? <BetaBadge variant="large" /> : null}
            </div>

            <div className="hidden md:block">
              <ElectricBorder
                color="#03b3c3"
                speed={1.2}
                chaos={0.4}
                thickness={1.5}
                className="rounded-3xl"
              >
                <SpotlightCard className="bg-transparent backdrop-blur-2xl border-white/10">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        Active plan • {stats.plan.name}
                      </p>
                      <h2 className="text-3xl font-semibold text-white mb-2">
                        {stats.credits} credits remaining
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Reset date:{' '}
                        {stats.plan.nextBillingDate ?? 'No renewal scheduled'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Usage (last 30 days)</span>
                          <span>
                            {usageThisCycle} credits ·{' '}
                            {planUsagePercent.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div
                            className="bg-[#03b3c3]/90 h-2 rounded-full"
                            style={{ width: `${planUsagePercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-300">
                        <Link
                          href="/dashboard/billing"
                          className="flex items-center gap-1 text-[#03b3c3] hover:text-white transition-colors"
                        >
                          <HugeiconsIcon
                            icon={Wallet02Icon}
                            size={18}
                            color="#03b3c3"
                          />
                          Manage billing
                        </Link>
                        <Link
                          href="/dashboard/transcriptions"
                          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <HugeiconsIcon icon={Activity03Icon} size={18} />
                          View activity
                        </Link>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </ElectricBorder>
            </div>
            <div className="md:hidden">
              <SpotlightCard className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">
                      Active plan • {stats.plan.name}
                    </p>
                    <h2 className="text-3xl font-semibold text-white mb-2">
                      {stats.credits} credits remaining
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Reset date:{' '}
                      {stats.plan.nextBillingDate ?? 'No renewal scheduled'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Usage (last 30 days)</span>
                        <span>
                          {usageThisCycle} credits ·{' '}
                          {planUsagePercent.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="bg-[#03b3c3]/90 h-2 rounded-full"
                          style={{ width: `${planUsagePercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm text-gray-300">
                      <Link
                        href="/dashboard/billing"
                        className="flex items-center gap-1 text-[#03b3c3] hover:text-white transition-colors"
                      >
                        <HugeiconsIcon
                          icon={Wallet02Icon}
                          size={18}
                          color="#03b3c3"
                        />
                        Manage billing
                      </Link>
                      <Link
                        href="/dashboard/transcriptions"
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <HugeiconsIcon icon={Activity03Icon} size={18} />
                        View activity
                      </Link>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Minutes Processed"
              value={formatNumber(stats.usage.minutesUsed)}
              subtitle="Lifetime transcription minutes"
              icon={
                <HugeiconsIcon icon={Clock01Icon} size={22} color="#03b3c3" />
              }
              iconColor="text-[#03b3c3]"
              iconBgColor="bg-[#03b3c3]/20"
              spotlightColor="rgba(3, 179, 195, 0.3)"
              showProgress
              progressPercent={planUsagePercent}
              progressColors="bg-[#03b3c3]"
            />
            <StatCard
              title="Average Duration"
              value={secondsToMinutes(derived.avgDurationSeconds || 0)}
              subtitle="Per completed transcription"
              icon={
                <HugeiconsIcon icon={Chart03Icon} size={22} color="#d856bf" />
              }
              iconBgColor="bg-[#d856bf]/20"
              spotlightColor="rgba(216, 86, 191, 0.3)"
            />
            <StatCard
              title="Success Rate"
              value={`${derived.successRate}%`}
              subtitle={`${derived.completedCount} of ${derived.totalTranscriptions} jobs`}
              icon={
                <HugeiconsIcon
                  icon={SecurityCheckIcon}
                  size={22}
                  color="#c247ac"
                />
              }
              iconBgColor="bg-[#c247ac]/20"
              spotlightColor="rgba(200, 71, 172, 0.3)"
              showProgress
              progressPercent={derived.successRate}
              progressColors="from-[#c247ac] to-[#d856bf]"
            />
            <StatCard
              title="Languages Seen"
              value={stats.usage.languagesUsed}
              subtitle="Unique languages this month"
              icon={
                <HugeiconsIcon
                  icon={LanguageCircleIcon}
                  size={22}
                  color="#f59f0b"
                />
              }
              iconBgColor="bg-[#f59f0b]/20"
              spotlightColor="rgba(245, 159, 11, 0.25)"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <SpotlightCard className="backdrop-blur-xl xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400">7-day cadence</p>
                  <h3 className="text-2xl font-semibold text-white">
                    Transcriptions per day
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <HugeiconsIcon icon={Calendar02Icon} size={18} />
                  Updated live
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-4">
                {derived.usageSeries.map((point) => (
                  <div
                    key={point.dayLabel}
                    className="flex flex-col items-center gap-2 flex-1"
                  >
                    <div className="w-full bg-white/5 rounded-full h-40 relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-[#03b3c3] via-[#03b3c3]/70 to-transparent"
                        style={{
                          height: `${(point.count / maxUsageCount) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {point.dayLabel}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {point.count}
                    </span>
                  </div>
                ))}
              </div>
            </SpotlightCard>

            <SpotlightCard className="backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Global reach</p>
                  <h3 className="text-xl font-semibold text-white">
                    Top languages
                  </h3>
                </div>
                <HugeiconsIcon
                  icon={BarChartHorizontalIcon}
                  size={22}
                  color="#03b3c3"
                />
              </div>
              <div className="space-y-4">
                {derived.topLanguages.map((lang) => (
                  <div key={lang.language} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-white capitalize">
                        {lang.language}
                      </p>
                      <div className="w-full bg-white/5 rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full bg-[#d856bf]/90"
                          style={{
                            width: `${Math.min(
                              (lang.count / derived.totalTranscriptions) * 100,
                              100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 w-10 text-right">
                      {lang.count}
                    </span>
                  </div>
                ))}
                {derived.topLanguages.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No language data yet. Upload a file to populate this card.
                  </p>
                ) : null}
              </div>
            </SpotlightCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SpotlightCard className="backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Depth</p>
                  <h3 className="text-xl font-semibold text-white">
                    Longest recordings
                  </h3>
                </div>
                <HugeiconsIcon
                  icon={Download01Icon}
                  size={22}
                  color="#d856bf"
                />
              </div>
              <div className="space-y-4">
                {derived.longestRecordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between border border-white/5 rounded-2xl px-4 py-3"
                  >
                    <div>
                      <p className="text-white text-sm">{rec.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#03b3c3]">
                        {formatMinutes(Math.round((rec.duration ?? 0) / 60))}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rec.creditsUsed ?? 0} credits
                      </p>
                    </div>
                  </div>
                ))}
                {derived.longestRecordings.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No completed recordings with duration yet.
                  </p>
                ) : null}
              </div>
            </SpotlightCard>

            <SpotlightCard className="backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Reliability</p>
                  <h3 className="text-xl font-semibold text-white">
                    Recent failures
                  </h3>
                </div>
                <HugeiconsIcon icon={TradeUpIcon} size={22} color="#f59f0b" />
              </div>
              <div className="space-y-4">
                {derived.recentFailures.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border border-[#f59f0b]/20 rounded-2xl px-4 py-3"
                  >
                    <div>
                      <p className="text-white text-sm">{item.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-widest text-[#f59f0b]">
                      failed
                    </span>
                  </div>
                ))}
                {derived.recentFailures.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Great news—no failed jobs logged in the last 50 uploads.
                  </p>
                ) : null}
              </div>
            </SpotlightCard>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Financial telemetry</p>
                <h3 className="text-2xl font-semibold text-white">
                  Credit transactions
                </h3>
              </div>
              <Link
                href="/dashboard/billing"
                className="flex items-center gap-1 text-sm text-[#03b3c3]"
              >
                View billing
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <SpotlightCard className="p-6">
                <p className="text-gray-400 text-sm mb-1">Lifetime purchased</p>
                <p className="text-3xl font-bold text-white">
                  {formatNumber(derived.lifetimeCreditsPurchased)}
                </p>
                <span className="text-xs text-gray-500">credits added</span>
              </SpotlightCard>
              <SpotlightCard className="p-6">
                <p className="text-gray-400 text-sm mb-1">Lifetime usage</p>
                <p className="text-3xl font-bold text-white">
                  {formatNumber(Math.abs(derived.lifetimeCreditsUsed))}
                </p>
                <span className="text-xs text-gray-500">credits consumed</span>
              </SpotlightCard>
              <SpotlightCard className="p-6">
                <p className="text-gray-400 text-sm mb-1">Last purchase</p>
                <p className="text-3xl font-bold text-white">
                  {derived.lastPurchase
                    ? formatNumber(derived.lastPurchase.amount)
                    : '—'}
                </p>
                <span className="text-xs text-gray-500">
                  {derived.lastPurchase
                    ? new Date(
                        derived.lastPurchase.createdAt
                      ).toLocaleDateString()
                    : 'No purchase history'}
                </span>
              </SpotlightCard>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/5 backdrop-blur-xl">
              <table className="min-w-full divide-y divide-white/5">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 text-white">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-300 capitalize">
                        {transaction.type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {transaction.description ?? '—'}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-semibold ${
                          transaction.amount > 0
                            ? 'text-[#03b3c3]'
                            : 'text-[#f87272]'
                        }`}
                      >
                        {formatCredits(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No transactions yet. Purchase credits or run a
                        transcription to populate this ledger.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <DashboardFooter isBetaUser={stats.isBetaUser} />
        </div>
      </div>
    </>
  )
}
