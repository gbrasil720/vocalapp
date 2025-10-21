import { NextResponse } from 'next/server'
import { processTranscription } from '@/lib/transcription/process'

export const maxDuration = 300 // 5 minutes max execution time

export async function POST(req: Request) {
  try {
    const { transcriptionId } = await req.json()

    if (!transcriptionId) {
      return NextResponse.json(
        { error: 'Transcription ID required' },
        { status: 400 }
      )
    }

    // Process the transcription
    const result = await processTranscription(transcriptionId)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error in transcription processing:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Processing failed'
      },
      { status: 500 }
    )
  }
}

