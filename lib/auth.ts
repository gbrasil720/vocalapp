import { stripe } from '@better-auth/stripe'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { lastLoginMethod, openAPI } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { stripeClient } from './billing/stripe-client'
import { addCredits } from './credits'

export const auth = betterAuth({
  additionalUserFields: {
    credits: {
      type: 'number',
      required: false,
      defaultValue: 30
    },
    isBetaUser: {
      type: 'boolean',
      required: false,
      defaultValue: false
    }
  },
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      subscription: schema.subscription,
      creditTransaction: schema.creditTransaction
    }
  }),
  plugins: [
    openAPI(),
    lastLoginMethod(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
      createCustomerOnSignUp: true,
      onEvent: async (event) => {
        console.log('stripe event', event)

        // Handle credit purchases via checkout.session.completed
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object
          const metadata = session.metadata

          // Check if this is a credit purchase (vs subscription)
          if (metadata?.purchaseType === 'credits') {
            const userId = metadata.userId
            const credits = Number.parseInt(metadata.credits || '0')
            const packType = metadata.packType

            if (userId && credits > 0) {
              try {
                // Add credits to user account
                await addCredits(userId, credits, {
                  type: 'purchase',
                  description: `Purchased ${packType} credit pack (${credits} credits)`,
                  stripePaymentIntentId: session.payment_intent as string,
                  packType,
                  sessionId: session.id
                })

                console.log(`✓ Added ${credits} credits to user ${userId}`)
              } catch (error) {
                console.error('Error adding credits:', error)
              }
            }
          }
        }

        // Handle subscription activation - grant monthly credits
        if (
          event.type === 'customer.subscription.created' ||
          event.type === 'customer.subscription.updated'
        ) {
          const subscription = event.data.object

          // Only grant credits when subscription becomes active
          if (subscription.status === 'active') {
            try {
              // Find user by stripe customer ID
              const [userRecord] = await db
                .select()
                .from(schema.user)
                .where(
                  eq(
                    schema.user.stripeCustomerId,
                    subscription.customer as string
                  )
                )
                .limit(1)

              if (userRecord) {
                const userId = userRecord.id

                // Grant Pro Plan monthly credits (600)
                await addCredits(userId, 600, {
                  type: 'subscription_grant',
                  description: 'Pro Plan monthly credits',
                  stripeSubscriptionId: subscription.id,
                  subscriptionPeriodStart: (subscription as any)
                    .current_period_start,
                  subscriptionPeriodEnd: (subscription as any)
                    .current_period_end
                })

                console.log(
                  `✓ Granted 600 monthly credits to user ${userId} for Pro Plan subscription`
                )
              }
            } catch (error) {
              console.error('Error granting subscription credits:', error)
            }
          }
        }
      },
      subscription: {
        enabled: true,
        plans: [
          {
            name: 'Pro Plan',
            priceId: 'price_1SKSwiLei6ZP9igfAKHMocXM', // para prod: 'price_1SKIgxLei6ZP9igfc6prsvK2',
            limits: {
              credits: 600
            }
          }
        ]
      }
    })
  ]
})
