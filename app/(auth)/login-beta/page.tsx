'use client'

import { UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { BetaBadge } from '@/components/beta-badge'
import { MagicLinkForm } from '@/components/forms/magic-link-form'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import { OAuthButton } from '@/components/oauth-button'

export default function LoginBeta() {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-x-hidden flex flex-col lg:flex-row">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(3,179,195,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(216,86,191,0.1),transparent_50%)]" />

      <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#03b3c3] transition-colors duration-200 text-sm lg:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="hidden lg:flex lg:w-1/2 min-h-screen relative flex-shrink-0 overflow-hidden">
        <MemoizedHyperspeed />

        <div className="absolute inset-0 flex flex-col justify-center p-16 text-white pointer-events-none">
          <div className="max-w-md pointer-events-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                <HugeiconsIcon icon={UserIcon} size={30} color="#99a1af " />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-['Satoshi']">
                  vocalapp
                </h1>
                <p className="text-white/80 text-lg">
                  AI-Powered Transcription
                </p>
              </div>
            </div>

            <div className="mb-6">
              <BetaBadge variant="large" />
            </div>

            <h2 className="text-3xl font-bold mb-6 font-['Satoshi']">
              Welcome to the Beta
            </h2>

            <p className="text-white/90 text-lg leading-relaxed mb-8">
              Experience passwordless authentication with magic links or Google
              sign-in. Only approved beta testers can access the platform.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Passwordless sign-in</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Magic link via email</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Google OAuth support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Secure & fast access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 py-16 lg:py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 lg:mb-8">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                <HugeiconsIcon icon={UserIcon} size={22} color="#99a1af " />
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium font-['Satoshi']">
                vocalapp
              </h1>
            </div>

            <div className="flex justify-center mb-4">
              <BetaBadge variant="large" />
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 font-['Satoshi']">
              Beta Access Login
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Sign in with your approved email
            </p>
            <p className="text-[#03b3c3] text-xs sm:text-sm mt-2">
              Passwordless authentication for beta testers
            </p>
          </div>

          <div className="bg-transparent backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <OAuthButton />
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">
                  Or continue with magic link
                </span>
              </div>
            </div>

            <MagicLinkForm />

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-xs sm:text-sm">
                Not approved yet?{' '}
                <Link
                  href="/#waitlist"
                  className="text-[#03b3c3] hover:text-[#d856bf] transition-colors duration-200 font-medium"
                >
                  Join the waitlist
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
