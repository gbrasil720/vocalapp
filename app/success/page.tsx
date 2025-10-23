'use client'

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const checkoutId =
    searchParams.get('checkout_id') ||
    searchParams.get('subscription_id') ||
    searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a0a1a] to-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d856bf] to-[#03b3c3] rounded-full blur-2xl opacity-50 animate-pulse" />
            <CheckCircle2 className="w-24 h-24 text-[#03b3c3] relative z-10" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-300">
              Your credits are ready to use
            </p>
          </div>

          {checkoutId && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-[#d856bf]" />
                <h2 className="text-lg font-semibold text-white">
                  Order Details
                </h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="text-gray-300 font-mono text-xs">
                    {checkoutId.substring(0, 20)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-semibold">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-[#03b3c3]/20 rounded-full">
                  <Zap className="w-4 h-4 text-[#03b3c3]" />
                </div>
                <div>
                  <p className="text-gray-300 font-medium">
                    Credits Added Instantly
                  </p>
                  <p className="text-gray-500 text-sm">
                    Your credits have been added to your account and are ready
                    to use
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-[#d856bf]/20 rounded-full">
                  <Download className="w-4 h-4 text-[#d856bf]" />
                </div>
                <div>
                  <p className="text-gray-300 font-medium">Receipt Sent</p>
                  <p className="text-gray-500 text-sm">
                    Check your email for a detailed receipt and invoice
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-[#c247ac]/20 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-[#c247ac]" />
                </div>
                <div>
                  <p className="text-gray-300 font-medium">
                    Start Transcribing
                  </p>
                  <p className="text-gray-500 text-sm">
                    Head to your dashboard and start using your credits
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#d856bf]/90 hover:to-[#c247ac]/90 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 border border-white/20 text-white font-semibold py-3 px-6 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Need help?{' '}
            <Link href="/support" className="text-[#03b3c3] hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a0a1a] to-[#0a0a0a] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
