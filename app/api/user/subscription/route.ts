import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription } from '@/db/schema'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const subscriptionData = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, userId))
      .limit(1)

    if (subscriptionData.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null
      })
    }

    const sub = subscriptionData[0]
    const isActive = sub.status === 'active'

    return NextResponse.json({
      hasSubscription: isActive,
      subscription: {
        id: sub.id,
        plan: sub.plan,
        status: sub.status,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        periodStart: sub.periodStart,
        periodEnd: sub.periodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        nextBillingDate: sub.periodEnd
          ? new Date(sub.periodEnd).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : null
      }
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
