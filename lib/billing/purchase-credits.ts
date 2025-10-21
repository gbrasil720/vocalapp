import type { CreditPackType } from './credit-products'

export async function purchaseCredits(packType: CreditPackType): Promise<void> {
  try {
    // Store pack type for dev mode credit granting
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_credit_pack', packType)
    }

    const response = await fetch('/api/credits/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ packType })
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const data = await response.json()

    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (error) {
    console.error('Error purchasing credits:', error)
    throw error
  }
}
