import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface BetaBadgeProps {
  variant?: 'default' | 'large'
  className?: string
}

export function BetaBadge({ variant = 'default', className = '' }: BetaBadgeProps) {
  if (variant === 'large') {
    return (
      <div
        className={`inline-flex items-center gap-2 bg-[#03b3c3]/20 border border-[#03b3c3]/50 rounded-full px-4 py-2 ${className}`}
      >
        <HugeiconsIcon icon={StarIcon} color="#03b3c3" size={20} />
        <span className="text-sm font-semibold text-[#03b3c3]">Beta Access</span>
      </div>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-[#03b3c3]/20 border border-[#03b3c3]/50 rounded-full px-3 py-1 text-xs font-semibold text-[#03b3c3] ${className}`}
    >
      <HugeiconsIcon icon={StarIcon} color="#03b3c3" size={14} />
      Beta
    </span>
  )
}

