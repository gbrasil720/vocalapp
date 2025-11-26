import 'dotenv/config'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../db'
import { account } from '../db/schema'

// This script cleans up duplicate credential accounts
// Run with: bunx tsx scripts/cleanup-duplicate-accounts.ts

async function main() {
  console.log('🔍 Looking for duplicate credential accounts...')

  // Find all credential accounts
  const credentialAccounts = await db
    .select()
    .from(account)
    .where(eq(account.providerId, 'credential'))

  // Group by userId
  const accountsByUser = new Map<string, typeof credentialAccounts>()
  for (const acc of credentialAccounts) {
    const existing = accountsByUser.get(acc.userId) || []
    existing.push(acc)
    accountsByUser.set(acc.userId, existing)
  }

  let deletedCount = 0

  for (const [userId, accounts] of accountsByUser) {
    if (accounts.length > 1) {
      console.log(`\n👤 User ${userId} has ${accounts.length} credential accounts:`)
      
      // Find the one with a password (the valid one)
      const validAccount = accounts.find(a => a.password !== null)
      const duplicates = accounts.filter(a => a.id !== validAccount?.id)

      if (validAccount) {
        console.log(`  ✅ Keeping account ${validAccount.id} (has password)`)
      }

      for (const dup of duplicates) {
        console.log(`  🗑️  Deleting duplicate account ${dup.id} (password: ${dup.password ? 'set' : 'null'})`)
        await db.delete(account).where(eq(account.id, dup.id))
        deletedCount++
      }
    } else if (accounts.length === 1 && accounts[0].password === null) {
      // Single credential account but no password - likely a failed attempt
      console.log(`\n👤 User ${userId} has credential account without password:`)
      console.log(`  🗑️  Deleting invalid account ${accounts[0].id}`)
      await db.delete(account).where(eq(account.id, accounts[0].id))
      deletedCount++
    }
  }

  if (deletedCount > 0) {
    console.log(`\n✨ Cleanup complete! Deleted ${deletedCount} duplicate/invalid accounts.`)
  } else {
    console.log('\n✨ No duplicate accounts found. Database is clean!')
  }
}

main().catch(console.error)

