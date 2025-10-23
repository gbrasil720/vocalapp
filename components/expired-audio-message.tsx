'use client'

import { Calendar, Clock, Info } from 'lucide-react'
import SpotlightCard from './SpotlightCard'

interface ExpiredAudioMessageProps {
  createdAt: Date
  isPro?: boolean
}

export function ExpiredAudioMessage({
  createdAt,
  isPro = false
}: ExpiredAudioMessageProps) {
  const retentionDays = isPro ? 90 : 7
  const planName = isPro ? 'Pro' : 'Free'

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const expirationDate = new Date(
    new Date(createdAt).getTime() + retentionDays * 24 * 60 * 60 * 1000
  )

  return (
    <SpotlightCard className="bg-transparent backdrop-blur-xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gray-500/20">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Audio File Expired
            </h3>
            <p className="text-sm text-gray-400">
              The original audio file is no longer available
            </p>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#03b3c3] flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                Audio files on the{' '}
                <span className="font-semibold text-white">
                  {planName} Plan
                </span>{' '}
                are retained for{' '}
                <span className="font-semibold text-white">
                  {retentionDays} days
                </span>{' '}
                from the upload date.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  Uploaded: {formatDate(createdAt)} • Expired:{' '}
                  {formatDate(expirationDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA for Free Users */}
        {!isPro && (
          <div className="bg-gradient-to-r from-[#d856bf]/10 to-[#03b3c3]/10 border border-[#d856bf]/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  Want longer audio history?
                </p>
                <p className="text-xs text-gray-400">
                  Upgrade to Pro and keep your audio files for 90 days
                </p>
              </div>
              <a
                href="/#pricing"
                className="px-4 py-2 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white text-sm font-semibold hover:scale-105 transition-transform whitespace-nowrap"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        )}

        {/* Note about transcription text */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Info className="w-4 h-4" />
          <span>
            Your transcription text is permanently saved and can still be
            downloaded.
          </span>
        </div>
      </div>
    </SpotlightCard>
  )
}
