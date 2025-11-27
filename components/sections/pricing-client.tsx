/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
'use client'

import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import type { CreditPackType } from '@/lib/billing/credit-products'
import { authClient } from '@/lib/auth-client'
import { getCreditPack } from '@/lib/billing/credit-products'

interface CreditPackProps {
  packType: CreditPackType
  title: string
  price: string
  credits: number
  hours: number
  pricePerMin: string
  isPopular?: boolean
}

export function CreditPack({
  packType,
  title,
  price,
  credits,
  hours,
  pricePerMin,
  isPopular = false
}: CreditPackProps) {
  const { data: session } = authClient.useSession()

  const handlePurchase = async () => {
    if (!session?.user?.id) {
        window.location.href = '/auth/sign-in'
        return
    }

    try {
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
    } catch (error) {
      console.error('Error purchasing credits:', error)
      toast.error('Failed to start checkout. Please try again.')
    }
  }

  const containerClass = isPopular
    ? 'bg-gradient-to-br from-[#d856bf]/20 to-[#c247ac]/20 border-2 border-[#d856bf]/50 rounded-2xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer group/pack h-full'
    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#d856bf]/50 rounded-2xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer group/pack h-full'

  return (
    <div
      className={isPopular ? 'relative pt-3' : 'pt-3'}
      onClick={handlePurchase}
    >
      {isPopular && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
            Best Value
          </span>
        </div>
      )}
      <div className={containerClass}>
        <div className="text-center">
          <div className="text-sm text-[#03b3c3] font-semibold mb-2">
            {title}
          </div>
          <div className="flex items-baseline justify-center mb-2">
            <span className="text-3xl font-bold text-white">{price}</span>
          </div>
          <div className="text-2xl font-bold text-[#d856bf] mb-3">
            {credits}
          </div>
          <div className="text-xs text-gray-400 mb-4">
            credits ({hours} hours)
          </div>
          <div className="flex items-center justify-center gap-1">
            <HugeiconsIcon
              icon={Tick02Icon}
              color="oklch(79.2% 0.209 151.711)"
              size={20}
            />
            <span className="text-xs text-gray-300">{pricePerMin}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
