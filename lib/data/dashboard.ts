import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  creditTransaction,
  subscription,
  transcription,
  user
} from '@/db/schema'
import { getUserLanguageCount } from '../transcription/language-tracking'

export interface UserStats {
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

export interface TranscriptionData {
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

export async function getServerStats(userId: string): Promise<UserStats> {
  const userData = await db
    .select({
      credits: user.credits
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (userData.length === 0) {
    throw new Error('User not found')
  }

  const subscriptionData = await db
    .select()
    .from(subscription)
    .where(eq(subscription.referenceId, userId))
    .limit(1)

  const usageStats = await db
    .select({
      totalMinutes: sql<number>`COALESCE(SUM(ABS(${creditTransaction.amount})), 0)`,
      transcriptionCount: sql<number>`COUNT(*)`
    })
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        eq(creditTransaction.type, 'usage')
      )
    )

  const languagesUsed = await getUserLanguageCount(userId)

  const hasSubscription =
    subscriptionData.length > 0 && subscriptionData[0].status === 'active'
  const planName = hasSubscription ? subscriptionData[0].plan : 'Free Plan'
  const planCredits = hasSubscription ? 600 : 30
  const nextBillingDate =
    hasSubscription && subscriptionData[0].periodEnd
      ? new Date(subscriptionData[0].periodEnd).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null

  return {
    credits: userData[0].credits,
    plan: {
      name: planName,
      isActive: hasSubscription,
      totalCredits: planCredits,
      nextBillingDate
    },
    usage: {
      minutesUsed: Number(usageStats[0].totalMinutes) || 0,
      transcriptionsCount: Number(usageStats[0].transcriptionCount) || 0,
      languagesUsed
    }
  }
}

export async function getServerTranscriptions(
  userId: string,
  limit = 50
): Promise<TranscriptionData[]> {
  const transcriptions = await db
    .select({
      id: transcription.id,
      fileName: transcription.fileName,
      fileSize: transcription.fileSize,
      mimeType: transcription.mimeType,
      duration: transcription.duration,
      language: transcription.language,
      status: transcription.status,
      creditsUsed: transcription.creditsUsed,
      createdAt: transcription.createdAt,
      completedAt: transcription.completedAt
    })
    .from(transcription)
    .where(eq(transcription.userId, userId))
    .orderBy(desc(transcription.createdAt))
    .limit(limit)

  return transcriptions.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    completedAt: t.completedAt ? t.completedAt.toISOString() : null
  }))
}

export async function getDashboardData(userId: string) {
  const [stats, transcriptions] = await Promise.all([
    getServerStats(userId),
    getServerTranscriptions(userId)
  ])

  return {
    stats,
    transcriptions
  }
}
