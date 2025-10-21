/**
 * Get your user ID by email
 * Run with: bun run scripts/get-my-user-id.ts <email>
 * Example: bun run scripts/get-my-user-id.ts test@example.com
 */

import { eq } from 'drizzle-orm'
import { db } from '../db'
import { user } from '../db/schema'

async function getUserId() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.log('❌ Usage: bun run scripts/get-my-user-id.ts <email>')
    console.log(
      '   Example: bun run scripts/get-my-user-id.ts test@example.com'
    )
    process.exit(1)
  }

  const email = args[0]

  try {
    const [userRecord] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    if (!userRecord) {
      console.log(`❌ No user found with email: ${email}`)
      process.exit(1)
    }

    console.log('✅ User found!\n')
    console.log('📋 User Details:')
    console.log(`   Email: ${userRecord.email}`)
    console.log(`   Name: ${userRecord.name}`)
    console.log(`   User ID: ${userRecord.id}`)
    console.log(`   Current Credits: ${userRecord.credits}`)
    console.log(
      `   Stripe Customer ID: ${userRecord.stripeCustomerId || 'Not set'}`
    )
    console.log('\n💡 To add credits, run:')
    console.log(
      `   bun run scripts/manually-add-credits.ts ${userRecord.id} <credits> <packType>`
    )
    console.log('\n   Examples:')
    console.log(
      `   bun run scripts/manually-add-credits.ts ${userRecord.id} 120 basic`
    )
    console.log(
      `   bun run scripts/manually-add-credits.ts ${userRecord.id} 450 popular`
    )
    console.log(
      `   bun run scripts/manually-add-credits.ts ${userRecord.id} 1500 premium`
    )
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  process.exit(0)
}

getUserId()
