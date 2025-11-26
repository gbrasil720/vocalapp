import { dodopayments, checkout, portal, webhooks } from '@dodopayments/better-auth'
import DodoPayments from 'dodopayments'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { admin, lastLoginMethod, magicLink, openAPI, twoFactor } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { isBetaUserByEmail } from './beta-access'
import { addCredits } from './credits'
import { sendMagicLinkEmail } from './email/magic-link'
import { isEmailApproved } from './waitlist'

export const auth = betterAuth({
  appName: 'VocalApp',
  additionalUserFields: {
    credits: {
      type: 'number',
      required: false,
      defaultValue: 30
    },
    isBetaUser: {
      type: 'boolean',
      required: false,
      defaultValue: true
    }
  },
  emailAndPassword: {
    enabled: true
  },
  user: {
    deleteUser: {
      enabled: true
    }
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
          console.log('🚨 DATABASE HOOK CALLED for user creation:', {
            email: user.email,
            name: user.name,
            betaMode: process.env.BETA_MODE === 'true'
          })

          if (process.env.BETA_MODE === 'true') {
            const isApproved = await isEmailApproved(user.email)
            const existingBetaUser = await isBetaUserByEmail(user.email)

            console.log('🔍 User creation check:', {
              email: user.email,
              isApproved,
              existingBetaUser
            })

            if (!isApproved && !existingBetaUser) {
              console.log(
                `❌ Rejecting user creation for unapproved email: ${user.email}`
              )
              throw new APIError('UNAUTHORIZED', {
                message: `Access denied. ${user.email} is not on the approved beta list.`
              })
            }

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

          console.log(
            `ℹ️  Not in beta mode - setting isBetaUser=false for ${user.email}`
          )
          return {
            data: {
              ...user,
              isBetaUser: false
            }
          }
        }
      }
    }
  },
  plugins: [
    openAPI(),
    admin({ defaultRole: 'user' }),
    lastLoginMethod(),
    twoFactor({
      issuer: 'VocalApp'
    }),
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        console.log('🔍 Magic Link Request:', {
          email,
          betaMode: process.env.BETA_MODE === 'true',
          isBetaModeActive: process.env.BETA_MODE === 'true'
        })

        if (process.env.BETA_MODE === 'true') {
          const isApproved = await isEmailApproved(email)
          console.log(`✅ Waitlist approval check for ${email}:`, isApproved)

          const existingBetaUser = await isBetaUserByEmail(email)
          console.log(
            `✅ Existing beta user check for ${email}:`,
            existingBetaUser
          )

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

        console.log(`📧 Sending magic link to: ${email}`)
        await sendMagicLinkEmail({ email, token, url })
      }
    }),
    dodopayments({
      client: new DodoPayments({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY || 'PLACEHOLDER',
        environment: 'test_mode'
      }),
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: 'pdt_ClccB9prbGGQAmihFDSgq', // User needs to fill this
              slug: 'frequency-plan'
            },
            {
              productId: 'pdt_C4RGv9YYpvPaPyCO9PI6A', // User needs to fill this
              slug: 'echo-credits'
            },
            {
              productId: 'pdt_Q7C6wnRcKS5jO8aensGdT', // User needs to fill this
              slug: 'reverb-credits'
            },
            {
              productId: 'pdt_bEZWN6iWMqjM6h6tFSW4n', // User needs to fill this
              slug: 'amplify-credits'
            }
          ],
          successUrl: '/dashboard/billing?success=true',
          authenticatedUsersOnly: true
        }),
        portal(),
        webhooks({
          webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || 'PLACEHOLDER',
          onPayload: async (payload: any) => {
            console.log('DodoPayments webhook:', payload.event_type)

            if (payload.event_type === 'payment.succeeded') {
              const payment = payload.data
              const metadata = payment.metadata as any

              if (metadata?.purchaseType === 'credits') {
                const userId = metadata.userId
                const credits = Number.parseInt(metadata.credits || '0')
                const packType = metadata.packType

                if (userId && credits > 0) {
                  try {
                    await addCredits(userId, credits, {
                      type: 'purchase',
                      description: `Purchased ${packType} credit pack (${credits} credits)`,
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
            }

            if (payload.event_type === 'subscription.active') {
              const subscription = payload.data
              
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

              if (userRecord) {
                const userId = userRecord.id

                try {
                  await addCredits(userId, 600, {
                    type: 'subscription_grant',
                    description: 'Pro Plan monthly credits',
                    dodoPaymentsSubscriptionId: subscription.subscription_id,
                    subscriptionPeriodStart: new Date(subscription.current_period_start),
                    subscriptionPeriodEnd: new Date(subscription.current_period_end)
                  })

                  console.log(
                    `✓ Granted 600 monthly credits to user ${userId} for Pro Plan subscription`
                  )
                } catch (error) {
                  console.error('Error granting subscription credits:', error)
                }
              }
            }
          }
        })
      ]
    })
  ]
})
