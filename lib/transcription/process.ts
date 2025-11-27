import { eq } from 'drizzle-orm'
import Groq from 'groq-sdk' // Mudança aqui
import { db } from '@/db'
import { transcription as transcriptionTable } from '@/db/schema'
import { canUseLanguage } from '../billing/plan-limits'
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

// Inicializa o cliente da Groq
const getGroqClient = () => {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key_for_build'
  })
}

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

    // Download do arquivo (Mantido igual, funciona bem com a Groq)
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
      `📝 Transcribing with Groq (Language: ${normalizedLanguage}, Original: ${transcriptionLanguage})`
    )

    // --- CORREÇÃO AQUI ---
    // Usamos 'as any' aqui porque o SDK da Groq ainda não tipa corretamente
    // o retorno do 'verbose_json' automaticamente no TypeScript.
    const transcriptionResult = (await getGroqClient().audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3-turbo',
      language: normalizedLanguage,
      response_format: 'verbose_json',
      temperature: 0.0
    })) as any
    // ---------------------

    const creditsUsed = Math.ceil(record.duration / 60)

    const finalMetadata = {
      ...metadata,
      // Agora o TypeScript não vai reclamar, pois tratamos como 'any'
      language: transcriptionResult.language || normalizedLanguage,
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
