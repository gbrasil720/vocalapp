import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'

// This script resets the drizzle migrations table and marks the current migration as applied
// Run with: bunx tsx scripts/reset-migrations.ts

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  console.log('🔄 Resetting drizzle migrations table...')

  // Drop and recreate the migrations table
  await sql`DROP TABLE IF EXISTS "__drizzle_migrations"`
  await sql`
    CREATE TABLE "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `

  // Read the journal to get the migration info
  const journalPath = path.join(process.cwd(), 'drizzle', 'meta', '_journal.json')
  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))

  // Mark all migrations as applied
  for (const entry of journal.entries) {
    const migrationFile = path.join(process.cwd(), 'drizzle', `${entry.tag}.sql`)
    if (fs.existsSync(migrationFile)) {
      const hash = entry.tag
      const createdAt = entry.when
      
      await sql`
        INSERT INTO "__drizzle_migrations" (hash, created_at)
        VALUES (${hash}, ${createdAt})
      `
      console.log(`✅ Marked migration as applied: ${entry.tag}`)
    }
  }

  console.log('✨ Migration state reset complete!')
}

main().catch(console.error)

