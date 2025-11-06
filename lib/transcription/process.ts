import { eq } from 'drizzle-orm'
import OpenAI from 'openai'
import { db } from '@/db'
import { transcription as transcriptionTable } from '@/db/schema'
import { canUseLanguage, getPlanLimits } from '../billing/plan-limits'
import { deductTranscriptionCredits } from '../credits/transcription-billing'
import {
  detectLanguageFromUrl,
  normalizeLanguageCode
} from './language-detection'
import {
  getUserLanguageCount,
  hasActiveSubscription,
  isNewLanguage
} from './language-tracking'

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

    // Step 1: Detect language before transcription
    console.log(`🔍 Detecting language for transcription ${transcriptionId}...`)
    const detectedLanguage = await detectLanguageFromUrl(
      record.fileUrl,
      record.fileName,
      record.mimeType
    )

    // Step 2: Check user's plan and language limits
    const hasSubscription = await hasActiveSubscription(record.userId)
    const currentLanguageCount = await getUserLanguageCount(record.userId)
    const isNewLang = await isNewLanguage(record.userId, detectedLanguage)

    console.log(`📊 Language check:`, {
      detected: detectedLanguage,
      isNew: isNewLang,
      currentCount: currentLanguageCount,
      hasSubscription,
      plan: hasSubscription ? 'Pro' : 'Free'
    })

    // Step 3: Check if user can use this language
    const languageCheck = canUseLanguage(
      hasSubscription,
      currentLanguageCount,
      isNewLang
    )

    // Step 4: Determine transcription language
    let transcriptionLanguage = detectedLanguage
    let languageLimitExceeded = false
    const metadata: Record<string, unknown> = {
      detectedLanguage,
      ...(record.metadata as Record<string, unknown> || {})
    }

    if (!languageCheck.canUse) {
      // User exceeded language limit - transcribe to English
      transcriptionLanguage = 'en'
      languageLimitExceeded = true
      metadata.languageLimitExceeded = true
      metadata.languageLimitMessage = languageCheck.reason

      console.log(
        `⚠️  Language limit exceeded for user ${record.userId}. Transcribing to English instead of ${detectedLanguage}`
      )
    }

    // Normalize language code to ensure ISO-639-1 format
    const normalizedLanguage = normalizeLanguageCode(transcriptionLanguage)

    // Step 5: Send to Whisper API for transcription
    console.log(
      `📝 Transcribing with language: ${normalizedLanguage} (detected: ${detectedLanguage}, original: ${transcriptionLanguage})`
    )
    const transcriptionResult = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: normalizedLanguage, // Use normalized ISO-639-1 code
      response_format: 'verbose_json'
    })

    // Transcription successful - now update DB and deduct credits
    const creditsUsed = Math.ceil(record.duration / 60)

    // Step 6: Update metadata with language information
    const finalMetadata = {
      ...metadata,
      language: transcriptionResult.language,
      segments: transcriptionResult.segments?.slice(0, 10),
      // Store detected language even if we transcribed in English
      ...(languageLimitExceeded && {
        originalDetectedLanguage: detectedLanguage,
        transcribedLanguage: transcriptionLanguage
      })
    }

    // Update database with transcription result
    await db
      .update(transcriptionTable)
      .set({
        status: 'completed',
        text: transcriptionResult.text,
        language: normalizedLanguage, // Store the normalized ISO-639-1 language code
        creditsUsed,
        completedAt: new Date(),
        metadata: finalMetadata
      })
      .where(eq(transcriptionTable.id, transcriptionId))

    // Step 7: Track language if it's new and was successfully used
    // (Don't track if we forced English due to limit)
    if (!languageLimitExceeded && isNewLang && transcriptionLanguage !== 'en') {
      console.log(
        `✅ New language ${transcriptionLanguage} added for user ${record.userId}`
      )
      // Language is automatically tracked via the transcription record
      // The getUserLanguages function queries the transcriptions table
    }

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
