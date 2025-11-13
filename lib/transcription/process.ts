import { eq } from 'drizzle-orm'
import OpenAI from 'openai'
import { db } from '@/db'
import { transcription as transcriptionTable } from '@/db/schema'
import { canUseLanguage } from '../billing/plan-limits'
import { deductTranscriptionCredits } from '../credits/transcription-billing'
import { env } from '../env'
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
  apiKey: env.OPENAI_API_KEY
})

export async function processTranscription(transcriptionId: string) {
  let fileUrl: string | null = null

  try {
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

    const fileResponse = await fetch(record.fileUrl)
    if (!fileResponse.ok) {
      throw new Error('Failed to download file')
    }

    const fileBlob = await fileResponse.blob()
    const file = new File([fileBlob], record.fileName, {
      type: record.mimeType
    })

    console.log(`🔍 Detecting language for transcription ${transcriptionId}...`)
    const detectedLanguage = await detectLanguageFromUrl(
      record.fileUrl,
      record.fileName,
      record.mimeType
    )

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

    const languageCheck = canUseLanguage(
      hasSubscription,
      currentLanguageCount,
      isNewLang
    )

    let transcriptionLanguage = detectedLanguage
    let languageLimitExceeded = false
    const metadata: Record<string, unknown> = {
      detectedLanguage,
      ...((record.metadata as Record<string, unknown>) || {})
    }

    if (!languageCheck.canUse) {
      transcriptionLanguage = 'en'
      languageLimitExceeded = true
      metadata.languageLimitExceeded = true
      metadata.languageLimitMessage = languageCheck.reason

      console.log(
        `⚠️  Language limit exceeded for user ${record.userId}. Transcribing to English instead of ${detectedLanguage}`
      )
    }

    const normalizedLanguage = normalizeLanguageCode(transcriptionLanguage)

    console.log(
      `📝 Transcribing with language: ${normalizedLanguage} (detected: ${detectedLanguage}, original: ${transcriptionLanguage})`
    )
    const transcriptionResult = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: normalizedLanguage,
      response_format: 'verbose_json'
    })

    const creditsUsed = Math.ceil(record.duration / 60)

    const finalMetadata = {
      ...metadata,
      language: transcriptionResult.language,
      segments: transcriptionResult.segments?.slice(0, 10),
      ...(languageLimitExceeded && {
        originalDetectedLanguage: detectedLanguage,
        transcribedLanguage: transcriptionLanguage
      })
    }

    await db
      .update(transcriptionTable)
      .set({
        status: 'completed',
        text: transcriptionResult.text,
        language: normalizedLanguage,
        creditsUsed,
        completedAt: new Date(),
        metadata: finalMetadata
      })
      .where(eq(transcriptionTable.id, transcriptionId))

    if (!languageLimitExceeded && isNewLang && transcriptionLanguage !== 'en') {
      console.log(
        `✅ New language ${transcriptionLanguage} added for user ${record.userId}`
      )
    }

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
