import { HugeiconsIcon } from '@hugeicons/react'
import type { LucideIcon } from 'lucide-react'
import { type ElementType, isValidElement, memo, type ReactNode } from 'react'
import SpotlightCard from '@/components/SpotlightCard'

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: ElementType | ReactNode | any
  iconColor?: string
  iconBgColor: string
  spotlightColor: `rgba(${number}, ${number}, ${number}, ${number})`
  showProgress?: boolean
  progressPercent?: number
  progressColors?: string
  footer?: {
    icon: LucideIcon
    text: string
  }
}

export const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  iconBgColor,
  spotlightColor,
  showProgress = false,
  progressPercent = 0,
  progressColors = 'from-[#03b3c3] to-[#d856bf]',
  footer
}: StatCardProps) {
  const renderIcon = () => {
    if (isValidElement(icon)) {
      return icon
    }
    const IconComponent = icon as ElementType<{ className?: string }>
    return <IconComponent className={`w-5 h-5 ${iconColor ?? ''}`} />
  }

  return (
    <SpotlightCard
      className="bg-transparent backdrop-blur-xl"
      spotlightColor={spotlightColor}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-xl ${iconBgColor}`}>
          {/* <HugeiconsIcon icon={icon} size={22} color={iconColor} /> */}
          {renderIcon()}
        </div>
      </div>
      {showProgress && (
        <div className="mt-4 w-full bg-white/5 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${progressColors} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      )}
      {footer && (
        <div className="mt-4 flex items-center gap-1 text-gray-400">
          <footer.icon className="w-3 h-3" />
          <span className="text-xs">{footer.text}</span>
        </div>
      )}
    </SpotlightCard>
  )
})
