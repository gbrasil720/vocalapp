import { authClient } from '../auth-client'

export const upgradeToPro = async () => {
  try {
    await authClient.dodopayments.checkout({
      productId: 'pro-plan',
      quantity: 1,
      returnUrl: '/dashboard/billing?success=true'
    })
  } catch (e) {
    console.error('Error upgrading to pro', e)
  }
}
