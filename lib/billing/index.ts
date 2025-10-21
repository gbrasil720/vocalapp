import { authClient } from '../auth-client'

export const upgrateToPro = async () => {
  try {
    await authClient.subscription.upgrade({
      plan: 'Pro Plan',
      annual: false,
      seats: 1,
      successUrl: '/success?checkout_id={CHECKOUT_ID}',
      cancelUrl: '/cancel',
      disableRedirect: true
    })
  } catch (e) {
    console.error('Error upgrading to pro', e)
  }
}
