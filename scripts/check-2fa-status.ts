import 'dotenv/config'
import { db } from '../db'
import { twoFactor, user } from '../db/schema'

// This script checks the 2FA status in the database
// Run with: bunx tsx scripts/check-2fa-status.ts

async function main() {
  console.log('🔍 Checking two_factor table...')

  const records = await db.select().from(twoFactor)
  
  console.log(`\n📊 Found ${records.length} two_factor records:`)
  
  for (const record of records) {
    console.log(`\n  User ID: ${record.userId}`)
    console.log(`  ID: ${record.id}`)
    console.log(`  Has Secret: ${!!record.secret}`)
    console.log(`  Has Backup Codes: ${!!record.backupCodes}`)
  }

  if (records.length === 0) {
    console.log('\n⚠️  No 2FA records found in the database!')
    console.log('This means no users have 2FA enabled.')
  }

  // Also check the user table for twoFactorEnabled field
  console.log('\n\n🔍 Checking user.twoFactorEnabled field...')
  const users = await db.select({
    id: user.id,
    email: user.email,
    twoFactorEnabled: user.twoFactorEnabled
  }).from(user)

  for (const u of users) {
    console.log(`\n  Email: ${u.email}`)
    console.log(`  ID: ${u.id}`)
    console.log(`  twoFactorEnabled: ${u.twoFactorEnabled}`)
    
    // Check if this user has a two_factor record
    const has2FARecord = records.some(r => r.userId === u.id)
    console.log(`  Has two_factor record: ${has2FARecord}`)
  }
}

main().catch(console.error)

