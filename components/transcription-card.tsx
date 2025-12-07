import {
  Alert02Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  File02Icon,
  Globe02Icon,
  GlobeIcon,
  Loading03Icon,
  LockKeyIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import { isTranscriptionStuck } from '@/lib/transcription-utils'
import { getLanguageName } from '@/lib/utils'

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
  isPublic: boolean
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
      className="block h-full w-full group"
    >
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 h-full hover:border-zinc-700 transition-all group-hover:bg-zinc-900/70">
        <div className="flex flex-col gap-3 h-full">
          {/* Header with icon and filename */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-cyan-500/10 flex-shrink-0">
              <HugeiconsIcon
                icon={File02Icon}
                size={18}
                className="text-cyan-400"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white mb-1.5 truncate text-sm group-hover:text-cyan-400 transition-colors">
                {transcription.fileName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1 flex-shrink-0">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    size={12}
                    className="text-gray-500"
                  />
                  <span className="whitespace-nowrap">
                    {formatDuration(transcription.duration)}
                  </span>
                </span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <HugeiconsIcon
                    icon={GlobeIcon}
                    size={12}
                    className="text-gray-500"
                  />
                  <span className="whitespace-nowrap">
                    {getLanguageName(transcription.language)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Footer with badges and time */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
            <span className="text-xs text-gray-600">
              {formatRelativeTime(transcription.createdAt)}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md whitespace-nowrap ${
                  transcription.isPublic
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-zinc-800 text-gray-400 border border-zinc-700'
                }`}
              >
                <HugeiconsIcon
                  icon={transcription.isPublic ? Globe02Icon : LockKeyIcon}
                  size={10}
                />
                {transcription.isPublic ? 'Public' : 'Private'}
              </span>
              {transcription.status === 'completed' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs rounded-md whitespace-nowrap">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={10} />
                  Done
                </span>
              ) : transcription.status === 'failed' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-md whitespace-nowrap">
                  <HugeiconsIcon icon={CancelCircleIcon} size={10} />
                  Failed
                </span>
              ) : isStuck ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs rounded-md whitespace-nowrap">
                  <HugeiconsIcon icon={Alert02Icon} size={10} />
                  Delayed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#d856bf]/10 text-[#d856bf] border border-[#d856bf]/20 text-xs rounded-md animate-pulse whitespace-nowrap">
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={10}
                    className="animate-spin"
                  />
                  Processing
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
