/**
 * Utility functions for detecting stuck/delayed transcriptions
 */

/**
 * Calculate the expected processing time for a transcription based on file size.
 * 
 * Formula: ~1 minute per 5MB of file size, with a minimum of 10 minutes.
 * This accounts for upload time, processing, and potential queue delays.
 * 
 * @param fileSize - File size in bytes
 * @returns Expected processing time in minutes
 */
export function getExpectedProcessingTime(fileSize: number): number {
  const fileSizeMB = fileSize / (1024 * 1024)
  const baseTime = Math.ceil(fileSizeMB / 5) // 1 minute per 5MB
  const buffer = 5 // 5 minute buffer for queue/overhead
  const minimumTime = 10 // minimum 10 minutes threshold
  
  return Math.max(baseTime + buffer, minimumTime)
}

/**
 * Check if a transcription is taking longer than expected to process.
 * 
 * @param fileSize - File size in bytes
 * @param createdAt - When the transcription was created
 * @returns true if the transcription is stuck/delayed
 */
export function isTranscriptionStuck(
  fileSize: number,
  createdAt: Date | string
): boolean {
  const expectedMinutes = getExpectedProcessingTime(fileSize)
  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const now = new Date()
  const elapsedMinutes = (now.getTime() - createdDate.getTime()) / (1000 * 60)
  
  return elapsedMinutes > expectedMinutes
}

/**
 * Get the elapsed time since transcription was created in a human-readable format.
 * 
 * @param createdAt - When the transcription was created
 * @returns Human-readable elapsed time string
 */
export function getElapsedTime(createdAt: Date | string): string {
  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const now = new Date()
  const elapsedMs = now.getTime() - createdDate.getTime()
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60))
  
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${elapsedMinutes !== 1 ? 's' : ''}`
  }
  
  const hours = Math.floor(elapsedMinutes / 60)
  const minutes = elapsedMinutes % 60
  
  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min`
}


