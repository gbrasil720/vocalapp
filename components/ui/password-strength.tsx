'use client'

import { Check, X } from 'lucide-react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
  className?: string
  showRequirements?: boolean
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8
  },
  {
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: 'Contains number',
    test: (password) => /[0-9]/.test(password)
  },
  {
    label: 'Contains special character',
    test: (password) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)
  }
]

type StrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

function calculateStrength(password: string): {
  level: StrengthLevel
  score: number
  passedRequirements: boolean[]
} {
  if (!password) {
    return {
      level: 'empty',
      score: 0,
      passedRequirements: requirements.map(() => false)
    }
  }

  const passedRequirements = requirements.map((req) => req.test(password))
  const passedCount = passedRequirements.filter(Boolean).length

  let level: StrengthLevel = 'weak'
  if (passedCount === requirements.length) {
    level = 'strong'
  } else if (passedCount >= 4) {
    level = 'good'
  } else if (passedCount >= 3) {
    level = 'fair'
  }

  return {
    level,
    score: passedCount,
    passedRequirements
  }
}

const strengthConfig: Record<
  StrengthLevel,
  { label: string; color: string; bgColor: string; segments: number }
> = {
  empty: {
    label: '',
    color: 'text-gray-500',
    bgColor: 'bg-white/10',
    segments: 0
  },
  weak: {
    label: 'Weak',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
    segments: 1
  },
  fair: {
    label: 'Fair',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
    segments: 2
  },
  good: {
    label: 'Good',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    segments: 3
  },
  strong: {
    label: 'Strong',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    segments: 4
  }
}

export function PasswordStrength({
  password,
  className,
  showRequirements = true
}: PasswordStrengthProps) {
  const { level, passedRequirements } = useMemo(
    () => calculateStrength(password),
    [password]
  )

  const config = strengthConfig[level]

  if (!password) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Password strength</span>
          <span className={cn('text-xs font-medium', config.color)}>
            {config.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                segment <= config.segments ? config.bgColor : 'bg-white/10'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1.5">
          {requirements.map((req, index) => {
            const passed = passedRequirements[index]
            return (
              <div
                key={req.label}
                className={cn(
                  'flex items-center gap-2 text-xs transition-colors duration-200',
                  passed ? 'text-emerald-400' : 'text-gray-500'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-4 h-4 rounded-full transition-all duration-200',
                    passed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-gray-500'
                  )}
                >
                  {passed ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <X className="w-2.5 h-2.5" />
                  )}
                </div>
                <span>{req.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Compact version without requirements list
export function PasswordStrengthBar({
  password,
  className
}: {
  password: string
  className?: string
}) {
  return (
    <PasswordStrength
      password={password}
      className={className}
      showRequirements={false}
    />
  )
}

