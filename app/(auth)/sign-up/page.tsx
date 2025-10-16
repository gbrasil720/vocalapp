'use client'

import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useEffect, useMemo, useState } from 'react'
import Hyperspeed from '@/components/Hyperspeed'
import { Button } from '@/components/ui/button'

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

interface PasswordRequirement {
  text: string
  met: boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { text: 'At least 8 characters', met: false },
  { text: 'Contains uppercase letter', met: false },
  { text: 'Contains lowercase letter', met: false },
  { text: 'Contains number', met: false },
  { text: 'Contains special character', met: false }
]

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [requirements, setRequirements] = useState(passwordRequirements)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Password strength calculation
  useEffect(() => {
    const newRequirements = passwordRequirements.map((req) => {
      switch (req.text) {
        case 'At least 8 characters':
          return { ...req, met: formData.password.length >= 8 }
        case 'Contains uppercase letter':
          return { ...req, met: /[A-Z]/.test(formData.password) }
        case 'Contains lowercase letter':
          return { ...req, met: /[a-z]/.test(formData.password) }
        case 'Contains number':
          return { ...req, met: /\d/.test(formData.password) }
        case 'Contains special character':
          return {
            ...req,
            met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
          }
        default:
          return req
      }
    })
    setRequirements(newRequirements)
  }, [formData.password])

  const getPasswordStrength = () => {
    const metCount = requirements.filter((req) => req.met).length
    if (metCount < 2) return { level: 'weak', color: '#ef4444', width: '20%' }
    if (metCount < 4) return { level: 'medium', color: '#f59e0b', width: '60%' }
    return { level: 'strong', color: '#10b981', width: '100%' }
  }

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (requirements.some((req) => !req.met)) {
      newErrors.password = 'Password does not meet requirements'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('error', 'Please fix the errors above')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      showToast('success', 'Account created successfully! Welcome to vocal.app')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch {
      showToast('error', 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const passwordStrength = getPasswordStrength()

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
            {toast.type === 'success' && <Check className="w-5 h-5" />}
            {toast.type === 'error' && <X className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#03b3c3] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
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
                  <User className="w-8 h-8" />
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
                Transform Your Audio Into Text
              </h2>

              <p className="text-white/90 text-lg leading-relaxed mb-8">
                Experience the future of speech-to-text technology. Our advanced
                AI delivers 99.9% accuracy with real-time processing for over 50
                languages.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">
                    Lightning-fast processing
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">
                    Enterprise-grade security
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">Seamless integrations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Mobile/Tablet Brand */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#d856bf] to-[#03b3c3] rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent font-['Satoshi']">
                  vocal.app
                </h1>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 font-['Satoshi']">
                Create Your Account
              </h2>
              <p className="text-gray-400">
                Join thousands of creators using AI-powered transcription
              </p>
            </div>

            {/* Form */}
            <div className="bg-transparent backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange('firstName', e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                          errors.firstName
                            ? 'border-red-500/50 focus:ring-red-500/30'
                            : 'border-white/20 focus:ring-[#03b3c3]/30 focus:border-[#03b3c3]/50'
                        }`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange('lastName', e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                          errors.lastName
                            ? 'border-red-500/50 focus:ring-red-500/30'
                            : 'border-white/20 focus:ring-[#03b3c3]/30 focus:border-[#03b3c3]/50'
                        }`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.email
                          ? 'border-red-500/50 focus:ring-red-500/30'
                          : 'border-white/20 focus:ring-[#03b3c3]/30 focus:border-[#03b3c3]/50'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange('password', e.target.value)
                      }
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.password
                          ? 'border-red-500/50 focus:ring-red-500/30'
                          : 'border-white/20 focus:ring-[#03b3c3]/30 focus:border-[#03b3c3]/50'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-300 rounded-full"
                            style={{
                              width: passwordStrength.width,
                              backgroundColor: passwordStrength.color
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 capitalize">
                          {passwordStrength.level}
                        </span>
                      </div>

                      {/* Password Requirements */}
                      <div className="space-y-1">
                        {requirements.map((req) => (
                          <div
                            key={req.text}
                            className="flex items-center gap-2 text-xs"
                          >
                            {req.met ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <X className="w-3 h-3 text-red-400" />
                            )}
                            <span
                              className={
                                req.met ? 'text-green-400' : 'text-gray-400'
                              }
                            >
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.confirmPassword
                          ? 'border-red-500/50 focus:ring-red-500/30'
                          : 'border-white/20 focus:ring-[#03b3c3]/30 focus:border-[#03b3c3]/50'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#c247ac] hover:to-[#d856bf] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              {/* Divider */}
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

              {/* Google Sign Up Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  showToast('info', 'Google authentication coming soon!')
                }}
                className="w-full py-3 bg-white/5 border-white/20 hover:bg-white/10 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  viewBox="0 0 24 24"
                  aria-label="Google logo"
                >
                  <title>Google logo</title>
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              {/* Sign In Link */}
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

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-[#03b3c3] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-[#03b3c3] hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
