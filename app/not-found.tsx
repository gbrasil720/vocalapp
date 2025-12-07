'use client'

import {
  ArrowLeft01Icon,
  Home01Icon,
  Search01Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d856bf]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="p-5 rounded-full bg-zinc-900/80 border border-zinc-700">
            <HugeiconsIcon
              icon={Search01Icon}
              className="w-10 h-10 text-cyan-400"
            />
          </div>
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-8xl sm:text-9xl font-bold leading-none text-white/10 select-none">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 mb-8 text-lg">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-[#d856bf] hover:bg-[#c247ac] text-white font-medium rounded-xl transition-colors"
          >
            <HugeiconsIcon icon={Home01Icon} className="w-5 h-5" />
            Go Home
          </Link>
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
