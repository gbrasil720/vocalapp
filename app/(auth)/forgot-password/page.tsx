'use client'

import { ArrowLeft, CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { memo, useMemo, useState } from 'react'
import Hyperspeed from '@/components/Hyperspeed'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

// Memoized Hyperspeed component to prevent re-renders
const MemoizedHyperspeed = memo(() => {
  const hyperspeedOptions = useMemo(
    () => ({
      onSpeedUp: () => {},
      onSlowDown: () => {},
      distortion: 'turbulentDistortion',
      length: 400,
      roadWidth: 10,
      islandWidth: 2,
      lanesPerRoad: 4,
      fov: 90,
      fovSpeedUp: 150,
      speedUp: 2,
      carLightsFade: 0.4,
      totalSideLightSticks: 20,
      lightPairsPerRoadWay: 40,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5] as [number, number],
      lightStickHeight: [1.3, 1.7] as [number, number],
      movingAwaySpeed: [60, 80] as [number, number],
      movingCloserSpeed: [-120, -160] as [number, number],
      carLightsLength: [400 * 0.03, 400 * 0.2] as [number, number],
      carLightsRadius: [0.05, 0.14] as [number, number],
      carWidthPercentage: [0.3, 0.5] as [number, number],
      carShiftX: [-0.8, 0.8] as [number, number],
      carFloorSeparation: [0, 5] as [number, number],
      colors: {
        roadColor: 0x080808,
        islandColor: 0x0a0a0a,
        background: 0x000000,
        shoulderLines: 0xffffff,
        brokenLines: 0xffffff,
        leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
        rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
        sticks: 0x03b3c3
      }
    }),
    []
  )

  return <Hyperspeed effectOptions={hyperspeedOptions} />
})

MemoizedHyperspeed.displayName = 'MemoizedHyperspeed'

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const validateForm = (email: string) => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    const newErrors = validateForm(email)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showToast('error', 'Please enter a valid email address')
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await authClient.forgetPassword(
        {
          email,
          redirectURL: `${window.location.origin}/reset-password`
        },
        {
          onSuccess: () => {
            setSentEmail(email)
            setIsEmailSent(true)
            showToast('success', 'Reset link sent to your email!')
          },
          onError: (ctx) => {
            const errorMessage =
              ctx.error.message ||
              'Failed to send reset link. Please try again.'
            showToast('error', errorMessage)
            setErrors({ submit: errorMessage })
          }
        }
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred'
      showToast('error', errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(3,179,195,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(216,86,191,0.1),transparent_50%)]" />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-xl border transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500/20 border-green-500/30 text-green-400'
              : toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#03b3c3] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Side - Hyperspeed Background */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          {/* Hyperspeed Effect */}
          <div className="absolute inset-0">
            <MemoizedHyperspeed />
          </div>

          {/* Content Overlay */}
          <div className="relative z-40 flex flex-col justify-center p-16 text-white pointer-events-none">
            <div className="max-w-md pointer-events-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold font-['Satoshi']">
                    vocal.app
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
                address and we&apos;ll send you a link to reset your password
                and get back to transcribing.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">Secure password reset</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">
                    Link expires in 24 hours
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">Quick and easy process</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Mobile/Tablet Brand */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#d856bf] to-[#03b3c3] rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent font-['Satoshi']">
                  vocal.app
                </h1>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 font-['Satoshi']">
                Forgot Password?
              </h2>
              <p className="text-gray-400">
                {isEmailSent
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive reset instructions'}
              </p>
            </div>

            {/* Form */}
            <div className="bg-transparent backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              {!isEmailSent ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.email
                          ? 'border-red-500/50 focus:ring-red-500/30'
                          : 'border-white/20 focus:ring-[#03b3c3]/30 focus:border-[#03b3c3]/50'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                  {errors.submit && (
                    <p className="text-red-500 text-sm">{errors.submit}</p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#c247ac] hover:to-[#d856bf] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Reset Link...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-gray-400">
                      We&apos;ve sent a password reset link to{' '}
                      <span className="text-[#03b3c3]">{sentEmail}</span>
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        setSentEmail('')
                        setIsEmailSent(false)
                      }}
                      className="w-full py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#c247ac] hover:to-[#d856bf] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Send Another Email
                    </Button>
                    <Link
                      href="/sign-in"
                      className="block w-full py-3 text-center text-[#03b3c3] hover:text-[#d856bf] transition-colors duration-200 font-medium"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              )}

              {/* Sign In Link */}
              {!isEmailSent && (
                <div className="mt-6 text-center">
                  <p className="text-gray-400">
                    Remember your password?{' '}
                    <Link
                      href="/sign-in"
                      className="text-[#03b3c3] hover:text-[#d856bf] transition-colors duration-200 font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
