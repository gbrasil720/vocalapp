import { deductCredits, hasEnoughCredits } from './index'

export function calculateTranscriptionCost(durationSeconds: number): number {
  return Math.ceil(durationSeconds / 60)
}

export async function deductTranscriptionCredits(
  userId: string,
  durationSeconds: number,
  transcriptionId: string
): Promise<void> {
  const cost = calculateTranscriptionCost(durationSeconds)
  const durationMinutes = Math.ceil(durationSeconds / 60)

  const hasEnough = await hasEnoughCredits(userId, cost)
  if (!hasEnough) {
    throw new Error(
      `Insufficient credits. Required: ${cost} credits for ${durationMinutes} minute(s) of transcription.`
    )
  }

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

export async function canAffordTranscription(
  userId: string,
  durationSeconds: number
): Promise<boolean> {
  const cost = calculateTranscriptionCost(durationSeconds)
  return await hasEnoughCredits(userId, cost)
}
