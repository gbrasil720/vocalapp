'use client'

import { UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { SignUpForm } from '@/components/forms/sign-up-form'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import { OAuthButton } from '@/components/oauth-button'

export default function SignUp() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(3,179,195,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(216,86,191,0.1),transparent_50%)]" />

      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#03b3c3] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="hidden lg:flex lg:w-1/2 h-screen relative flex-shrink-0 overflow-hidden">
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

            <h2 className="text-3xl font-bold mb-6 font-['Satoshi']">
              Transform Your Audio Into Text
            </h2>

            <p className="text-white/90 text-lg leading-relaxed mb-8">
              Experience the future of speech-to-text technology. Our advanced
              AI delivers 99.9% accuracy with real-time processing for over 50
              languages.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Lightning-fast processing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Seamless integrations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-screen flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                <HugeiconsIcon icon={UserIcon} size={22} color="#99a1af " />
              </div>
              <h1 className="text-3xl font-medium font-['Satoshi']">
                vocalapp
              </h1>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 font-['Satoshi']">
              Create Your Account
            </h2>
            <p className="text-gray-400">
              Join thousands of creators using AI-powered transcription
            </p>
          </div>

          <div className="bg-transparent backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            {process.env.NEXT_PUBLIC_BETA_MODE === 'true' && (
              <div className="mb-6 p-4 bg-[#03b3c3]/10 border border-[#03b3c3]/30 rounded-lg">
                <p className="text-sm text-center text-white">
                  🚀 <span className="font-semibold">Beta Program Active!</span>{' '}
                  Sign up is currently closed.{' '}
                  <Link
                    href="/login-beta"
                    className="text-[#03b3c3] hover:text-[#d856bf] underline transition-colors"
                  >
                    Login with approved email
                  </Link>{' '}
                  or{' '}
                  <Link
                    href="/#waitlist"
                    className="text-[#03b3c3] hover:text-[#d856bf] underline transition-colors"
                  >
                    join waitlist
                  </Link>
                </p>
              </div>
            )}

            <SignUpForm />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <OAuthButton />

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/sign-in"
                  className="text-[#03b3c3] hover:text-[#d856bf] transition-colors duration-200 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-[#03b3c3] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#03b3c3] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
