import { stripeClient } from '@better-auth/stripe/client'
import { lastLoginMethodClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  plugins: [
    lastLoginMethodClient(),
    stripeClient({
      subscription: true
    })
  ]
})
