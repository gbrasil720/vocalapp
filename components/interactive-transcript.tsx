'use client'

import { useCallback, useMemo } from 'react'

export interface TranscriptSegment {
  id: number
  start: number
  end: number
  text: string
}

interface InteractiveTranscriptProps {
  segments: TranscriptSegment[]
  currentTime: number
  onSegmentClick: (startTime: number) => void
}

export function InteractiveTranscript({
  segments,
  currentTime,
  onSegmentClick
}: InteractiveTranscriptProps) {
  const activeSegmentId = useMemo(() => {
    const active = segments.find(
      (seg) => currentTime >= seg.start && currentTime < seg.end
    )
    return active?.id ?? null
  }, [segments, currentTime])

  const handleSegmentClick = useCallback(
    (startTime: number) => {
      onSegmentClick(startTime)
    },
    [onSegmentClick]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, startTime: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSegmentClick(startTime)
      }
    },
    [onSegmentClick]
  )

  if (!segments || segments.length === 0) {
    return (
      <p className="text-gray-400 italic text-lg leading-loose">
        No segment data available. Displaying plain text transcription.
      </p>
    )
  }

  return (
    <div className="text-gray-200 text-lg leading-loose">
      {segments.map((segment) => {
        const isActive = segment.id === activeSegmentId

        return (
          <span
            key={segment.id}
            onClick={() => handleSegmentClick(segment.start)}
            onKeyDown={(e) => handleKeyDown(e, segment.start)}
            role="button"
            tabIndex={0}
            className={`
              inline cursor-pointer rounded-md px-1 mr-1
              transition-colors duration-200
              hover:text-cyan-400 hover:bg-cyan-500/5
              focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-1 focus:ring-offset-transparent
              ${isActive ? 'text-cyan-400 bg-cyan-500/10 font-medium' : ''}
            `}
            title={`Jump to ${formatTimestamp(segment.start)}`}
          >
            {segment.text}
          </span>
        )
      })}
    </div>
  )
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

