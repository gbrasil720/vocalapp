'use client'

import {
  Alert02Icon,
  ArrowLeft01Icon,
  RefreshIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="p-6 rounded-full bg-red-500/10 border border-red-500/30">
            <HugeiconsIcon
              icon={Alert02Icon}
              className="w-16 h-16 text-red-400"
            />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Something Went Wrong
        </h1>
        <p className="text-gray-400 mb-4 text-lg">
          An unexpected error occurred. We&apos;ve been notified and are working on a fix.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-left">
            <p className="text-sm font-mono text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-[#d856bf] hover:bg-[#c247ac] text-white font-medium rounded-xl transition-colors"
          >
            <HugeiconsIcon icon={RefreshIcon} className="w-5 h-5" />
            Try Again
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors border border-zinc-700"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
