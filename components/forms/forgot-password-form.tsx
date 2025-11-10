'use client'

import { MailIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export function ForgotPasswordForm() {
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
          redirectTo: `${window.location.origin}/reset-password`
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
    <>
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

      {!isEmailSent ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <HugeiconsIcon
              icon={MailIcon}
              color="#99a1af"
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              size={22}
            />
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
    </>
  )
}
