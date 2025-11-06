import { stripe } from '@better-auth/stripe'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { lastLoginMethod, magicLink, openAPI } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { isBetaUserByEmail } from './beta-access'
import { stripeClient } from './billing/stripe-client'
import { addCredits } from './credits'
import { sendMagicLinkEmail } from './email/magic-link'
import { isEmailApproved } from './waitlist'

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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Check if email is approved in waitlist (only in beta mode)
          if (process.env.BETA_MODE === 'true') {
            const isApproved = await isEmailApproved(user.email)
            const existingBetaUser = await isBetaUserByEmail(user.email)

            console.log('🔍 User creation check:', {
              email: user.email,
              isApproved,
              existingBetaUser
            })

            // Reject if not approved in waitlist AND not an existing beta user
            if (!isApproved && !existingBetaUser) {
              console.log(
                `❌ Rejecting user creation for unapproved email: ${user.email}`
              )
              throw new APIError('UNAUTHORIZED', {
                message: `Access denied. ${user.email} is not on the approved beta list.`
              })
            }

            // If approved in waitlist OR existing beta user, mark as beta user
            console.log(
              `✅ Setting isBetaUser=true for ${user.email} (approved: ${isApproved}, existing: ${existingBetaUser})`
            )
            return {
              data: {
                ...user,
                isBetaUser: true
              }
            }
          }

          // Not in beta mode, proceed normally
          return { data: user }
        }
      }
    }
  },
  plugins: [
    openAPI(),
    lastLoginMethod(),
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        console.log('🔍 Magic Link Request:', {
          email,
          betaMode: process.env.BETA_MODE,
          isBetaModeActive: process.env.BETA_MODE === 'true'
        })

        // Check if email is approved before sending (only in beta mode)
        if (process.env.BETA_MODE === 'true') {
          // Check if email is in the approved waitlist
          const isApproved = await isEmailApproved(email)
          console.log(`✅ Waitlist approval check for ${email}:`, isApproved)

          // Also check if user already exists with beta access
          const existingBetaUser = await isBetaUserByEmail(email)
          console.log(
            `✅ Existing beta user check for ${email}:`,
            existingBetaUser
          )

          // Allow if either approved in waitlist OR already a beta user
          if (!isApproved && !existingBetaUser) {
            console.log(
              `❌ Rejecting magic link for unapproved email: ${email}`
            )
            throw new APIError('UNAUTHORIZED', {
              message: `Access denied. ${email} is not on the approved beta list.`
            })
          }

          console.log(
            `✅ Access granted for ${email} (approved: ${isApproved}, existing: ${existingBetaUser})`
          )
        } else {
          console.log('⚠️  BETA_MODE is not active - skipping approval check!')
        }

        // Email is approved (or not in beta mode), send the magic link
        console.log(`📧 Sending magic link to: ${email}`)
        await sendMagicLinkEmail({ email, token, url })
      }
    }),
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
