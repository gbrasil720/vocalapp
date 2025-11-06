import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Map language names/codes to ISO-639-1 format
 * Whisper API requires ISO-639-1 format (e.g., 'pt', 'en', 'es')
 */
const LANGUAGE_MAP: Record<string, string> = {
  // Common full names
  portuguese: 'pt',
  english: 'en',
  spanish: 'es',
  french: 'fr',
  german: 'de',
  italian: 'it',
  japanese: 'ja',
  chinese: 'zh',
  korean: 'ko',
  russian: 'ru',
  arabic: 'ar',
  hindi: 'hi',
  turkish: 'tr',
  polish: 'pl',
  dutch: 'nl',
  swedish: 'sv',
  norwegian: 'no',
  danish: 'da',
  finnish: 'fi',
  greek: 'el',
  hebrew: 'he',
  thai: 'th',
  vietnamese: 'vi',
  indonesian: 'id',
  malay: 'ms',
  tagalog: 'tl',
  ukrainian: 'uk',
  czech: 'cs',
  romanian: 'ro',
  hungarian: 'hu',
  bulgarian: 'bg',
  croatian: 'hr',
  serbian: 'sr',
  slovak: 'sk',
  slovenian: 'sl',
  // Already in ISO format (pass through)
  pt: 'pt',
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  it: 'it',
  ja: 'ja',
  zh: 'zh',
  ko: 'ko',
  ru: 'ru',
  ar: 'ar',
  hi: 'hi',
  tr: 'tr',
  pl: 'pl',
  nl: 'nl',
  sv: 'sv',
  no: 'no',
  da: 'da',
  fi: 'fi',
  el: 'el',
  he: 'he',
  th: 'th',
  vi: 'vi',
  id: 'id',
  ms: 'ms',
  tl: 'tl',
  uk: 'uk',
  cs: 'cs',
  ro: 'ro',
  hu: 'hu',
  bg: 'bg',
  hr: 'hr',
  sr: 'sr',
  sk: 'sk',
  sl: 'sl'
}

/**
 * Normalize language code to ISO-639-1 format
 * @param language Language code or name
 * @returns ISO-639-1 language code (defaults to 'en' if not found)
 */
export function normalizeLanguageCode(
  language: string | null | undefined
): string {
  if (!language) return 'en'

  const normalized = language.toLowerCase().trim()

  // Check if it's already in ISO format or mapped
  if (LANGUAGE_MAP[normalized]) {
    return LANGUAGE_MAP[normalized]
  }

  // If it's already a 2-letter code and not in map, assume it's valid ISO-639-1
  if (normalized.length === 2) {
    return normalized
  }

  // Default to English if we can't map it
  console.warn(
    `⚠️  Unknown language format: "${language}", defaulting to English`
  )
  return 'en'
}

/**
 * Detect the language of an audio file using Whisper API
 * @param audioFile The audio file to detect language for
 * @returns Detected language code (e.g., 'en', 'es', 'pt', 'fr')
 */
export async function detectLanguage(audioFile: File): Promise<string> {
  try {
    // Use Whisper API to detect language
    // By not specifying a language parameter, Whisper will detect it automatically
    // Using verbose_json to get the language field in response
    const result = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json'
      // Don't specify language - let Whisper detect it
      // Only transcribe a small portion for faster detection (optional optimization)
    })

    // Whisper returns detected language in the response
    // The language field should be in ISO-639-1 format, but we normalize it to be safe
    const rawLanguage = result.language || 'en'
    const detectedLanguage = normalizeLanguageCode(rawLanguage)

    console.log(
      `🔍 Detected language: ${rawLanguage} → ${detectedLanguage} for file: ${audioFile.name}`
    )

    return detectedLanguage
  } catch (error) {
    console.error('Error detecting language:', error)
    // Fallback to English if detection fails
    console.warn('⚠️  Language detection failed, defaulting to English')
    return 'en'
  }
}

/**
 * Detect language from audio file URL
 * Downloads the file first, then detects language
 * @param fileUrl URL of the audio file
 * @param fileName Name of the file
 * @param mimeType MIME type of the file
 * @returns Detected language code
 */
export async function detectLanguageFromUrl(
  fileUrl: string,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    // Download audio file
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error('Failed to download file for language detection')
    }

    const fileBlob = await fileResponse.blob()
    const file = new File([fileBlob], fileName, {
      type: mimeType
    })

    return await detectLanguage(file)
  } catch (error) {
    console.error('Error detecting language from URL:', error)
    return 'en' // Fallback to English
  }
}
