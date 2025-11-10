'use client'

import { MailIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'

export default function ForgotPassword() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(3,179,195,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(216,86,191,0.1),transparent_50%)]" />

      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#03b3c3] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>

      <div className="hidden lg:flex lg:w-1/2 h-screen relative flex-shrink-0 overflow-hidden">
        <MemoizedHyperspeed />

        <div className="absolute inset-0 flex flex-col justify-center p-16 text-white pointer-events-none">
          <div className="max-w-md pointer-events-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                <HugeiconsIcon icon={MailIcon} size={30} color="#99a1af " />
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
              Reset Your Password
            </h2>

            <p className="text-white/90 text-lg leading-relaxed mb-8">
              Don&apos;t worry, it happens to the best of us. Enter your email
              address and we&apos;ll send you a link to reset your password and
              get back to transcribing.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Secure password reset</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Link expires in 24 hours</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Quick and easy process</span>
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
                <HugeiconsIcon icon={MailIcon} size={22} color="#99a1af " />
              </div>
              <h1 className="text-3xl font-medium font-['Satoshi']">
                vocalapp
              </h1>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 font-['Satoshi']">
              Forgot Password?
            </h2>
            <p className="text-gray-400">
              Enter your email to receive reset instructions
            </p>
          </div>

          <div className="bg-transparent backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
