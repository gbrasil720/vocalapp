import { eq } from 'drizzle-orm'
import { db } from '../db'
import { transcription } from '../db/schema'
import { uploadToBlob, generateBlobKey } from '../lib/storage/vercel-blob'

const BATCH_SIZE = 10

async function migrateS3ToBlob() {
  console.log('🚀 Starting S3 to Vercel Blob migration...\n')

  try {
    const allTranscriptions = await db.select().from(transcription)

    const s3Transcriptions = allTranscriptions.filter(
      (t) =>
        t.fileUrl &&
        (t.fileUrl.includes('s3.amazonaws.com') ||
          t.fileUrl.includes('amazonaws.com'))
    )

    if (s3Transcriptions.length === 0) {
      console.log('✅ No S3 files found to migrate.')
      return
    }

    console.log(`📊 Found ${s3Transcriptions.length} files to migrate\n`)

    let migrated = 0
    let failed = 0

    for (let i = 0; i < s3Transcriptions.length; i += BATCH_SIZE) {
      const batch = s3Transcriptions.slice(i, i + BATCH_SIZE)

      console.log(
        `\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(s3Transcriptions.length / BATCH_SIZE)}`
      )

      for (const record of batch) {
        try {
          console.log(`  ⏳ Migrating: ${record.fileName}...`)

          const response = await fetch(record.fileUrl!)
          if (!response.ok) {
            throw new Error(`Failed to download: ${response.statusText}`)
          }

          const blob = await response.blob()
          const file = new File([blob], record.fileName, {
            type: record.mimeType
          })

          const blobKey = generateBlobKey(record.userId, record.fileName)
          const uploadResult = await uploadToBlob(file, blobKey)

          await db
            .update(transcription)
            .set({ fileUrl: uploadResult.url })
            .where(eq(transcription.id, record.id))

          console.log(`  ✅ Migrated: ${record.fileName}`)
          migrated++
        } catch (error) {
          console.error(
            `  ❌ Failed to migrate ${record.fileName}:`,
            error instanceof Error ? error.message : error
          )
          failed++
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary:')
    console.log(`  ✅ Migrated: ${migrated}`)
    console.log(`  ❌ Failed: ${failed}`)
    console.log(`  📁 Total: ${s3Transcriptions.length}`)
    console.log('='.repeat(50))

    if (failed === 0) {
      console.log('\n🎉 All files migrated successfully!')
      console.log(
        '💡 You can now remove S3 configuration from environment variables'
      )
    } else {
      console.log('\n⚠️  Some files failed to migrate. Review errors above.')
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

migrateS3ToBlob()

