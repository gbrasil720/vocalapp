import { Crown03Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

interface UserStats {
  credits: number
  isBetaUser: boolean
  plan: {
    name: string
    isActive: boolean
    totalCredits: number
    nextBillingDate: string | null
  }
  usage: {
    minutesUsed: number
    transcriptionsCount: number
    languagesUsed: number
  }
}

export function UserPlanCard({ stats }: { stats: UserStats }) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)

  const handleManagePlan = async () => {
    setIsLoadingPortal(true)
    try {
      const { data, error } = await authClient.dodopayments.customer.portal()

      if (error) {
        console.error('Portal error:', error)
        throw new Error(error.message || 'Failed to open billing portal')
      }

      if (data?.url) {
        // Open in new tab to avoid losing current page state
        window.open(data.url, '_blank')
      } else {
        throw new Error('No portal URL received')
      }
    } catch (error) {
      console.error('Error opening portal:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to open billing portal. Please try again.'
      )
    } finally {
      setIsLoadingPortal(false)
    }
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Your Plan</h2>
          <div className="p-2 rounded-lg bg-[#d856bf]/10 border border-[#d856bf]/20">
            <HugeiconsIcon icon={Crown03Icon} size={16} className="text-[#d856bf]" />
          </div>
        </div>

        {/* Plan Badge */}
        <div
          className={`inline-flex items-center gap-2 w-fit ${
            stats.plan.isActive
              ? 'bg-[#d856bf]/10 border border-[#d856bf]/30 text-[#d856bf]'
              : 'bg-zinc-800 border border-zinc-700 text-gray-400'
          } rounded-lg px-3 py-1.5 mb-5`}
        >
          {stats.plan.isActive ? (
            <HugeiconsIcon icon={Crown03Icon} size={14} />
          ) : (
            <HugeiconsIcon icon={SparklesIcon} size={14} />
          )}
          <span className="text-xs font-medium uppercase tracking-wider">
            {stats.plan.name
              .replace('-plan', '')
              .split(' ')
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(' ')}
          </span>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-5 flex-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                stats.plan.isActive ? 'bg-green-400' : 'bg-gray-500'
              }`}
            />
            <span className="text-sm text-gray-400">
              {stats.plan.totalCredits} credits
              {stats.plan.isActive ? '/month' : ' free'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                stats.plan.isActive ? 'bg-green-400' : 'bg-gray-500'
              }`}
            />
            <span className="text-sm text-gray-400">50+ languages</span>
          </div>
          {stats.plan.isActive && (
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-sm text-gray-400">Priority support</span>
            </div>
          )}
        </div>

        {/* Next Billing / Upgrade CTA */}
        {stats.plan.isActive && stats.plan.nextBillingDate ? (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3.5 mb-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Next billing
            </p>
            <p className="text-sm font-medium text-white">
              {stats.plan.nextBillingDate}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">$12.00/month</p>
          </div>
        ) : (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3.5 mb-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Want more credits?
            </p>
            <p className="text-sm font-medium text-white">Upgrade to Pro</p>
            <p className="text-xs text-gray-500 mt-0.5">600 credits/month</p>
          </div>
        )}

        {/* Action Button */}
        {stats.plan.isActive ? (
          <button
            type="button"
            onClick={handleManagePlan}
            disabled={isLoadingPortal}
            className="w-full py-2.5 px-4 bg-zinc-800 border border-zinc-700 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 hover:border-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoadingPortal ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Opening Portal...
              </>
            ) : (
              'Manage Plan'
            )}
          </button>
        ) : (
          <Link
            href="/#pricing"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all text-center"
          >
            Upgrade Plan
          </Link>
        )}
      </div>
    </div>
  )
}

