import { deductCredits, hasEnoughCredits } from './index'

/**
 * Calculate transcription cost based on duration
 * @param durationSeconds Duration in seconds
 * @returns Cost in credits (1 credit = 1 minute, rounded up)
 */
export function calculateTranscriptionCost(durationSeconds: number): number {
  return Math.ceil(durationSeconds / 60)
}

/**
 * Deduct credits for a transcription
 * @param userId User ID
 * @param durationSeconds Duration in seconds
 * @param transcriptionId Transcription ID for tracking
 * @throws Error if user doesn't have enough credits
 */
export async function deductTranscriptionCredits(
  userId: string,
  durationSeconds: number,
  transcriptionId: string
): Promise<void> {
  const cost = calculateTranscriptionCost(durationSeconds)
  const durationMinutes = Math.ceil(durationSeconds / 60)

  // Check if user has enough credits
  const hasEnough = await hasEnoughCredits(userId, cost)
  if (!hasEnough) {
    throw new Error(
      `Insufficient credits. Required: ${cost} credits for ${durationMinutes} minute(s) of transcription.`
    )
  }

  // Deduct credits
  await deductCredits(
    userId,
    cost,
    `Transcription for ${durationMinutes} minute(s)`,
    {
      transcriptionId,
      durationSeconds,
      durationMinutes,
      costInCredits: cost
    }
  )
}

/**
 * Check if user can afford a transcription
 * @param userId User ID
 * @param durationSeconds Duration in seconds
 * @returns True if user has enough credits
 */
export async function canAffordTranscription(
  userId: string,
  durationSeconds: number
): Promise<boolean> {
  const cost = calculateTranscriptionCost(durationSeconds)
  return await hasEnoughCredits(userId, cost)
}
