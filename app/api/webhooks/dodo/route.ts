import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq } from 'drizzle-orm'
import { addCredits } from '@/lib/credits'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('webhook-signature')
    const webhookId = headersList.get('webhook-id')
    const timestamp = headersList.get('webhook-timestamp')

    console.log('Received Dodo Webhook:', {
      webhookId,
      timestamp,
      signaturePresent: !!signature
    })

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET
    if (!secret) {
      console.error('Missing DODO_PAYMENTS_WEBHOOK_SECRET')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Soft verification for debugging
    try {
      const hmac = crypto.createHmac('sha256', secret)
      const digest = hmac.update(body).digest('base64')
      const expectedSignature = `v1,${digest}` // Guessing format based on screenshot
      
      console.log('Signature Verification Debug:', {
        received: signature,
        computed: digest,
        expectedWithPrefix: expectedSignature,
        match: signature === expectedSignature || signature === digest
      })
      
      // TODO: Enforce verification once format is confirmed
      // if (signature !== expectedSignature) { ... }
    } catch (err) {
      console.error('Error computing signature:', err)
    }
    
    const payload = JSON.parse(body)
    
    const eventType = payload.type || payload.event_type // Fallback just in case
    
    // Event handling logic
    console.log('Processing event:', eventType)
    console.log('Full Webhook Payload:', JSON.stringify(payload, null, 2))

    if (eventType === 'payment.succeeded') {
      const payment = payload.data
      const metadata = payment.metadata as any
      
      console.log('Payment Data:', {
        paymentId: payment.payment_id,
        metadata,
        amount: payment.total_amount
      })

      if (metadata?.purchaseType === 'credits') {
        const userId = metadata.userId
        const credits = Number.parseInt(metadata.credits || '0')
        const packType = metadata.packType

        if (userId && credits > 0) {
          try {
            await addCredits(userId, credits, {
              type: 'purchase',
              description: `Purchased ${
                { basic: 'Echo', popular: 'Reverb', premium: 'Amplify' }[packType as 'basic' | 'popular' | 'premium'] || packType
              } credit pack (${credits} credits)`,
              dodoPaymentsPaymentId: payment.payment_id,
              packType,
              paymentId: payment.payment_id
            })

            console.log(`✓ Added ${credits} credits to user ${userId}`)
          } catch (error) {
            console.error('Error adding credits:', error)
          }
        }
      }
    } else if (eventType === 'subscription.active') {
      const subscription = payload.data
      const metadata = subscription.metadata as any
      
      // Try to find user by metadata.userId first (more reliable)
      let userId = metadata?.userId
      
      if (!userId) {
         console.log('⚠️ No userId in metadata, falling back to customer_id')
         // Find user by Dodo customer ID
         const [userRecord] = await db
           .select()
           .from(schema.user)
           .where(
             eq(
               schema.user.dodoPaymentsCustomerId,
               subscription.customer.customer_id
             )
           )
           .limit(1)
           
         userId = userRecord?.id
      }

      if (userId) {
        try {
          // Use correct date fields from Dodo payload
          const periodStart = subscription.previous_billing_date ? new Date(subscription.previous_billing_date) : new Date()
          const periodEnd = subscription.next_billing_date ? new Date(subscription.next_billing_date) : new Date()

          // Grant credits
          await addCredits(userId, 600, {
            type: 'subscription_grant',
            description: 'Frequency monthly credits',
            dodoPaymentsSubscriptionId: subscription.subscription_id,
            subscriptionPeriodStart: periodStart,
            subscriptionPeriodEnd: periodEnd
          })

          console.log(
            `✓ Granted 600 monthly credits to user ${userId} for Pro Plan subscription`
          )

          // Update Subscription Table
          // Check if subscription exists
          const [existingSubscription] = await db
            .select()
            .from(schema.subscription)
            .where(eq(schema.subscription.dodoPaymentsSubscriptionId, subscription.subscription_id))
            .limit(1)

          if (existingSubscription) {
             await db.update(schema.subscription)
               .set({
                 status: 'active',
                 periodStart: periodStart,
                 periodEnd: periodEnd,
                 cancelAtPeriodEnd: false
               })
               .where(eq(schema.subscription.id, existingSubscription.id))
             console.log(`✓ Updated existing subscription ${existingSubscription.id}`)
          } else {
             // Create new subscription
             await db.insert(schema.subscription).values({
               id: crypto.randomUUID(),
               plan: 'frequency-plan', 
               referenceId: userId, // better-auth usually uses referenceId for userId
               dodoPaymentsSubscriptionId: subscription.subscription_id,
               status: 'active',
               periodStart: periodStart,
               periodEnd: periodEnd,
               cancelAtPeriodEnd: false,
               seats: 1
             })
             console.log(`✓ Created new subscription record for user ${userId}`)
          }

        } catch (error) {
          console.error('Error processing subscription active:', error)
        }
      } else {
        console.error('❌ Could not find user for subscription:', subscription.subscription_id)
      }
    } else if (eventType === 'subscription.cancelled' || eventType === 'subscription.payment_failed') {
       const subscriptionData = payload.data
       console.log(`⚠️ Subscription ${eventType}:`, subscriptionData.subscription_id)

       try {
         await db.update(schema.subscription)
           .set({ 
             status: 'cancelled',
             cancelAtPeriodEnd: true
           })
           .where(eq(schema.subscription.dodoPaymentsSubscriptionId, subscriptionData.subscription_id))
         
         console.log(`✓ Updated subscription status to cancelled for ${subscriptionData.subscription_id}`)
       } catch (error) {
         console.error('Error cancelling subscription:', error)
       }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
