'use client'

import {
  Calendar01Icon,
  GiftIcon,
  InformationCircleIcon,
  Rocket02Icon,
  SquareLock01Icon,
  StarIcon,
  Tick02Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { BetaBadge } from '@/components/beta-badge'
import ElectricBorder from '@/components/ElectricBorder'
import { authClient } from '@/lib/auth-client'
import SpotlightCard from './SpotlightCard'

export function BetaPaymentNotice() {
  const { data: session } = authClient.useSession()
  const [isBetaUser, setIsBetaUser] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkBetaStatus = async () => {
      try {
        // First check session for beta status
        const sessionBetaUser =
          session?.user && 'isBetaUser' in session.user
            ? Boolean((session.user as { isBetaUser?: unknown }).isBetaUser)
            : false

        // Also fetch from API to get the most up-to-date status
        const response = await fetch('/api/user/stats', {
          cache: 'no-store'
        })
        if (response.ok) {
          const data = await response.json()
          setIsBetaUser(data.isBetaUser ?? sessionBetaUser)
        } else {
          setIsBetaUser(sessionBetaUser)
        }
      } catch (error) {
        console.error('Error checking beta status:', error)
        // Fallback to session check
        const sessionBetaUser =
          session?.user && 'isBetaUser' in session.user
            ? Boolean((session.user as { isBetaUser?: unknown }).isBetaUser)
            : false
        setIsBetaUser(sessionBetaUser)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      checkBetaStatus()
    } else {
      setLoading(false)
    }
  }, [session])

  const betaStatus =
    loading || isBetaUser === null
      ? 'Loading...'
      : isBetaUser
        ? 'Active'
        : 'Inactive'
  const betaStatusColor =
    loading || isBetaUser === null
      ? 'text-gray-400'
      : isBetaUser
        ? 'text-[#03b3c3]'
        : 'text-gray-400'
  const betaStatusMessage =
    loading || isBetaUser === null
      ? 'Checking your beta status...'
      : isBetaUser
        ? "You're part of our exclusive beta testing program. Thank you for helping us build something amazing!"
        : 'Beta access is required to use this platform. Please contact support if you believe this is an error.'

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Beta Program Status</h2>
      <div className="hidden md:block">
        <ElectricBorder
          color="#03b3c3"
          speed={1.5}
          chaos={0.6}
          thickness={2}
          className="rounded-3xl"
        >
          <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#03b3c3]/20">
                  <HugeiconsIcon
                    icon={SquareLock01Icon}
                    size={28}
                    color="#03b3c3"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold text-white">
                      Closed Beta Program
                    </h3>
                    {isBetaUser && <BetaBadge variant="default" />}
                  </div>
                  <p className="text-sm text-[#03b3c3] mt-1">
                    Payments Temporarily Disabled
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed text-lg">
                  We're currently in closed beta testing. Payment processing is
                  not available at this time. All beta users receive free
                  credits to test the platform and help us improve.
                </p>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <HugeiconsIcon
                      icon={InformationCircleIcon}
                      size={20}
                      className="text-[#03b3c3] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">
                        What This Means
                      </p>
                      <p className="text-sm text-gray-400">
                        Subscription management and credit purchases will be
                        enabled after the beta period ends. You can still view
                        your credits and transaction history below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {isBetaUser && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <HugeiconsIcon icon={StarIcon} size={20} color="#03b3c3" />
                    Beta Benefits
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={18}
                        className="text-green-400"
                      />
                      <span className="text-gray-300">
                        Free credits to test all features
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={18}
                        className="text-green-400"
                      />
                      <span className="text-gray-300">
                        Early access to new features
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={18}
                        className="text-green-400"
                      />
                      <span className="text-gray-300">
                        Direct feedback channel with our team
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={18}
                        className="text-green-400"
                      />
                      <span className="text-gray-300">
                        Shape the future of the platform
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Beta Status</p>
                    {loading ? (
                      <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
                    ) : (
                      <p className={`text-2xl font-bold ${betaStatusColor}`}>
                        {betaStatus}
                      </p>
                    )}
                  </div>
                  <HugeiconsIcon
                    icon={Rocket02Icon}
                    size={32}
                    className={isBetaUser ? 'text-[#03b3c3]' : 'text-gray-500'}
                  />
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400">{betaStatusMessage}</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">What's Coming</p>
                    <p className="text-lg font-semibold text-white">
                      Public Launch
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    size={32}
                    className="text-[#c247ac]"
                  />
                </div>
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <p className="text-sm text-gray-300">
                    Once we exit beta, you'll be able to:
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
                    <li>Purchase credit packs</li>
                    <li>Subscribe to Pro plans</li>
                    <li>Manage subscriptions</li>
                    <li>View detailed billing history</li>
                  </ul>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Beta Perks</p>
                    <p className="text-lg font-semibold text-white">
                      Free Access
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={GiftIcon}
                    size={32}
                    className="text-[#d856bf]"
                  />
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400">
                    Enjoy unlimited testing during the beta period. All features
                    are available to you at no cost while we refine the
                    platform.
                  </p>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
        </ElectricBorder>
      </div>
      <div className="md:hidden">
        <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#03b3c3]/20">
                  <HugeiconsIcon
                    icon={SquareLock01Icon}
                    size={28}
                    color="#03b3c3"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold text-white">
                      Closed Beta Program
                    </h3>
                    {isBetaUser && <BetaBadge variant="default" />}
                  </div>
                  <p className="text-sm text-[#03b3c3] mt-1">
                    Payments Temporarily Disabled
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed text-lg">
                  We're currently in closed beta testing. Payment processing is
                  not available at this time. All beta users receive free
                  credits to test the platform and help us improve.
                </p>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <HugeiconsIcon
                      icon={InformationCircleIcon}
                      size={20}
                      className="text-[#03b3c3] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">
                        What This Means
                      </p>
                      <p className="text-sm text-gray-400">
                        Subscription management and credit purchases will be
                        enabled after the beta period ends. You can still view
                        your credits and transaction history below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {isBetaUser && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <HugeiconsIcon icon={StarIcon} size={20} color="#03b3c3" />
                    Beta Benefits
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={18}
                        className="text-green-400"
                      />
                      <span className="text-gray-300">
                        Free credits to test all features
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={18}
                        className="text-green-400"
                      />
                      <span className="text-gray-300">
                        Early access to new features
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={18}
                        className="text-green-400"
                      />
                      <span className="text-gray-300">
                        Direct feedback channel with our team
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={18}
                        className="text-green-400"
                      />
                      <span className="text-gray-300">
                        Shape the future of the platform
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Beta Status</p>
                    {loading ? (
                      <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
                    ) : (
                      <p className={`text-2xl font-bold ${betaStatusColor}`}>
                        {betaStatus}
                      </p>
                    )}
                  </div>
                  <HugeiconsIcon
                    icon={Rocket02Icon}
                    size={32}
                    className={isBetaUser ? 'text-[#03b3c3]' : 'text-gray-500'}
                  />
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400">{betaStatusMessage}</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">What's Coming</p>
                    <p className="text-lg font-semibold text-white">
                      Public Launch
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    size={32}
                    className="text-[#c247ac]"
                  />
                </div>
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <p className="text-sm text-gray-300">
                    Once we exit beta, you'll be able to:
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
                    <li>Purchase credit packs</li>
                    <li>Subscribe to Pro plans</li>
                    <li>Manage subscriptions</li>
                    <li>View detailed billing history</li>
                  </ul>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Beta Perks</p>
                    <p className="text-lg font-semibold text-white">
                      Free Access
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={GiftIcon}
                    size={32}
                    className="text-[#d856bf]"
                  />
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400">
                    Enjoy unlimited testing during the beta period. All features
                    are available to you at no cost while we refine the
                    platform.
                  </p>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
