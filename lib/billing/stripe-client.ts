import Stripe from 'stripe'
import { env } from '../env'

export const stripeClient = new Stripe(env.STRIPE_CLIENT_SECRET, {
  apiVersion: '2025-09-30.clover'
})
