import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  type CreditPackType,
  getCreditPack
} from '@/lib/billing/credit-products'
import { stripeClient } from '@/lib/billing/stripe-client'

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { packType } = body as { packType: CreditPackType }

    if (!packType || !['basic', 'popular', 'premium'].includes(packType)) {
      return NextResponse.json({ error: 'Invalid pack type' }, { status: 400 })
    }

    const pack = getCreditPack(packType)

    if (!pack.priceId || pack.priceId.includes('PLACEHOLDER')) {
      return NextResponse.json(
        {
          error: 'Price ID not configured for this pack',
          details: `Please create a Stripe Price for the ${pack.name} pack ($${pack.price} for ${pack.credits} credits) and set the environment variable STRIPE_CREDIT_${packType.toUpperCase()}_PRICE_ID`
        },
        { status: 500 }
      )
    }

    const checkoutSession = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: pack.priceId,
          quantity: 1
        }
      ],
      success_url: `${req.nextUrl.origin}/dashboard/billing?success=true`,
      cancel_url: `${req.nextUrl.origin}/dashboard/billing?canceled=true`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        credits: pack.credits.toString(),
        packType: pack.type,
        purchaseType: 'credits'
      }
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
