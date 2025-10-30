'use client'

import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Crown,
  DollarSign,
  RefreshCw,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import ElectricBorder from '@/components/ElectricBorder'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import SpotlightCard from '@/components/SpotlightCard'
import type { CreditPackType } from '@/lib/billing/credit-products'
import { purchaseCredits } from '@/lib/billing/purchase-credits'

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

export default function BillingPage() {
  const [credits, setCredits] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      // Add cache busting timestamp to force fresh data
      const timestamp = Date.now()

      // Fetch credits
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

      // Fetch transactions
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

      // Fetch subscription
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

    // Check URL params for checkout success/cancel
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      // Get the pack type from session storage (stored before checkout)
      const pendingPack = sessionStorage.getItem('pending_credit_pack')

      if (pendingPack) {
        // Clear it immediately
        sessionStorage.removeItem('pending_credit_pack')

        // DEV MODE: Auto-grant credits since webhooks don't work on localhost
        const grantCreditsInDevMode = async () => {
          try {
            const response = await fetch('/api/credits/dev-grant', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                packType: pendingPack,
                sessionId: params.get('session_id')
              })
            })

            if (response.ok) {
              const data = await response.json()
              toast.success(
                `Payment successful! Added ${data.credits} credits.`
              )
              // Refresh to show new balance
              setTimeout(() => fetchData(), 500)
            } else {
              toast.success(
                'Payment successful! Credits will be added shortly.'
              )
              setTimeout(() => fetchData(), 1000)
            }
          } catch (error) {
            console.error('Error granting credits:', error)
            toast.success('Payment successful! Credits will be added shortly.')
            setTimeout(() => fetchData(), 1000)
          }
        }

        grantCreditsInDevMode()
      } else {
        toast.success('Payment successful! Your credits have been added.')
        setTimeout(() => fetchData(), 1000)
      }

      // Remove the success param from URL
      window.history.replaceState({}, '', '/dashboard/billing')
    } else if (params.get('canceled') === 'true') {
      toast.info('Payment was canceled. No charges were made.')
      window.history.replaceState({}, '', '/dashboard/billing')
      // Clear pending pack
      sessionStorage.removeItem('pending_credit_pack')
    }
  }, [fetchData])

  const handleCreditPurchase = async (packType: CreditPackType) => {
    try {
      const toastId = toast.loading('Opening checkout...')
      await purchaseCredits(packType)
      toast.dismiss(toastId)
    } catch (error) {
      console.error('Error purchasing credits:', error)

      // Check if it's a configuration error
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
        toast.error('Failed to start checkout. Please try again.')
      }
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST'
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        const errorData = await response.json()
        console.error('Portal error:', errorData)

        // If portal not configured, show helpful message
        if (errorData.error?.includes('configuration')) {
          toast.error(
            'Stripe Customer Portal needs to be configured. Please contact support or visit your Stripe dashboard settings.'
          )
        } else {
          toast.error('Failed to open billing portal. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
      toast.error('Failed to open billing portal. Please try again.')
    }
  }

  const hasSubscription = subscriptionData?.hasSubscription ?? false
  const planCredits = hasSubscription ? 600 : 30
  // Calculate credits used: if user has more credits than plan limit, show 0 used
  const creditsUsed = Math.max(0, planCredits - Math.min(credits, planCredits))

  return (
    <>
      {/* Background Animation */}
      <div className="hidden md:block fixed inset-0 z-0 opacity-40">
        <MemoizedHyperspeed />
      </div>

      <div className="relative min-h-screen z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
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
                      <RefreshCw className="w-4 h-4 text-gray-400 hover:text-white" />
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

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Current Plan */}
          {loading ? (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                Current Plan
              </h2>
              <ElectricBorder
                color="#d856bf"
                speed={1.5}
                chaos={0.6}
                thickness={2}
                className="rounded-3xl"
              >
                <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Plan Details Skeleton */}
                    <div className="space-y-6">
                      {/* Plan Header Skeleton */}
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/5 animate-pulse">
                          <div className="w-6 h-6 bg-white/10 rounded" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="h-8 bg-white/10 rounded-lg w-32 animate-pulse" />
                          <div className="h-4 bg-white/5 rounded w-20 animate-pulse" />
                        </div>
                      </div>

                      {/* Features Skeleton */}
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse" />
                            <div className="h-4 bg-white/10 rounded flex-1 animate-pulse" />
                          </div>
                        ))}
                      </div>

                      {/* Info Box Skeleton */}
                      <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                        <div className="h-3 bg-white/10 rounded w-24 animate-pulse" />
                        <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                      </div>
                    </div>

                    {/* Right Side - Stats Skeleton */}
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

                  {/* Loading Indicator */}
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
          ) : hasSubscription && subscriptionData?.subscription ? (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                Current Plan
              </h2>
              <ElectricBorder
                color="#d856bf"
                speed={1.5}
                chaos={0.6}
                thickness={2}
                className="rounded-3xl"
              >
                <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Plan Details */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-[#d856bf]/20">
                          <Crown className="w-6 h-6 text-[#d856bf]" />
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
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300">
                            600 credits per month
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300">50+ languages</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300">
                            Priority support
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-400" />
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

                    {/* Billing Info */}
                    <div className="space-y-6">
                      <SpotlightCard className="bg-transparent backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Amount</p>
                            <p className="text-2xl font-bold text-white">
                              $10.00
                              <span className="text-sm text-gray-400 ml-2">
                                /month
                              </span>
                            </p>
                          </div>
                          <DollarSign className="w-8 h-8 text-[#03b3c3]" />
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
                                {subscriptionData.subscription.nextBillingDate}
                              </p>
                            </div>
                            <Calendar className="w-8 h-8 text-[#c247ac]" />
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
                          <Zap className="w-8 h-8 text-[#d856bf]" />
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
          ) : (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                Current Plan
              </h2>
              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-4">
                    <Zap className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-white">
                      Free Plan
                    </span>
                  </div>
                  <p className="text-gray-400 mb-6">
                    You're on the free plan with {credits} credits
                  </p>
                  <Link
                    href="/#pricing"
                    className="inline-flex px-6 py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white font-semibold hover:scale-105 transition-transform"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </SpotlightCard>
            </div>
          )}

          {/* Credit Packs */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Buy Credit Packs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SpotlightCard className="bg-transparent backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform">
                <div className="text-center">
                  <p className="text-sm text-[#03b3c3] font-semibold mb-2">
                    Basic
                  </p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-3xl font-bold text-white">$5</span>
                  </div>
                  <div className="text-2xl font-bold text-[#d856bf] mb-3">
                    120
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    credits (2 hours)
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCreditPurchase('basic')}
                    className="w-full py-2 px-4 bg-gradient-to-r from-[#03b3c3] to-[#0e5ea5] rounded-full text-white font-semibold hover:scale-105 transition-transform"
                  >
                    Buy Now
                  </button>
                </div>
              </SpotlightCard>

              <div className="relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                    Best Value
                  </span>
                </div>
                <SpotlightCard className="bg-transparent backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform border-2 border-[#d856bf]/50">
                  <div className="text-center">
                    <p className="text-sm text-[#03b3c3] font-semibold mb-2 mt-2">
                      Popular
                    </p>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-3xl font-bold text-white">$15</span>
                    </div>
                    <div className="text-2xl font-bold text-[#d856bf] mb-3">
                      450
                    </div>
                    <p className="text-xs text-gray-400 mb-4">
                      credits (7.5 hours)
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCreditPurchase('popular')}
                      className="w-full py-2 px-4 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white font-semibold hover:scale-105 transition-transform"
                    >
                      Buy Now
                    </button>
                  </div>
                </SpotlightCard>
              </div>

              <SpotlightCard className="bg-transparent backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform">
                <div className="text-center">
                  <p className="text-sm text-[#03b3c3] font-semibold mb-2">
                    Premium
                  </p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-3xl font-bold text-white">$40</span>
                  </div>
                  <div className="text-2xl font-bold text-[#d856bf] mb-3">
                    1,500
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    credits (25 hours)
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCreditPurchase('premium')}
                    className="w-full py-2 px-4 bg-gradient-to-r from-[#c247ac] to-[#d856bf] rounded-full text-white font-semibold hover:scale-105 transition-transform"
                  >
                    Buy Now
                  </button>
                </div>
              </SpotlightCard>
            </div>
          </div>

          {/* Transaction History */}
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
                              <Zap className="w-5 h-5 text-[#03b3c3]" />
                            ) : (
                              <DollarSign className="w-5 h-5 text-[#d856bf]" />
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
              <>
                <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">
                    Need to view invoices or manage your payment method?
                  </p>
                  <a
                    href="https://billing.stripe.com/p/login/test_xxxx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#03b3c3] hover:text-[#d856bf] transition-colors text-sm font-semibold"
                  >
                    Open Stripe Customer Portal
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
