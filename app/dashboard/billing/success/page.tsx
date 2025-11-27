'use client'

import { CheckmarkCircle02Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ElectricBorder from '@/components/ElectricBorder'

export default function BillingSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing your payment...')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(window.location.search)
      const paymentId = params.get('payment_id')
      const subscriptionId = params.get('subscription_id')
      
      // Handle dev mode grants if needed
      const pendingPack = sessionStorage.getItem('pending_credit_pack')
      const pendingSubscription = sessionStorage.getItem('pending_subscription')

      if (pendingPack) {
        sessionStorage.removeItem('pending_credit_pack')
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
            setMessage(`Payment successful! Added ${data.credits} credits.`)
            setStatus('success')
            toast.success(`Payment successful! Added ${data.credits} credits.`)
          } else {
            setMessage('Payment successful! Credits will be added shortly.')
            setStatus('success')
            toast.success('Payment successful! Credits will be added shortly.')
          }
        } catch (error) {
          console.error('Error granting credits:', error)
          setMessage('Payment successful! Credits will be added shortly.')
          setStatus('success')
        }
      } else if (pendingSubscription) {
        sessionStorage.removeItem('pending_subscription')
        try {
           const response = await fetch('/api/subscription/dev-sync', {
             method: 'POST'
           })
           if (response.ok) {
             setMessage('Subscription activated! (DEV MODE)')
             setStatus('success')
             toast.success('Subscription activated! (DEV MODE)')
           } else {
             setMessage('Subscription successful! Your plan will be updated shortly.')
             setStatus('success')
           }
         } catch (e) {
           console.error(e)
           setMessage('Subscription successful! Your plan will be updated shortly.')
           setStatus('success')
         }
      } else if (paymentId || subscriptionId) {
        // Fetch details
        try {
          const query = paymentId ? `paymentId=${paymentId}` : `subscriptionId=${subscriptionId}`
          const res = await fetch(`/api/billing/details?${query}`)
          if (res.ok) {
            const data = await res.json()
            setDetails(data)
            setStatus('success')
            setMessage('Payment confirmed!')
          } else {
            console.error('Failed to fetch details')
            setStatus('error')
            setMessage('Could not verify payment details.')
          }
        } catch (e) {
          console.error(e)
          setStatus('error')
          setMessage('An error occurred while verifying payment.')
        }
      } else {
        // If no ID and no pending session items, it's likely an invalid direct access
        setStatus('error')
        setMessage('Invalid payment session.')
      }
    }

    processPayment()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ElectricBorder
        color={status === 'error' ? '#ef4444' : '#03b3c3'}
        speed={1.5}
        chaos={0.8}
        thickness={2}
        className="rounded-3xl max-w-md w-full"
      >
        <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              status === 'error' ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}>
            <HugeiconsIcon
              icon={status === 'error' ? Cancel01Icon : CheckmarkCircle02Icon}
              size={48}
              className={status === 'error' ? 'text-red-500' : 'text-green-500'}
            />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'loading' ? 'Processing...' : status === 'error' ? 'Something went wrong' : 'Success!'}
          </h1>
          
          <p className="text-gray-400 mb-6">
            {message}
          </p>

          {status === 'error' && (
             <div className="w-full bg-white/5 rounded-xl p-4 mb-8 text-left space-y-3 border border-red-500/20">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Error Code</span>
                    <span className="text-red-400 font-mono text-xs">PAYMENT_VERIFICATION_FAILED</span>
                </div>
                {(new URLSearchParams(window.location.search).get('payment_id') || new URLSearchParams(window.location.search).get('subscription_id')) && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Attempted ID</span>
                        <span className="text-white font-mono text-xs opacity-70">
                            {new URLSearchParams(window.location.search).get('payment_id') || new URLSearchParams(window.location.search).get('subscription_id')}
                        </span>
                    </div>
                )}
             </div>
          )}

          {status === 'error' && (
              <a
                href="mailto:support@vocalapp.io"
                className="block w-full py-3 px-6 mb-3 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-colors"
              >
                Contact Support
              </a>
          )}

          {details && details.data && status === 'success' && (
            <div className="w-full bg-white/5 rounded-xl p-6 mb-8 text-left space-y-4">
              <div className="flex justify-between items-end pb-4 border-b border-white/10">
                <div>
                    <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                    <span className="text-3xl font-bold text-white">
                    {((details.data.total_amount || details.data.amount || 0) / 100).toLocaleString('en-US', {
                        style: 'currency',
                        currency: details.data.currency || 'USD'
                    })}
                    </span>
                </div>
                <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        details.data.status === 'succeeded' || details.data.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                        {details.data.status}
                    </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                  {/* Payment Method */}
                  {details.data.payment_method === 'card' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Payment Method</span>
                        <span className="text-white capitalize">
                            {details.data.card_network} •••• {details.data.card_last_four}
                        </span>
                      </div>
                  )}

                  {/* Customer */}
                  {details.data.customer?.email && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Email</span>
                        <span className="text-white">{details.data.customer.email}</span>
                      </div>
                  )}

                  {/* Date */}
                  {details.data.created_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Date</span>
                        <span className="text-white">
                            {new Date(details.data.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                      </div>
                  )}

                  {/* Order ID */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Order ID</span>
                    <span className="text-white font-mono text-xs opacity-70">
                        {details.data.payment_id || details.data.subscription_id}
                    </span>
                  </div>
              </div>
            </div>
          )}

          <Link
            href="/dashboard/billing"
            className="w-full py-3 px-6 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform"
          >
            Return to Billing
          </Link>
        </div>
      </ElectricBorder>
    </div>
  )
}
