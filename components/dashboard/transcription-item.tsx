import { Clock, Download, FileText, Globe } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'
import SpotlightCard from '@/components/SpotlightCard'

interface TranscriptionItemProps {
  id: string
  fileName: string
  duration: number | null
  language: string | null
  status: 'processing' | 'completed' | 'failed'
  createdAt: string
  formatDuration: (seconds: number | null) => string
  formatRelativeTime: (dateString: string) => string
}

export const TranscriptionItem = memo(function TranscriptionItem({
  id,
  fileName,
  duration,
  language,
  status,
  createdAt,
  formatDuration,
  formatRelativeTime
}: TranscriptionItemProps) {
  return (
    <Link href={`/dashboard/transcription/${id}`}>
      <SpotlightCard className="bg-transparent backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 rounded-xl bg-white/5">
              <FileText className="w-5 h-5 text-[#03b3c3]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">{fileName}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(duration)}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {language || 'Unknown'}
                </span>
                <span>{formatRelativeTime(createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status === 'completed' ? (
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
                  <Download className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </>
            ) : status === 'failed' ? (
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
})
