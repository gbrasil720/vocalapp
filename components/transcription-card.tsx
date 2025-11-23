import {
  Clock01Icon,
  Download01Icon,
  File02Icon,
  GlobeIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useCallback } from 'react'
import SpotlightCard from './SpotlightCard'

interface TranscriptionProps {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  duration: number | null
  language: string | null
  status: 'processing' | 'completed' | 'failed'
  creditsUsed: number | null
  createdAt: string
  completedAt: string | null
}

export function TranscriptionCard({
  transcription
}: {
  transcription: TranscriptionProps
}) {
  const formatDuration = useCallback((seconds: number | null): string => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }, [])

  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }, [])

  return (
    <Link
      key={transcription.id}
      href={`/dashboard/transcription/${transcription.id}`}
    >
      <SpotlightCard className="bg-transparent backdrop-blur-xl mt-3 cursor-pointer hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 rounded-xl bg-white/5">
              <HugeiconsIcon icon={File02Icon} size={20} color="#03b3c3" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                {transcription.fileName}
              </h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Clock01Icon} size={16} color="#03b3c3" />
                  {formatDuration(transcription.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={GlobeIcon} size={16} color="#03b3c3" />
                  {transcription.language || 'Unknown'}
                </span>
                <span>{formatRelativeTime(transcription.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {transcription.status === 'completed' ? (
              <>
                <span className="px-3 py-1 bg-green-400/20 text-green-400 text-xs rounded-full">
                  Completed
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <HugeiconsIcon
                    icon={Download01Icon}
                    size={16}
                    color="#03b3c3"
                  />
                </button>
              </>
            ) : transcription.status === 'failed' ? (
              <span className="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded-full">
                Failed
              </span>
            ) : (
              <span className="px-3 py-1 bg-[#d856bf]/20 text-[#d856bf] text-xs rounded-full animate-pulse">
                Processing...
              </span>
            )}
          </div>
        </div>
      </SpotlightCard>
    </Link>
  )
}
