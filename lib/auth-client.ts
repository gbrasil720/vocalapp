import { createAuthClient } from 'better-auth/client'
export const authClient = createAuthClient({
  baseURL: 'localhost:3000'
})
