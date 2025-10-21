/**
 * Manually add credits for a test purchase
 * Run with: bun run scripts/manually-add-credits.ts <userId> <credits> <packType>
 * Example: bun run scripts/manually-add-credits.ts abc123 1500 premium
 */

import { addCredits } from '../lib/credits'

async function manuallyAddCredits() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.log(
      '❌ Usage: bun run scripts/manually-add-credits.ts <userId> <credits> <packType>'
    )
    console.log(
      '   Example: bun run scripts/manually-add-credits.ts abc123 1500 premium'
    )
    console.log('\n💡 Tip: Run scripts/get-my-user-id.ts to get your user ID')
    process.exit(1)
  }

  const [userId, creditsStr, packType] = args
  const credits = parseInt(creditsStr)

  if (isNaN(credits) || credits <= 0) {
    console.log('❌ Credits must be a positive number')
    process.exit(1)
  }

  try {
    console.log('💰 Adding credits...')
    console.log(`   User ID: ${userId}`)
    console.log(`   Credits: ${credits}`)
    console.log(`   Pack: ${packType}\n`)

    await addCredits(userId, credits, {
      type: 'purchase',
      description: `Purchased ${packType} credit pack (${credits} credits) - Manual grant`,
      packType,
      manualGrant: true
    })

    console.log('✅ Credits added successfully!')
    console.log('\n📊 Refresh your dashboard to see the new balance.')
  } catch (error) {
    console.error('❌ Error adding credits:', error)
    process.exit(1)
  }

  process.exit(0)
}

manuallyAddCredits()
