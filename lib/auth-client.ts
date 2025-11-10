import { stripeClient } from '@better-auth/stripe/client'
import {
  adminClient,
  lastLoginMethodClient,
  magicLinkClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  plugins: [
    lastLoginMethodClient(),
    magicLinkClient(),
    stripeClient({
      subscription: true
    }),
    adminClient()
  ]
})
