import { authClient } from '@/lib/auth-client'
import type { CreditPackType } from './credit-products'

export async function purchaseCredits(packType: CreditPackType): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_credit_pack', packType)
    }

    const { data, error } = await authClient.dodopayments.checkout({
      slug: `${packType}-credits`, // Assumes slugs are like 'basic-credits', 'popular-credits'
    })

    if (error) {
      throw error
    }

    if (data?.url) {
      window.location.href = data.url
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (error) {
    console.error('Error purchasing credits:', error)
    throw error
  }
}
