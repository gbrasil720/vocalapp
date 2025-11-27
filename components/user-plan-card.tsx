import { Crown03Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import SpotlightCard from './SpotlightCard'

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
  return (
    <div className="lg:col-span-1">
      <SpotlightCard className="bg-transparent backdrop-blur-xl h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Satoshi'] text-xl font-bold text-primary">
              Your Plan
            </h2>
            <HugeiconsIcon icon={Crown03Icon} size={22} color="#d856bf" />
          </div>
          <div className="flex-1">
            <div
              className={`inline-flex items-center gap-2 ${stats.plan.isActive ? 'bg-gradient-to-r from-[#d856bf]/20 to-[#c247ac]/20 border border-[#d856bf]/30' : 'bg-white/5 border border-white/10'} rounded-full px-4 py-2 mb-4`}
            >
              {stats.plan.isActive ? (
                <HugeiconsIcon icon={Crown03Icon} size={16} color="#d856bf" />
              ) : (
                <HugeiconsIcon
                  icon={SparklesIcon}
                  size={16}
                  className="text-gray-400"
                />
              )}

              <span className="text-sm font-semibold text-primary">
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

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${stats.plan.isActive ? 'bg-green-400' : 'bg-gray-400'}`}
                />
                <span className="text-sm text-gray-300">
                  {stats.plan.totalCredits} credits
                  {stats.plan.isActive ? '/month' : ' free'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${stats.plan.isActive ? 'bg-green-400' : 'bg-gray-400'}`}
                />
                <span className="text-sm text-gray-300">50+ languages</span>
              </div>
              {stats.plan.isActive && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm text-gray-300">
                    Priority support
                  </span>
                </div>
              )}
            </div>

            {stats.plan.isActive && stats.plan.nextBillingDate ? (
              <div className="bg-white/5 rounded-2xl p-4 mb-4">
                <p className="text-xs text-gray-400 mb-2">Next billing</p>
                <p className="text-sm font-semibold text-white">
                  {stats.plan.nextBillingDate}
                </p>
                <p className="text-xs text-gray-500 mt-1">$12.00/month</p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl p-4 mb-4">
                <p className="text-xs text-gray-400 mb-2">Want more credits?</p>
                <p className="text-sm font-semibold text-white">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-gray-500 mt-1">600 credits/month</p>
              </div>
            )}
          </div>
          {stats.plan.isActive ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  const { data, error } = await authClient.dodopayments.customer.portal()
                  
                  if (error) {
                    throw error
                  }

                  if (data?.url) {
                    window.location.href = data.url
                  }
                } catch (error) {
                  console.error('Error opening portal:', error)
                  toast.error('Failed to open billing portal')
                }
              }}
              className="w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all text-center"
            >
              Manage Plan
            </button>
          ) : (
            <Link
              href="/#pricing"
              className="w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all text-center"
            >
              Upgrade Plan
            </Link>
          )}
        </div>
      </SpotlightCard>
    </div>
  )
}
