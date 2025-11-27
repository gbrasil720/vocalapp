import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription } from '@/db/schema'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    console.log(`🔍 Checking subscription for user ${userId}`)
    
    const subscriptionData = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, userId))

    console.log(`Found ${subscriptionData.length} subscriptions`)

    if (subscriptionData.length === 0) {
      console.log('No subscriptions found')
      return NextResponse.json({
        hasSubscription: false,
        subscription: null
      })
    }

    // Prioritize Dodo Payments subscription
    const dodoSub = subscriptionData.find(
      sub => sub.status === 'active' && !!sub.dodoPaymentsSubscriptionId
    )
    
    if (dodoSub) console.log('Found active Dodo subscription:', dodoSub.id)
    else console.log('No active Dodo subscription found')

    // Fallback to any active subscription (or just the first one if none active)
    const sub = dodoSub || subscriptionData[0]
    
    const isActive = sub.status === 'active'
    const isDodo = !!sub.dodoPaymentsSubscriptionId
    
    console.log(`Selected sub: ${sub.id}, isActive: ${isActive}, isDodo: ${isDodo}`)

    return NextResponse.json({
      hasSubscription: isActive && isDodo,
      subscription: {
        id: sub.id,
        plan: sub.plan,
        status: sub.status,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        dodoPaymentsSubscriptionId: sub.dodoPaymentsSubscriptionId,
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
