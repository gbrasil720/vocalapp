import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripeClient } from '@/lib/billing/stripe-client'

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has a Stripe customer ID
    const user = session.user as typeof session.user & { stripeCustomerId?: string | null }
    
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      )
    }

    // Create a Stripe customer portal session
    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${req.nextUrl.origin}/dashboard/billing`
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating portal session:', error)

    // Check if it's a Stripe configuration error
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('configuration')) {
      return NextResponse.json(
        {
          error:
            'Stripe Customer Portal not configured. Please configure it in your Stripe Dashboard: https://dashboard.stripe.com/test/settings/billing/portal',
          details: errorMessage
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create portal session', details: errorMessage },
      { status: 500 }
    )
  }
}
