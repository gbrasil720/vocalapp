import 'dotenv/config'
import { db } from '../db'
import { twoFactor } from '../db/schema'
import { eq } from 'drizzle-orm'

async function main() {
  const records = await db.select().from(twoFactor).where(eq(twoFactor.userId, 'a0FvUa29DqBOqTBFMe5ueYzWWohc1slK'))
  
  if (records.length === 0) {
    console.log('No 2FA record found')
    return
  }
  
  console.log('Backup codes field (first 200 chars):', records[0]?.backupCodes?.substring(0, 200))
  console.log('Type:', typeof records[0]?.backupCodes)
  console.log('Length:', records[0]?.backupCodes?.length)
  
  // Try to parse if it's JSON
  try {
    const parsed = JSON.parse(records[0]?.backupCodes || '[]')
    console.log('Successfully parsed as JSON:')
    console.log('Is array:', Array.isArray(parsed))
    console.log('Count:', Array.isArray(parsed) ? parsed.length : 'N/A')
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log('First code sample:', parsed[0])
    }
  } catch (e) {
    console.log('Not JSON - might be encrypted')
    // Check if it looks like encrypted data
    if (records[0]?.backupCodes?.includes(':')) {
      console.log('Looks like encrypted format (contains colon separator)')
    }
  }
}

main().catch(console.error)

