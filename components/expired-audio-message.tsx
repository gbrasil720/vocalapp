'use client'

import {
  Calendar03Icon,
  Clock01Icon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-zinc-800">
          <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Audio File Expired</h3>
          <p className="text-sm text-gray-500">
            The original audio file is no longer available
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"
          />
          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              Audio files on the{' '}
              <span className="font-medium text-white">{planName} Plan</span>{' '}
              are retained for{' '}
              <span className="font-medium text-white">{retentionDays} days</span>{' '}
              from the upload date.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4" />
              <span>
                Uploaded: {formatDate(createdAt)} • Expired:{' '}
                {formatDate(expirationDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA (only for free users) */}
      {!isPro && (
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">
                Want longer audio history?
              </p>
              <p className="text-xs text-gray-400">
                Upgrade to Pro and keep your audio files for 90 days
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="px-4 py-2 bg-[#d856bf] hover:bg-[#c247ac] rounded-lg text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4" />
        <span>
          Your transcription text is permanently saved and can still be
          downloaded.
        </span>
      </div>
    </div>
  )
}

