import { eq } from 'drizzle-orm'
import OpenAI from 'openai'
import { db } from '@/db'
import { transcription as transcriptionTable } from '@/db/schema'
import { deductTranscriptionCredits } from '../credits/transcription-billing'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function processTranscription(transcriptionId: string) {
  let fileUrl: string | null = null

  try {
    // Fetch transcription record
    const [record] = await db
      .select()
      .from(transcriptionTable)
      .where(eq(transcriptionTable.id, transcriptionId))
      .limit(1)

    if (!record) {
      throw new Error('Transcription not found')
    }

    if (!record.fileUrl) {
      throw new Error('File URL not found')
    }

    if (!record.duration || record.duration <= 0) {
      throw new Error('Audio duration not found or invalid')
    }

    fileUrl = record.fileUrl

    // Download audio file
    const fileResponse = await fetch(record.fileUrl)
    if (!fileResponse.ok) {
      throw new Error('Failed to download file')
    }

    const fileBlob = await fileResponse.blob()
    const file = new File([fileBlob], record.fileName, {
      type: record.mimeType
    })

    // Send to Whisper API for transcription
    const transcriptionResult = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: record.language || 'en',
      response_format: 'verbose_json'
    })

    // Transcription successful - now update DB and deduct credits
    const creditsUsed = Math.ceil(record.duration / 60)

    // Update database with transcription result
    await db
      .update(transcriptionTable)
      .set({
        status: 'completed',
        text: transcriptionResult.text,
        creditsUsed,
        completedAt: new Date(),
        metadata: {
          language: transcriptionResult.language,
          segments: transcriptionResult.segments?.slice(0, 10)
        }
      })
      .where(eq(transcriptionTable.id, transcriptionId))

    // Deduct credits AFTER successful completion
    try {
      await deductTranscriptionCredits(
        record.userId,
        record.duration,
        transcriptionId
      )
    } catch (creditError) {
      console.error(
        `Warning: Credit deduction failed for ${transcriptionId}:`,
        creditError
      )
      // Transcription still succeeded, log the credit issue but don't fail
    }

    console.log(`✓ Transcription ${transcriptionId} completed successfully`)
    console.log(`Audio file retained for playback: ${fileUrl}`)

    return {
      success: true,
      transcriptionId,
      text: transcriptionResult.text,
      duration: record.duration,
      creditsUsed
    }
  } catch (error) {
    console.error(`Error processing transcription ${transcriptionId}:`, error)

    // Update status to failed
    await db
      .update(transcriptionTable)
      .set({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      })
      .where(eq(transcriptionTable.id, transcriptionId))

    console.log(`✗ Transcription ${transcriptionId} failed`)
    console.log(`Audio file retained for debugging: ${fileUrl}`)

    throw error
  }
}
