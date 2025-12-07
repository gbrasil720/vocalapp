'use client'

import {
  Alert02Icon,
  Home01Icon,
  RefreshIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-white antialiased`}>
        <div className="min-h-screen flex items-center justify-center px-4">
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
              Critical Error
            </h1>
            <p className="text-gray-400 mb-4 text-lg">
              A critical error occurred while loading the application. This has been logged for investigation.
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
              <a
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors border border-zinc-700"
              >
                <HugeiconsIcon icon={Home01Icon} className="w-5 h-5" />
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
