import 'dotenv/config'
import { symmetricDecrypt } from 'better-auth/crypto'
import { db } from '../db'
import { twoFactor } from '../db/schema'
import { eq } from 'drizzle-orm'

async function main() {
  const records = await db.select().from(twoFactor).where(eq(twoFactor.userId, 'a0FvUa29DqBOqTBFMe5ueYzWWohc1slK'))
  
  if (records.length === 0) {
    console.log('No 2FA record found')
    return
  }
  
  const { secret, backupCodes: encryptedBackupCodes } = records[0]
  
  console.log('Secret (first 20 chars):', secret?.substring(0, 20))
  console.log('Encrypted backup codes (first 50 chars):', encryptedBackupCodes?.substring(0, 50))
  
  try {
    const decrypted = await symmetricDecrypt({
      key: secret,
      data: encryptedBackupCodes
    })
    
    console.log('\n✅ Decryption successful!')
    console.log('Decrypted (raw):', decrypted)
    
    const parsed = JSON.parse(decrypted)
    console.log('Parsed backup codes:', parsed)
  } catch (error) {
    console.error('\n❌ Decryption failed:', error)
  }
}

main().catch(console.error)

