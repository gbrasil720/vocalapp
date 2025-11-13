import { env } from '../env'

export type CreditPackType = 'basic' | 'popular' | 'premium'

export interface CreditPack {
  type: CreditPackType
  name: string
  price: number
  credits: number
  priceId: string
  description: string
  costPerMinute: number
}

export const CREDIT_PACKS: Record<CreditPackType, CreditPack> = {
  basic: {
    type: 'basic',
    name: 'Basic',
    price: 5,
    credits: 120,
    priceId: env.STRIPE_CREDIT_BASIC_PRICE_ID || 'price_BASIC_PLACEHOLDER',
    description: '120 credits (2 hours)',
    costPerMinute: 0.042
  },
  popular: {
    type: 'popular',
    name: 'Popular',
    price: 15,
    credits: 450,
    priceId: env.STRIPE_CREDIT_POPULAR_PRICE_ID || 'price_POPULAR_PLACEHOLDER',
    description: '450 credits (7.5 hours)',
    costPerMinute: 0.033
  },
  premium: {
    type: 'premium',
    name: 'Premium',
    price: 40,
    credits: 1500,
    priceId: env.STRIPE_CREDIT_PREMIUM_PRICE_ID || 'price_PREMIUM_PLACEHOLDER',
    description: '1,500 credits (25 hours)',
    costPerMinute: 0.027
  }
}

export function getCreditPack(type: CreditPackType): CreditPack {
  return CREDIT_PACKS[type]
}

export function getAllCreditPacks(): CreditPack[] {
  return Object.values(CREDIT_PACKS)
}
