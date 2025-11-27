'use client'

import {
  ArrowLeft02Icon,
  Calendar02Icon,
  Coins01Icon,
  Crown03Icon,
  Dollar01Icon,
  RefreshIcon,
  Tick02Icon,
  ZapIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BetaPaymentNotice } from '@/components/beta-payment-notice'
import ElectricBorder from '@/components/ElectricBorder'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import SpotlightCard from '@/components/SpotlightCard'
import { authClient } from '@/lib/auth-client'
import type { CreditPackType } from '@/lib/billing/credit-products'
import { getCreditPack } from '@/lib/billing/credit-products'

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  stripePaymentIntentId: string | null
  metadata: unknown
  createdAt: Date
}

interface SubscriptionData {
  hasSubscription: boolean
  subscription: {
    id: string
    plan: string
    status: string
    stripeSubscriptionId: string | null
    periodStart: Date | null
    periodEnd: Date | null
    cancelAtPeriodEnd: boolean | null
    nextBillingDate: string | null
  } | null
}

// Set to false when exiting beta to show current plan section
const IS_BETA_MODE = true

export default function BillingPage() {
  const [credits, setCredits] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const timestamp = Date.now()

      const creditsResponse = await fetch(
        `/api/credits/balance?t=${timestamp}`,
        {
          cache: 'no-store'
        }
      )
      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json()
        setCredits(creditsData.credits)
      }

      const transactionsResponse = await fetch(
        `/api/credits/transactions?t=${timestamp}`,
        {
          cache: 'no-store'
        }
      )
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions)
      }

      const subscriptionResponse = await fetch(
        `/api/user/subscription?t=${timestamp}`,
        {
          cache: 'no-store'
        }
      )
      if (subscriptionResponse.ok) {
        const subData = await subscriptionResponse.json()
        setSubscriptionData(subData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreditPurchase = async (packType: CreditPackType) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to purchase credits')
      return
    }

    try {
      const toastId = toast.loading('Opening checkout...')
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_credit_pack', packType)
      }

      const slugMap: Record<CreditPackType, string> = {
        basic: 'echo-credits',
        popular: 'reverb-credits',
        premium: 'amplify-credits'
      }

      const pack = getCreditPack(packType)

      const { data, error } = await authClient.dodopayments.checkout({
        slug: slugMap[packType],
        billing: {
            city: 'New York',
            country: 'US',
            state: 'NY',
            street: '123 Main St',
            zipcode: '10001'
        },
        customer: {},
        metadata: {
            purchaseType: 'credits',
            userId: session.user.id,
            credits: pack.credits.toString(),
            packType
        }
      })

      if (error) {
        throw error
      }

      if (data?.url) {
        window.location.href = data.url
      }
      
      toast.dismiss(toastId)
    } catch (error) {
      console.error('Error purchasing credits:', error)

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to start checkout'

      if (
        errorMessage.includes('not configured') ||
        errorMessage.includes('PLACEHOLDER')
      ) {
        toast.error(
          'Credit packs are not configured yet. Please contact support.'
        )
      } else {
        toast.error(`Failed to start checkout: ${errorMessage}`)
      }
    }
  }

  const handleUpgradeToPro = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to upgrade')
      return
    }

    try {
      const toastId = toast.loading('Opening checkout...')
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_subscription', 'true')
      }

      const { data, error } = await authClient.dodopayments.checkout({
        slug: 'frequency-plan',
        billing: {
            city: 'New York',
            country: 'US',
            state: 'NY',
            street: '123 Main St',
            zipcode: '10001'
        },
        customer: {},
        metadata: {
            purchaseType: 'subscription',
            userId: session.user.id
        }
      })

      if (error) {
        throw error
      }

      if (data?.url) {
        window.location.href = data.url
      }

      toast.dismiss(toastId)
    } catch (error) {
      console.error('Error upgrading to pro:', error)
      toast.error('Failed to start checkout. Please try again.')
    }
  }

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await authClient.dodopayments.customer.portal()

      if (error) {
        throw error
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
      toast.error('Failed to open billing portal. Please try again.')
    }
  }

  const { data: session } = authClient.useSession()
  const isAdmin = session?.user?.role === 'admin'

  const hasSubscription = subscriptionData?.hasSubscription ?? false
  const planCredits = hasSubscription ? 600 : 30
  const creditsUsed = Math.max(0, planCredits - Math.min(credits, planCredits))

  const showContent = !IS_BETA_MODE || isAdmin

  return (
    <>
      <div className="hidden md:block fixed inset-0 z-0 opacity-40">
        <MemoizedHyperspeed />
      </div>

      <div className="relative min-h-screen z-10">
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} size={22} />
              </Link>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">Billing</h1>
                    <button
                      type="button"
                      onClick={() => {
                        setLoading(true)
                        fetchData()
                        toast.success('Refreshing data...')
                      }}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      title="Refresh data"
                    >
                      <HugeiconsIcon
                        icon={RefreshIcon}
                        size={18}
                        className="text-gray-400"
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Manage your subscription and billing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BetaPaymentNotice />
          {showContent &&
            (loading ? (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">
                  Current Plan
                </h2>
                <div className="hidden md:block">
                  <ElectricBorder
                    color="#d856bf"
                    speed={1.5}
                    chaos={0.6}
                    thickness={2}
                    className="rounded-3xl"
                  >
                    <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-white/5 animate-pulse">
                              <div className="w-6 h-6 bg-white/10 rounded" />
                            </div>
                            <div className="space-y-2 flex-1">
                              <div className="h-8 bg-white/10 rounded-lg w-32 animate-pulse" />
                              <div className="h-4 bg-white/5 rounded w-20 animate-pulse" />
                            </div>
                          </div>

                          <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse" />
                                <div className="h-4 bg-white/10 rounded flex-1 animate-pulse" />
                              </div>
                            ))}
                          </div>

                          <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                            <div className="h-3 bg-white/10 rounded w-24 animate-pulse" />
                            <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                          </div>
                        </div>

                        <div className="space-y-6">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="bg-white/5 border border-white/10 rounded-2xl p-6"
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-2 flex-1">
                                  <div className="h-3 bg-white/10 rounded w-20 animate-pulse" />
                                  <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                              </div>
                              {i === 3 && (
                                <div className="mt-4 w-full bg-white/5 rounded-full h-2">
                                  <div className="h-2 bg-gradient-to-r from-[#d856bf]/30 to-[#03b3c3]/30 rounded-full w-2/3 animate-pulse" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#d856bf] animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-[#c247ac] animate-bounce animation-delay-200" />
                          <div className="w-2 h-2 rounded-full bg-[#03b3c3] animate-bounce animation-delay-400" />
                        </div>
                        <span className="text-sm text-gray-400 ml-2">
                          Loading subscription...
                        </span>
                      </div>
                    </div>
                  </ElectricBorder>
                </div>
                <div className="md:hidden">
                  <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-white/5 animate-pulse">
                            <div className="w-6 h-6 bg-white/10 rounded" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="h-8 bg-white/10 rounded-lg w-32 animate-pulse" />
                            <div className="h-4 bg-white/5 rounded w-20 animate-pulse" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse" />
                              <div className="h-4 bg-white/10 rounded flex-1 animate-pulse" />
                            </div>
                          ))}
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                          <div className="h-3 bg-white/10 rounded w-24 animate-pulse" />
                          <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                        </div>
                      </div>

                      <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="h-3 bg-white/10 rounded w-20 animate-pulse" />
                                <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                            </div>
                            {i === 3 && (
                              <div className="mt-4 w-full bg-white/5 rounded-full h-2">
                                <div className="h-2 bg-gradient-to-r from-[#d856bf]/30 to-[#03b3c3]/30 rounded-full w-2/3 animate-pulse" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#d856bf] animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-[#c247ac] animate-bounce animation-delay-200" />
                        <div className="w-2 h-2 rounded-full bg-[#03b3c3] animate-bounce animation-delay-400" />
                      </div>
                      <span className="text-sm text-gray-400 ml-2">
                        Loading subscription...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : hasSubscription && subscriptionData?.subscription ? (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">
                  Current Plan
                </h2>
                <div className="hidden md:block">
                  <ElectricBorder
                    color="#d856bf"
                    speed={1.5}
                    chaos={0.6}
                    thickness={2}
                    className="rounded-3xl"
                  >
                    <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-[#d856bf]/20">
                              <HugeiconsIcon
                                icon={Crown03Icon}
                                size={22}
                                color="#d856bf"
                              />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">
                                {subscriptionData.subscription.plan
                                  .split(' ')
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1).toLowerCase()
                                  )
                                  .join(' ')}
                              </h3>
                              <p className="text-sm text-green-400">
                                {subscriptionData.subscription.status ===
                                'active'
                                  ? 'Active'
                                  : 'Inactive'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3">
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={18}
                                className="text-green-400"
                              />
                              <span className="text-gray-300">
                                600 credits per month
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={18}
                                className="text-green-400"
                              />
                              <span className="text-gray-300">
                                50+ languages
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={18}
                                className="text-green-400"
                              />
                              <span className="text-gray-300">
                                Priority support
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={18}
                                className="text-green-400"
                              />
                              <span className="text-gray-300">
                                Multiple files processing
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleManageSubscription}
                            className="w-full py-3 px-6 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white font-semibold hover:scale-105 transition-transform"
                          >
                            Manage Subscription
                          </button>

                          <p className="text-xs text-gray-400 text-center mt-3">
                            Update payment method, view invoices, or cancel
                            subscription
                          </p>
                        </div>

                        <div className="space-y-6">
                          <SpotlightCard className="bg-transparent backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  Amount
                                </p>
                                <p className="text-2xl font-bold text-white">
                                  $10.00
                                  <span className="text-sm text-gray-400 ml-2">
                                    /month
                                  </span>
                                </p>
                              </div>
                              <HugeiconsIcon
                                icon={Dollar01Icon}
                                size={32}
                                className="text-[#03b3c3]"
                              />
                            </div>
                          </SpotlightCard>

                          {subscriptionData.subscription.nextBillingDate && (
                            <SpotlightCard className="bg-transparent backdrop-blur-xl">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-400 mb-1">
                                    Next Billing
                                  </p>
                                  <p className="text-lg font-semibold text-white">
                                    {
                                      subscriptionData.subscription
                                        .nextBillingDate
                                    }
                                  </p>
                                </div>
                                <HugeiconsIcon
                                  icon={Calendar02Icon}
                                  size={32}
                                  className="text-[#c247ac]"
                                />
                              </div>
                            </SpotlightCard>
                          )}

                          <SpotlightCard className="bg-transparent backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  Current Balance
                                </p>
                                <p className="text-3xl font-bold text-white">
                                  {credits}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  credits available
                                </p>
                              </div>
                              <HugeiconsIcon
                                icon={ZapIcon}
                                size={32}
                                className="text-[#d856bf]"
                              />
                            </div>
                            <div className="pt-4 border-t border-white/10 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">
                                  Monthly allowance:
                                </span>
                                <span className="text-white font-semibold">
                                  {planCredits} credits
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">
                                  Used this period:
                                </span>
                                <span className="text-white font-semibold">
                                  {creditsUsed} credits
                                </span>
                              </div>
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
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-2xl bg-[#d856bf]/20">
                            <HugeiconsIcon
                              icon={Crown03Icon}
                              size={22}
                              color="#d856bf"
                            />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {subscriptionData.subscription.plan
                                .split(' ')
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(' ')}
                            </h3>
                            <p className="text-sm text-green-400">
                              {subscriptionData.subscription.status === 'active'
                                ? 'Active'
                                : 'Inactive'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3">
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              size={18}
                              className="text-green-400"
                            />
                            <span className="text-gray-300">
                              600 credits per month
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              size={18}
                              className="text-green-400"
                            />
                            <span className="text-gray-300">50+ languages</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              size={18}
                              className="text-green-400"
                            />
                            <span className="text-gray-300">
                              Priority support
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              size={18}
                              className="text-green-400"
                            />
                            <span className="text-gray-300">
                              Multiple files processing
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleManageSubscription}
                          className="w-full py-3 px-6 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white font-semibold hover:scale-105 transition-transform"
                        >
                          Manage Subscription
                        </button>

                        <p className="text-xs text-gray-400 text-center mt-3">
                          Update payment method, view invoices, or cancel
                          subscription
                        </p>
                      </div>

                      <div className="space-y-6">
                        <SpotlightCard className="bg-transparent backdrop-blur-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">
                                Amount
                              </p>
                              <p className="text-2xl font-bold text-white">
                                $10.00
                                <span className="text-sm text-gray-400 ml-2">
                                  /month
                                </span>
                              </p>
                            </div>
                            <HugeiconsIcon
                              icon={Dollar01Icon}
                              size={32}
                              className="text-[#03b3c3]"
                            />
                          </div>
                        </SpotlightCard>

                        {subscriptionData.subscription.nextBillingDate && (
                          <SpotlightCard className="bg-transparent backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  Next Billing
                                </p>
                                <p className="text-lg font-semibold text-white">
                                  {
                                    subscriptionData.subscription
                                      .nextBillingDate
                                  }
                                </p>
                              </div>
                              <HugeiconsIcon
                                icon={Calendar02Icon}
                                size={32}
                                className="text-[#c247ac]"
                              />
                            </div>
                          </SpotlightCard>
                        )}

                        <SpotlightCard className="bg-transparent backdrop-blur-xl">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">
                                Current Balance
                              </p>
                              <p className="text-3xl font-bold text-white">
                                {credits}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                credits available
                              </p>
                            </div>
                            <HugeiconsIcon
                              icon={ZapIcon}
                              size={32}
                              className="text-[#d856bf]"
                            />
                          </div>
                          <div className="pt-4 border-t border-white/10 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">
                                Monthly allowance:
                              </span>
                              <span className="text-white font-semibold">
                                {planCredits} credits
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">
                                Used this period:
                              </span>
                              <span className="text-white font-semibold">
                                {creditsUsed} credits
                              </span>
                            </div>
                          </div>
                        </SpotlightCard>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">
                  Current Plan
                </h2>
                <SpotlightCard className="bg-transparent backdrop-blur-xl">
                  <div className="text-center py-12">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-4">
                      <HugeiconsIcon
                        icon={ZapIcon}
                        size={18}
                        className="text-gray-400"
                      />
                      <span className="text-sm font-semibold text-white">
                        Free Plan
                      </span>
                    </div>
                    <p className="text-gray-400 mb-6">
                      You're on the free plan with {credits} credits
                    </p>
                    <button
                      onClick={handleUpgradeToPro}
                      className="inline-flex px-6 py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white font-semibold hover:scale-105 transition-transform"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </SpotlightCard>
              </div>
            ))}

          {showContent && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                Buy Credit Packs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Echo Pack */}
                <SpotlightCard className="bg-[#03b3c3]/5 backdrop-blur-xl border border-[#03b3c3]/20 hover:border-[#03b3c3]/50 transition-all duration-300 group">
                  <div className="p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#03b3c3] to-transparent opacity-50" />
                    
                    <div className="mb-6 relative">
                      <div className="w-20 h-20 mx-auto bg-[#03b3c3]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <HugeiconsIcon icon={Coins01Icon} size={40} className="text-[#03b3c3]" />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#03b3c3]/20 px-3 py-1 rounded-full border border-[#03b3c3]/30">
                        <span className="text-xs font-bold text-[#03b3c3] uppercase tracking-wider">Echo</span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-4xl font-bold text-white">120</span>
                      <span className="text-sm text-gray-400 ml-1">credits</span>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-2xl font-semibold text-[#03b3c3]">$5</span>
                    </div>

                    <button
                      onClick={() => handleCreditPurchase('basic')}
                      className="w-full py-3 rounded-xl border border-[#03b3c3]/50 text-[#03b3c3] font-semibold hover:bg-[#03b3c3] hover:text-white transition-all duration-300"
                    >
                      Purchase
                    </button>
                  </div>
                </SpotlightCard>

                {/* Reverb Pack */}
                <div className="relative transform md:-translate-y-4">
                   <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#d856bf]/20 tracking-wide">
                      BEST VALUE
                    </span>
                  </div>
                  <SpotlightCard className="bg-[#d856bf]/10 backdrop-blur-xl border border-[#d856bf]/50 hover:border-[#d856bf] transition-all duration-300 group h-full">
                    <div className="p-8 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d856bf] to-transparent" />
                      
                      <div className="mb-6 relative">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#d856bf]/20 to-[#c247ac]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(216,86,191,0.2)]">
                          <HugeiconsIcon icon={Coins01Icon} size={48} className="text-[#d856bf]" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#d856bf]/20 px-3 py-1 rounded-full border border-[#d856bf]/30">
                          <span className="text-xs font-bold text-[#d856bf] uppercase tracking-wider">Reverb</span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="text-5xl font-bold text-white">450</span>
                        <span className="text-sm text-gray-300 ml-1">credits</span>
                      </div>
                      
                      <div className="mb-8">
                        <span className="text-3xl font-bold text-[#d856bf]">$15</span>
                      </div>

                      <button
                        onClick={() => handleCreditPurchase('popular')}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white font-bold shadow-lg shadow-[#d856bf]/25 hover:scale-[1.02] transition-transform duration-300"
                      >
                        Purchase
                      </button>
                    </div>
                  </SpotlightCard>
                </div>

                {/* Amplify Pack */}
                <SpotlightCard className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 hover:border-[#c247ac]/50 transition-all duration-300 group">
                  <div className="p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c247ac] to-transparent opacity-50" />
                    
                    <div className="mb-6 relative">
                      <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/10">
                        <HugeiconsIcon icon={Coins01Icon} size={40} className="text-[#c247ac]" />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#c247ac]/20 px-3 py-1 rounded-full border border-[#c247ac]/30">
                        <span className="text-xs font-bold text-[#c247ac] uppercase tracking-wider">Amplify</span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-4xl font-bold text-white">1,500</span>
                      <span className="text-sm text-gray-400 ml-1">credits</span>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-2xl font-semibold text-[#c247ac]">$40</span>
                    </div>

                    <button
                      onClick={() => handleCreditPurchase('premium')}
                      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-[#c247ac] hover:border-[#c247ac] transition-all duration-300"
                    >
                      Purchase
                    </button>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Transaction History
            </h2>
            <div className="space-y-3">
              {loading ? (
                <SpotlightCard className="bg-transparent backdrop-blur-xl">
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading transactions...</p>
                  </div>
                </SpotlightCard>
              ) : transactions.length === 0 ? (
                <SpotlightCard className="bg-transparent backdrop-blur-xl">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No transactions yet</p>
                  </div>
                </SpotlightCard>
              ) : (
                transactions.map((transaction) => {
                  const isPositive = transaction.amount > 0
                  const typeColor =
                    {
                      purchase: 'text-green-400',
                      usage: 'text-orange-400',
                      refund: 'text-blue-400',
                      subscription_grant: 'text-purple-400'
                    }[transaction.type] || 'text-gray-400'

                  return (
                    <SpotlightCard
                      key={transaction.id}
                      className="bg-transparent backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-xl bg-white/5">
                            {isPositive ? (
                              <HugeiconsIcon
                                icon={ZapIcon}
                                size={18}
                                className="text-[#03b3c3]"
                              />
                            ) : (
                              <HugeiconsIcon
                                icon={Dollar01Icon}
                                size={18}
                                className="text-[#d856bf]"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {transaction.description || 'Transaction'}
                            </p>
                            <p className={`text-sm ${typeColor} capitalize`}>
                              {transaction.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${isPositive ? 'text-green-400' : 'text-orange-400'}`}
                          >
                            {isPositive ? '+' : ''}
                            {transaction.amount} credits
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </SpotlightCard>
                  )
                })
              )}
            </div>

            {hasSubscription && (
              <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">
                  Need to view invoices or manage your payment method?
                </p>
                <button
                  onClick={handleManageSubscription}
                  className="inline-flex items-center gap-2 text-[#03b3c3] hover:text-[#d856bf] transition-colors text-sm font-semibold"
                >
                  Open Customer Portal
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
