import { and, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { creditTransaction, subscription, user } from '@/db/schema'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user data
    const userData = await db
      .select({
        credits: user.credits
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscription data
    const subscriptionData = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, userId))
      .limit(1)

    // Calculate minutes used from usage transactions
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

    // Get unique languages from transaction metadata (if stored)
    // For now, we'll use a placeholder since transcriptions table doesn't exist yet
    const languagesUsed = 1 // Default to 1 (English) for now

    // Determine plan info
    const hasSubscription =
      subscriptionData.length > 0 && subscriptionData[0].status === 'active'
    const planName = hasSubscription ? subscriptionData[0].plan : 'Free Plan'
    const planCredits = hasSubscription ? 600 : 30 // Pro gets 600/month, Free gets 30
    const nextBillingDate =
      hasSubscription && subscriptionData[0].periodEnd
        ? new Date(subscriptionData[0].periodEnd).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : null

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0'
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
