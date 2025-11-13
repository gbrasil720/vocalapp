import { z } from 'zod'

const envObject = z.object({
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_CLIENT_SECRET: z.string(),
  STRIPE_CREDIT_BASIC_PRICE_ID: z.string(),
  STRIPE_CREDIT_POPULAR_PRICE_ID: z.string(),
  STRIPE_CREDIT_PREMIUM_PRICE_ID: z.string(),
  STRIPE_PRO_PLAN_PRICE_ID: z.string(),
  OPENAI_API_KEY: z.string(),
  NEXT_PUBLIC_URL: z.string().url(),
  BLOB_READ_WRITE_TOKEN: z.string(),
  CRON_SECRET: z.string(),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  BETA_MODE: z.boolean(),
  RESEND_API_KEY: z.string()
})

export const env = envObject.parse(process.env)
