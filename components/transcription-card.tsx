import {
  Clock01Icon,
  Download01Icon,
  File02Icon,
  GlobeIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import { isTranscriptionStuck } from '@/lib/transcription-utils'
import { getLanguageName } from '@/lib/utils'
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

  const isStuck = useMemo(() => {
    if (transcription.status !== 'processing') return false
    return isTranscriptionStuck(transcription.fileSize, transcription.createdAt)
  }, [transcription.status, transcription.fileSize, transcription.createdAt])

  return (
    <Link
      key={transcription.id}
      href={`/dashboard/transcription/${transcription.id}`}
      className="block h-full w-full"
    >
      <SpotlightCard className="bg-transparent backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-transform h-full w-full !p-4 sm:!p-6">
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-xl bg-white/5 flex-shrink-0">
              <HugeiconsIcon icon={File02Icon} size={18} color="#03b3c3" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white mb-2 truncate text-sm sm:text-base">
                {transcription.fileName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                <span className="flex items-center gap-1 flex-shrink-0">
                  <HugeiconsIcon icon={Clock01Icon} size={14} color="#03b3c3" />
                  <span className="whitespace-nowrap">
                    {formatDuration(transcription.duration)}
                  </span>
                </span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <HugeiconsIcon icon={GlobeIcon} size={14} color="#03b3c3" />
                  <span className="whitespace-nowrap">
                    {getLanguageName(transcription.language)}
                  </span>
                </span>
                <span className="whitespace-nowrap">
                  {formatRelativeTime(transcription.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 flex-shrink-0 pt-1">
            {transcription.status === 'completed' ? (
              <>
                <span className="px-2 py-1 bg-green-400/20 text-green-400 text-xs rounded-full whitespace-nowrap">
                  Completed
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="p-1.5 rounded-full hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  <HugeiconsIcon
                    icon={Download01Icon}
                    size={14}
                    color="#03b3c3"
                  />
                </button>
              </>
            ) : transcription.status === 'failed' ? (
              <span className="px-2 py-1 bg-red-400/20 text-red-400 text-xs rounded-full whitespace-nowrap">
                Failed
              </span>
            ) : isStuck ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-400/20 text-orange-400 text-xs rounded-full whitespace-nowrap">
                <AlertTriangle className="w-3 h-3" />
                Delayed
              </span>
            ) : (
              <span className="px-2 py-1 bg-[#d856bf]/20 text-[#d856bf] text-xs rounded-full animate-pulse whitespace-nowrap">
                Processing...
              </span>
            )}
          </div>
        </div>
      </SpotlightCard>
    </Link>
  )
}
