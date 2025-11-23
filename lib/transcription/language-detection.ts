import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const LANGUAGE_MAP: Record<string, string> = {
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

export function normalizeLanguageCode(
  language: string | null | undefined
): string {
  if (!language) return 'en'

  const normalized = language.toLowerCase().trim()

  if (LANGUAGE_MAP[normalized]) {
    return LANGUAGE_MAP[normalized]
  }

  if (normalized.length === 2) {
    return normalized
  }

  console.warn(
    `⚠️  Unknown language format: "${language}", defaulting to English`
  )
  return 'en'
}

export async function detectLanguage(audioFile: File): Promise<string> {
  try {
    const result = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json'
    })

    const rawLanguage = result.language || 'en'
    const detectedLanguage = normalizeLanguageCode(rawLanguage)

    console.log(
      `🔍 Detected language: ${rawLanguage} → ${detectedLanguage} for file: ${audioFile.name}`
    )

    return detectedLanguage
  } catch (error) {
    console.error('Error detecting language:', error)
    console.warn('⚠️  Language detection failed, defaulting to English')
    return 'en'
  }
}

export async function detectLanguageFromUrl(
  fileUrl: string,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
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
    return 'en'
  }
}
