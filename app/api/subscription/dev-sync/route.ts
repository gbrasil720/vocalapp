import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { addCredits } from '@/lib/credits'

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // 1. Create/Update Subscription Record
    // Check if subscription exists
    const existingSub = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, userId))
      .limit(1)

    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    if (existingSub.length > 0) {
      await db
        .update(subscription)
        .set({
          status: 'active',
          plan: 'frequency-plan',
          periodStart: now,
          periodEnd: nextMonth,
          dodoPaymentsSubscriptionId: 'sub_DEV_' + Math.random().toString(36).substring(7)
        })
        .where(eq(subscription.id, existingSub[0].id))
    } else {
      await db.insert(subscription).values({
        id: 'sub_' + Math.random().toString(36).substring(7),
        referenceId: userId,
        status: 'active',
        plan: 'frequency-plan',
        periodStart: now,
        periodEnd: nextMonth,
        dodoPaymentsSubscriptionId: 'sub_DEV_' + Math.random().toString(36).substring(7)
      })
    }

    // 2. Grant Credits
    await addCredits(userId, 600, {
      type: 'subscription_grant',
      description: 'Pro Plan monthly credits (DEV MODE)',
      dodoPaymentsSubscriptionId: 'sub_DEV_GRANT',
      subscriptionPeriodStart: now,
      subscriptionPeriodEnd: nextMonth,
      devMode: true
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}
