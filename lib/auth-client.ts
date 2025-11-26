import { dodopaymentsClient } from '@dodopayments/better-auth'
import {
  adminClient,
  lastLoginMethodClient,
  magicLinkClient,
  twoFactorClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  plugins: [
    lastLoginMethodClient(),
    magicLinkClient(),
    dodopaymentsClient(),
    adminClient(),
    twoFactorClient()
  ]
})
