import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { transcription } from '@/db/schema'

export async function getUserLanguages(userId: string): Promise<string[]> {
  try {
    const languages = await db
      .selectDistinct({
        language: transcription.language
      })
      .from(transcription)
      .where(
        and(
          eq(transcription.userId, userId),
          sql`${transcription.language} IS NOT NULL`,
          sql`${transcription.language} != ''`
        )
      )

    return languages
      .map((row) => row.language)
      .filter((lang): lang is string => Boolean(lang))
  } catch (error) {
    console.error('Error getting user languages:', error)
    return []
  }
}

export async function getUserLanguageCount(userId: string): Promise<number> {
  try {
    const languages = await getUserLanguages(userId)
    return languages.length
  } catch (error) {
    console.error('Error getting user language count:', error)
    return 0
  }
}

export async function isNewLanguage(
  userId: string,
  languageCode: string
): Promise<boolean> {
  try {
    const userLanguages = await getUserLanguages(userId)
    return !userLanguages.includes(languageCode)
  } catch (error) {
    console.error('Error checking if language is new:', error)
    return true
  }
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const { subscription } = await import('@/db/schema')
    const { eq } = await import('drizzle-orm')

    const [subscriptionData] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, userId))
      .limit(1)

    return subscriptionData?.status === 'active'
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return false
  }
}
