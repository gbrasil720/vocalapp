import { and, eq, isNotNull, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { account, creditTransaction, subscription, user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { getUserLanguageCount } from '@/lib/transcription/language-tracking'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const userData = await db
      .select({
        credits: user.credits,
        isBetaUser: user.isBetaUser
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userAccounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId))

    const hasPassword = userAccounts.some(acc => acc.password !== null)
    const isGoogle = userAccounts.some(acc => acc.providerId === 'google')
    const isMagicLink = !hasPassword && !isGoogle // Assuming if no password and not google, it's magic link (or other passwordless)

    const subscriptionData = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, userId))
      
    const activeSubscription = subscriptionData.find(sub => sub.status === 'active')
    const currentSubscription = activeSubscription || subscriptionData[0]

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
      !!currentSubscription && currentSubscription.status === 'active'
    const planName = hasSubscription ? currentSubscription.plan : 'Free Plan'
    const planCredits = hasSubscription ? 600 : 30
    const nextBillingDate =
      hasSubscription && currentSubscription.periodEnd
        ? new Date(currentSubscription.periodEnd).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : null

    return NextResponse.json(
      {
        credits: userData[0].credits,
        isBetaUser: userData[0].isBetaUser,
        hasPassword,
        signupMethod: isGoogle ? 'google' : isMagicLink ? 'magic-link' : 'email',
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
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
          'CDN-Cache-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}

