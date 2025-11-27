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
                                  .replace('-plan', '')
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
                                  $12.00
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
                                .replace('-plan', '')
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Echo Pack - The Starter */}
                <div className="relative group mt-4">
                  <div className="absolute inset-0 bg-[#03b3c3]/20 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="bg-[#03b3c3]/5 rounded-[20px] p-6 h-full flex flex-col relative overflow-hidden">
                      {/* Background Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#03b3c3]/10 blur-3xl rounded-full -mr-10 -mt-10" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#03b3c3]/5 blur-2xl rounded-full -ml-5 -mb-5" />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                          <div className="p-3 bg-[#03b3c3]/10 rounded-xl border border-[#03b3c3]/20 text-[#03b3c3]">
                            <HugeiconsIcon icon={Coins01Icon} size={24} />
                          </div>
                          <span className="text-xs font-bold tracking-widest text-[#03b3c3] uppercase bg-[#03b3c3]/10 px-3 py-1 rounded-full border border-[#03b3c3]/20">
                            Echo
                          </span>
                        </div>

                        <div className="mb-8">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">120</span>
                            <span className="text-sm font-medium text-gray-400">credits</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">Perfect for trying out the platform and quick tasks.</p>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-6">
                            <span className="text-2xl font-bold text-white">$5</span>
                            <span className="text-xs text-gray-500">One-time payment</span>
                          </div>
                          
                          <button
                            onClick={() => handleCreditPurchase('basic')}
                            className="w-full py-3.5 rounded-xl border border-[#03b3c3]/30 text-[#03b3c3] font-bold hover:bg-[#03b3c3] hover:text-white hover:shadow-[0_0_20px_rgba(3,179,195,0.4)] transition-all duration-300"
                          >
                            Get Echo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reverb Pack - The Star */}
                <div className="relative z-10">
                  <div className="absolute -top-6 left-0 right-0 flex justify-center z-20">
                    <span className="bg-[#d856bf] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(216,86,191,0.5)] tracking-wide uppercase">
                      Most Popular
                    </span>
                  </div>
                  {/* Desktop Version - Electric Border */}
                  <div className="hidden md:block h-full">
                    <ElectricBorder
                      color="#d856bf"
                      speed={2}
                      chaos={0.3}
                      thickness={2}
                      className="rounded-3xl shadow-2xl shadow-[#d856bf]/20 h-full"
                    >
                      <div className="bg-[#0f0f0f] rounded-3xl p-1 h-full">
                        <div className="bg-gradient-to-b from-[#d856bf]/10 to-transparent rounded-[20px] p-8 h-full flex flex-col relative overflow-hidden">
                          {/* Shine Effect */}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none" />
                          
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                              <div className="p-4 bg-[#d856bf] rounded-2xl shadow-lg shadow-[#d856bf]/30 text-white">
                                <HugeiconsIcon icon={ZapIcon} size={28} />
                              </div>
                              <span className="text-sm font-bold tracking-widest text-[#d856bf] uppercase bg-[#d856bf]/10 px-4 py-1.5 rounded-full border border-[#d856bf]/20">
                                Reverb
                              </span>
                            </div>

                            <div className="mb-10">
                              <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white tracking-tight">450</span>
                                <span className="text-base font-medium text-gray-300">credits</span>
                              </div>
                              <p className="text-gray-400 mt-3 leading-relaxed">The sweet spot. Enough power for serious creators.</p>
                            </div>

                            <div className="mt-auto">
                              <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-6">
                                <div>
                                  <span className="text-4xl font-bold text-white">$15</span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-xs text-[#d856bf] font-semibold mb-1">SAVE 20%</span>
                                  <span className="text-xs text-gray-500">vs Echo pack</span>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleCreditPurchase('popular')}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white font-bold text-lg shadow-[0_0_30px_rgba(216,86,191,0.4)] hover:shadow-[0_0_50px_rgba(216,86,191,0.6)] hover:scale-[1.02] transition-all duration-300"
                              >
                                Get Reverb
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ElectricBorder>
                  </div>

                  {/* Mobile Version - Static Border */}
                  <div className="md:hidden h-full relative rounded-3xl p-[2px] bg-gradient-to-b from-[#d856bf] to-[#c247ac] shadow-[0_0_40px_-10px_rgba(216,86,191,0.5)]">
                    <div className="bg-[#0f0f0f] rounded-[22px] p-1 h-full">
                      <div className="bg-gradient-to-b from-[#d856bf]/10 to-transparent rounded-[20px] p-8 h-full flex flex-col relative overflow-hidden">
                        {/* Shine Effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none" />
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-8">
                            <div className="p-4 bg-[#d856bf] rounded-2xl shadow-lg shadow-[#d856bf]/30 text-white">
                              <HugeiconsIcon icon={ZapIcon} size={28} />
                            </div>
                            <span className="text-sm font-bold tracking-widest text-[#d856bf] uppercase bg-[#d856bf]/10 px-4 py-1.5 rounded-full border border-[#d856bf]/20">
                              Reverb
                            </span>
                          </div>

                          <div className="mb-10">
                            <div className="flex items-baseline gap-1">
                              <span className="text-5xl font-black text-white tracking-tight">450</span>
                              <span className="text-base font-medium text-gray-300">credits</span>
                            </div>
                            <p className="text-gray-400 mt-3 leading-relaxed">The sweet spot. Enough power for serious creators.</p>
                          </div>

                          <div className="mt-auto">
                            <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-6">
                              <div>
                                <span className="text-4xl font-bold text-white">$15</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-xs text-[#d856bf] font-semibold mb-1">SAVE 20%</span>
                                <span className="text-xs text-gray-500">vs Echo pack</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleCreditPurchase('popular')}
                              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white font-bold text-lg shadow-[0_0_30px_rgba(216,86,191,0.4)] hover:shadow-[0_0_50px_rgba(216,86,191,0.6)] hover:scale-[1.02] transition-all duration-300"
                            >
                              Get Reverb
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amplify Pack - The Pro */}
                <div className="relative group mt-4">
                  <div className="absolute inset-0 bg-[#c247ac]/20 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="bg-[#c247ac]/5 rounded-[20px] p-6 h-full flex flex-col relative overflow-hidden">
                      {/* Background Elements */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-[#c247ac]/10 blur-3xl rounded-full -mr-10 -mt-10" />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                          <div className="p-3 bg-[#c247ac]/10 rounded-xl border border-[#c247ac]/20 text-[#c247ac]">
                            <HugeiconsIcon icon={Crown03Icon} size={24} />
                          </div>
                          <span className="text-xs font-bold tracking-widest text-[#c247ac] uppercase bg-[#c247ac]/10 px-3 py-1 rounded-full border border-[#c247ac]/20">
                            Amplify
                          </span>
                        </div>

                        <div className="mb-8">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">1,500</span>
                            <span className="text-sm font-medium text-gray-400">credits</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">Maximum volume. For high-frequency production.</p>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-6">
                            <span className="text-2xl font-bold text-white">$40</span>
                            <span className="text-xs text-[#c247ac] font-semibold border border-[#c247ac]/30 px-2 py-0.5 rounded">BEST RATE</span>
                          </div>
                          
                          <button
                            onClick={() => handleCreditPurchase('premium')}
                            className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-[#c247ac] hover:border-[#c247ac] hover:shadow-[0_0_20px_rgba(194,71,172,0.4)] transition-all duration-300"
                          >
                            Get Amplify
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Transaction History
            </h2>
            <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:left-3.5 before:top-2 before:w-[2px] before:bg-gradient-to-b before:from-white/20 before:via-white/5 before:to-transparent before:h-full">
              {loading ? (
                <div className="text-center py-12 pl-4">
                  <div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Loading timeline...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="relative pl-4">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-600 ring-4 ring-[#0a0a0a]" />
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                    <p className="text-gray-400 text-center">No transactions recorded yet.</p>
                  </div>
                </div>
              ) : (
                transactions.map((transaction, index) => {
                  const isPositive = transaction.amount > 0
                  
                  let Icon = Coins01Icon
                  let colorClass = 'text-[#03b3c3]'
                  let bgClass = 'bg-[#03b3c3]'
                  let shadowClass = 'shadow-[0_0_20px_rgba(3,179,195,0.3)]'
                  let borderClass = 'border-[#03b3c3]/30'

                  if (transaction.type === 'subscription_grant') {
                    Icon = Crown03Icon
                    colorClass = 'text-[#d856bf]'
                    bgClass = 'bg-[#d856bf]'
                    shadowClass = 'shadow-[0_0_20px_rgba(216,86,191,0.3)]'
                    borderClass = 'border-[#d856bf]/30'
                  } else if (transaction.type === 'usage') {
                    Icon = ZapIcon
                    colorClass = 'text-orange-400'
                    bgClass = 'bg-orange-400'
                    shadowClass = 'shadow-[0_0_20px_rgba(251,146,60,0.3)]'
                    borderClass = 'border-orange-400/30'
                  } else if (transaction.type === 'refund') {
                    Icon = RefreshIcon
                    colorClass = 'text-blue-400'
                    bgClass = 'bg-blue-400'
                    shadowClass = 'shadow-[0_0_20px_rgba(96,165,250,0.3)]'
                    borderClass = 'border-blue-400/30'
                  }

                  return (
                    <div key={transaction.id} className="relative group">
                      {/* Timeline Node */}
                      <div className={`absolute -left-[23px] top-6 w-4 h-4 rounded-full ${bgClass} ring-4 ring-[#0a0a0a] ${shadowClass} transition-all duration-300 group-hover:scale-125`} />
                      
                      {/* Glass Card */}
                      <div className={`relative bg-[#0a0a0a]/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 sm:p-6 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group-hover:translate-x-1`}>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className={`p-2.5 sm:p-3 rounded-xl bg-white/5 border ${borderClass} ${colorClass} shrink-0`}>
                              <HugeiconsIcon icon={Icon} size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-base sm:text-lg mb-1 leading-tight">
                                {(transaction.description || 'Transaction')
                                  .replace('Frequency Plan', 'Frequency')
                                  .replace('Pro Plan', 'Frequency')
                                  .replace(' - DEV MODE', '')
                                  .replace('Basic', 'Echo')
                                  .replace('Popular', 'Reverb')
                                  .replace('Premium', 'Amplify')
                                  .replace('basic', 'Echo')
                                  .replace('popular', 'Reverb')
                                  .replace('premium', 'Amplify')}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                                <span className="capitalize text-gray-400">{transaction.type.replace('_', ' ')}</span>
                                <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-700" />
                                <span className="w-full sm:w-auto">
                                  {new Date(transaction.createdAt).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:block sm:text-right pl-[52px] sm:pl-0 mt-1 sm:mt-0">
                            <div className="sm:hidden text-xs text-gray-500 font-medium uppercase tracking-wider">Amount</div>
                            <div>
                              <div className={`text-lg sm:text-xl font-bold ${isPositive ? 'text-green-400' : 'text-orange-400'}`}>
                                {isPositive ? '+' : ''}{transaction.amount.toLocaleString()}
                              </div>
                              <div className="hidden sm:block text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Credits</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
