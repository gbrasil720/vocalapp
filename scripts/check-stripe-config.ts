/**
 * Check Stripe configuration for credit packs
 * Run with: bun run scripts/check-stripe-config.ts
 */

import { getAllCreditPacks } from '../lib/billing/credit-products'

function checkStripeConfig() {
  console.log('🔍 Checking Stripe Credit Pack Configuration...\n')

  const packs = getAllCreditPacks()
  let allConfigured = true

  for (const pack of packs) {
    const isConfigured = pack.priceId && !pack.priceId.includes('PLACEHOLDER')
    const status = isConfigured ? '✅' : '❌'

    console.log(`${status} ${pack.name} Pack ($${pack.price})`)
    console.log(`   Credits: ${pack.credits}`)
    console.log(`   Price ID: ${pack.priceId}`)

    if (!isConfigured) {
      console.log(
        `   ⚠️  NOT CONFIGURED - Set STRIPE_CREDIT_${pack.type.toUpperCase()}_PRICE_ID in .env`
      )
      allConfigured = false
    }

    console.log('')
  }

  console.log('─────────────────────────────────────────────\n')

  if (allConfigured) {
    console.log('✅ All credit packs are configured!')
    console.log('   Your "Buy Now" buttons should work.\n')
    console.log('📝 Next steps:')
    console.log('   1. Make sure your dev server is running')
    console.log('   2. Go to /dashboard/billing')
    console.log('   3. Click "Buy Now" on any pack')
    console.log('   4. Test with card: 4242 4242 4242 4242\n')
  } else {
    console.log('❌ Some credit packs are not configured.\n')
    console.log('📝 To fix this:')
    console.log('   1. Go to https://dashboard.stripe.com/test/products')
    console.log('   2. Create products for each pack')
    console.log('   3. Copy the Price IDs')
    console.log('   4. Add them to your .env file')
    console.log('   5. Restart your dev server\n')
    console.log('📖 See STRIPE_CREDIT_PACKS_SETUP.md for detailed instructions')
  }
}

checkStripeConfig()
