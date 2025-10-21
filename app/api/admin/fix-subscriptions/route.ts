import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription, user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { addCredits } from '@/lib/credits'

/**
 * ADMIN ENDPOINT: Grants credits to users with active subscriptions who haven't received them yet
 * This is a one-time fix for existing subscriptions created before the webhook was updated
 */
export async function POST() {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active subscriptions
    const activeSubscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.status, 'active'))

    const results = []

    for (const sub of activeSubscriptions) {
      try {
        // Get user by referenceId (which is the userId)
        const [userRecord] = await db
          .select()
          .from(user)
          .where(eq(user.id, sub.referenceId))
          .limit(1)

        if (userRecord) {
          // Grant 600 credits for Pro Plan subscription
          await addCredits(userRecord.id, 600, {
            type: 'subscription_grant',
            description: 'Pro Plan monthly credits (manual grant)',
            stripeSubscriptionId: sub.stripeSubscriptionId || undefined
          })

          results.push({
            userId: userRecord.id,
            email: userRecord.email,
            plan: sub.plan,
            creditsGranted: 600,
            status: 'success'
          })

          console.log(
            `✓ Granted 600 credits to ${userRecord.email} (${userRecord.id})`
          )
        }
      } catch (error) {
        console.error(`Error processing subscription ${sub.id}:`, error)
        results.push({
          subscriptionId: sub.id,
          plan: sub.plan,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: 'Subscription fix completed',
      processed: results.length,
      results
    })
  } catch (error) {
    console.error('Error fixing subscriptions:', error)
    return NextResponse.json(
      {
        error: 'Failed to fix subscriptions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
