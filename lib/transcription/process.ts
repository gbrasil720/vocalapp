import { eq } from 'drizzle-orm'
import OpenAI from 'openai'
import { db } from '@/db'
import { transcription as transcriptionTable } from '@/db/schema'
import { deductTranscriptionCredits } from '../credits/transcription-billing'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function processTranscription(transcriptionId: string) {
  try {
    // Get transcription record
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

    // Download the file from URL
    const fileResponse = await fetch(record.fileUrl)
    if (!fileResponse.ok) {
      throw new Error('Failed to download file')
    }

    const fileBlob = await fileResponse.blob()
    const file = new File([fileBlob], record.fileName, {
      type: record.mimeType
    })

    // Process with OpenAI Whisper
    const transcriptionResult = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: record.language || 'en',
      response_format: 'verbose_json' // Get duration and other metadata
    })

    // Calculate duration in minutes for credits
    const durationMinutes = Math.ceil((transcriptionResult.duration || 0) / 60)

    // Deduct credits
    await deductTranscriptionCredits(
      record.userId,
      durationMinutes,
      transcriptionId
    )

    // Update transcription record with results
    await db
      .update(transcriptionTable)
      .set({
        status: 'completed',
        text: transcriptionResult.text,
        duration: Math.floor(transcriptionResult.duration || 0),
        creditsUsed: durationMinutes,
        completedAt: new Date(),
        metadata: {
          language: transcriptionResult.language,
          segments: transcriptionResult.segments?.slice(0, 10) // Store first 10 segments for timestamps
        }
      })
      .where(eq(transcriptionTable.id, transcriptionId))

    console.log(`✓ Transcription ${transcriptionId} completed successfully`)

    return {
      success: true,
      transcriptionId,
      text: transcriptionResult.text,
      duration: transcriptionResult.duration,
      creditsUsed: durationMinutes
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

    throw error
  }
}



