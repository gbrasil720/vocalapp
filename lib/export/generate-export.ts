/**
 * Export utility functions for transcription downloads
 * Supports SRT, VTT, TXT, and JSON formats
 */

export type ExportFormat = 'srt' | 'vtt' | 'txt' | 'json'

export interface ExportOptions {
  fileName: string
  duration: number | null
  language: string | null
  text?: string
}

interface TranscriptionExportData {
  fileName: string
  text: string
  language: string | null
  duration: number | null
  exportedAt: string
}

/**
 * Splits text into segments for subtitle formats
 * Uses sentence boundaries to create reasonable cue lengths
 */
function splitIntoSegments(text: string): string[] {
  // Split by sentence-ending punctuation while keeping the punctuation
  const sentences = text.split(/(?<=[.!?])\s+/)
  const segments: string[] = []
  let currentSegment = ''

  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (!trimmed) continue

    // If adding this sentence would make the segment too long, start a new one
    if (currentSegment.length + trimmed.length > 120 && currentSegment) {
      segments.push(currentSegment.trim())
      currentSegment = trimmed
    } else {
      currentSegment += (currentSegment ? ' ' : '') + trimmed
    }
  }

  // Don't forget the last segment
  if (currentSegment.trim()) {
    segments.push(currentSegment.trim())
  }

  // If no segments were created (no sentence punctuation), split by newlines or create chunks
  if (segments.length === 0) {
    const lines = text.split(/\n+/).filter((line) => line.trim())
    if (lines.length > 0) {
      return lines
    }
    // Last resort: split into chunks of ~100 characters at word boundaries
    const words = text.split(/\s+/)
    let chunk = ''
    for (const word of words) {
      if (chunk.length + word.length > 100 && chunk) {
        segments.push(chunk.trim())
        chunk = word
      } else {
        chunk += (chunk ? ' ' : '') + word
      }
    }
    if (chunk.trim()) {
      segments.push(chunk.trim())
    }
  }

  return segments.length > 0 ? segments : [text]
}

/**
 * Formats time in SRT format: HH:MM:SS,mmm (comma for milliseconds)
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

/**
 * Formats time in VTT format: HH:MM:SS.mmm (period for milliseconds)
 */
function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

/**
 * Generates SubRip (.srt) format
 * Index starts at 1, time format: HH:MM:SS,mmm
 */
export function formatSRT(
  text: string,
  duration: number | null
): string {
  const segments = splitIntoSegments(text)
  const totalDuration = duration || segments.length * 5 // Default 5 seconds per segment
  const segmentDuration = totalDuration / segments.length

  let srt = ''
  segments.forEach((segment, index) => {
    const startTime = index * segmentDuration
    const endTime = (index + 1) * segmentDuration

    srt += `${index + 1}\n`
    srt += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`
    srt += `${segment}\n\n`
  })

  return srt.trim()
}

/**
 * Generates WebVTT (.vtt) format
 * Starts with WEBVTT header, time format: HH:MM:SS.mmm
 */
export function formatVTT(
  text: string,
  duration: number | null
): string {
  const segments = splitIntoSegments(text)
  const totalDuration = duration || segments.length * 5
  const segmentDuration = totalDuration / segments.length

  let vtt = 'WEBVTT\n\n'
  segments.forEach((segment, index) => {
    const startTime = index * segmentDuration
    const endTime = (index + 1) * segmentDuration

    vtt += `${index + 1}\n`
    vtt += `${formatVTTTime(startTime)} --> ${formatVTTTime(endTime)}\n`
    vtt += `${segment}\n\n`
  })

  return vtt.trim()
}

/**
 * Returns plain text with preserved line breaks
 * No timestamps or metadata
 */
export function formatTXT(text: string): string {
  return text.trim()
}

/**
 * Returns formatted JSON with transcription data
 */
export function formatJSON(data: TranscriptionExportData): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Gets the appropriate file extension for a format
 */
function getExtension(format: ExportFormat): string {
  const extensions: Record<ExportFormat, string> = {
    srt: '.srt',
    vtt: '.vtt',
    txt: '.txt',
    json: '.json'
  }
  return extensions[format]
}

/**
 * Gets the appropriate MIME type for a format
 */
function getMimeType(format: ExportFormat): string {
  const mimeTypes: Record<ExportFormat, string> = {
    srt: 'text/plain',
    vtt: 'text/vtt',
    txt: 'text/plain',
    json: 'application/json'
  }
  return mimeTypes[format]
}

/**
 * Generates the export filename
 * Removes original extension and adds the appropriate export extension
 * Falls back to transcript-[date].[ext] if name is empty
 */
export function getExportFileName(
  originalName: string,
  format: ExportFormat
): string {
  const extension = getExtension(format)

  if (!originalName || originalName.trim() === '') {
    const date = new Date().toISOString().split('T')[0]
    return `transcript-${date}${extension}`
  }

  // Remove the original file extension
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '')
  return `${nameWithoutExtension}${extension}`
}

/**
 * Main function that creates the appropriate Blob based on format
 */
export function generateExportBlob(
  text: string,
  format: ExportFormat,
  options: ExportOptions
): Blob {
  const mimeType = getMimeType(format)
  let content: string

  switch (format) {
    case 'srt':
      content = formatSRT(text, options.duration)
      break
    case 'vtt':
      content = formatVTT(text, options.duration)
      break
    case 'txt':
      content = formatTXT(text)
      break
    case 'json':
      content = formatJSON({
        fileName: options.fileName,
        text: text,
        language: options.language,
        duration: options.duration,
        exportedAt: new Date().toISOString()
      })
      break
    default:
      content = text
  }

  return new Blob([content], { type: mimeType })
}

/**
 * Triggers download using file-saver for reliable cross-browser support
 */
export function downloadExport(blob: Blob, fileName: string): void {
  // Use dynamic import to handle file-saver
  import('file-saver').then(({ saveAs }) => {
    saveAs(blob, fileName)
  })
}
