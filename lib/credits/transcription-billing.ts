import { deductCredits, hasEnoughCredits } from './index'

/**
 * Calculate transcription cost based on duration
 * @param durationMinutes Duration in minutes
 * @returns Cost in credits (1 credit = 1 minute)
 */
export function calculateTranscriptionCost(durationMinutes: number): number {
  return Math.ceil(durationMinutes)
}

/**
 * Deduct credits for a transcription
 * @param userId User ID
 * @param durationMinutes Duration in minutes
 * @param transcriptionId Transcription ID for tracking
 * @throws Error if user doesn't have enough credits
 */
export async function deductTranscriptionCredits(
  userId: string,
  durationMinutes: number,
  transcriptionId: string
): Promise<void> {
  const cost = calculateTranscriptionCost(durationMinutes)

  // Check if user has enough credits
  const hasEnough = await hasEnoughCredits(userId, cost)
  if (!hasEnough) {
    throw new Error(
      `Insufficient credits. Required: ${cost} credits for ${durationMinutes} minutes of transcription.`
    )
  }

  // Deduct credits
  await deductCredits(
    userId,
    cost,
    `Transcription for ${durationMinutes} minutes`,
    {
      transcriptionId,
      durationMinutes,
      costInCredits: cost
    }
  )
}

/**
 * Check if user can afford a transcription
 * @param userId User ID
 * @param durationMinutes Duration in minutes
 * @returns True if user has enough credits
 */
export async function canAffordTranscription(
  userId: string,
  durationMinutes: number
): Promise<boolean> {
  const cost = calculateTranscriptionCost(durationMinutes)
  return await hasEnoughCredits(userId, cost)
}
