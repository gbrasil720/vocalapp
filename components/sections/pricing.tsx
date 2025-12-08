/** biome-ignore-all lint/a11y/noStaticElementInteractions: interactive divs have click handlers */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: interactive divs have click handlers */
'use client'

import { StarIcon, Tick02Icon, ZapIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import {
  type CreditPackType,
  getCreditPack
} from '@/lib/billing/credit-products'
import ElectricBorder from '../ElectricBorder'
import { PricingCard } from '../pricing-card'

interface PricingProps {
  waitlistMode?: boolean
}

export function Pricing({ waitlistMode = false }: PricingProps = {}) {
  const { data: session } = authClient.useSession()

  const handleCreditPurchase = async (packType: CreditPackType) => {
    if (!session?.user?.id) {
      window.location.href = '/sign-in'
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
  return (
    <section id="pricing" className="relative z-10 py-16 md:py-20 px-6 md:px-6">
      <div className="text-center mb-16 max-w-4xl mx-auto">
        {waitlistMode && (
          <div className="inline-flex items-center gap-2 bg-[#03b3c3]/20 border border-[#03b3c3]/50 rounded-full px-4 py-2 mb-6">
            <HugeiconsIcon icon={StarIcon} color="#03b3c3" size={20} />
            <span className="text-sm sm:text-base font-semibold text-[#03b3c3]">
              Coming Soon - Join Waitlist for Early Access
            </span>
          </div>
        )}
        <h2 className="font-['Satoshi'] text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
          {waitlistMode ? 'Future Pricing Plans' : 'Choose Your Power Plan'}
        </h2>
        <p className="text-xl text-primary/90 leading-relaxed max-w-2xl mx-auto">
          {waitlistMode
            ? 'Preview the plans we’ll roll out at launch. Closed beta access is free—reserve your spot now for early pricing options.'
            : 'Scale your productivity with flexible pricing designed for every professional, from individual creators to enterprise teams.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        <PricingCard
          title="Free"
          description="Perfect for trying out Vocalapp"
          price="$0"
          priceUnit="forever"
          benefits={[
            '30 credits on signup',
            '7-day audio retention',
            '50+ languages supported',
            'SRT, VTT, TXT exports',
            'Community support'
          ]}
          buttonText="Get Started"
          waitlistMode={waitlistMode}
        />
        <PricingCard
          mostPopular
          title="Frequency"
          description="For creators and growing teams"
          price="$12"
          priceUnit="/month"
          benefits={[
            '600 credits per month',
            '90-day audio retention',
            'Multiple file uploads',
            'All export formats',
            'Priority support'
          ]}
          buttonText="Subscribe Now"
          waitlistMode={waitlistMode}
        />
        <PricingCard
          title="Enterprise"
          description="For organizations with custom needs"
          price="Custom"
          priceUnit=""
          benefits={[
            'Unlimited credits',
            'Unlimited audio retention',
            'Dedicated account manager',
            'Custom integrations',
            'SLA & 24/7 support'
          ]}
          buttonText="Contact Sales"
          waitlistMode={waitlistMode}
        />
      </div>

      {!waitlistMode && session && (
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="relative group">
            <div className="block md:hidden">
              <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-[#03b3c3] rounded-full px-4 py-1.5 mb-4">
                      <HugeiconsIcon icon={ZapIcon} color="#ffffff" size={22} />
                      <span className="text-sm font-semibold text-white">
                        Out of Credits?
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3">
                      Top Up Your Credits
                    </h3>
                    <p className="text-gray-400 text-base max-w-md mx-auto lg:mx-0">
                      Stay on the free plan and purchase credit packs as you
                      need them. No subscription required.
                    </p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4">
                    <div
                      className="pt-3"
                      onClick={
                        waitlistMode
                          ? undefined
                          : () => handleCreditPurchase('basic')
                      }
                    >
                      <div
                        className={`bg-white/5 border border-white/10 rounded-2xl p-5 transition-all duration-300 h-full ${
                          waitlistMode
                            ? 'cursor-default'
                            : 'hover:bg-white/10 hover:border-[#d856bf]/50 hover:scale-105 cursor-pointer'
                        } group/pack`}
                      >
                        <div className="text-center">
                          <div className="text-sm text-[#03b3c3] font-semibold mb-2">
                            Echo
                          </div>
                          <div className="flex items-baseline justify-center mb-2">
                            <span className="text-3xl font-bold text-white">
                              $5
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[#d856bf] mb-3">
                            120
                          </div>
                          <div className="text-xs text-gray-400 mb-4">
                            credits (2 hours)
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              color="oklch(79.2% 0.209 151.711)"
                              size={20}
                            />
                            <span className="text-xs text-gray-300">
                              $0.042/min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="relative pt-3"
                      onClick={
                        waitlistMode
                          ? undefined
                          : () => handleCreditPurchase('popular')
                      }
                    >
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="bg-[#d856bf] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                          Best Value
                        </span>
                      </div>
                      <div
                        className={`bg-[#d856bf]/20 border-2 border-[#d856bf]/50 rounded-2xl p-5 transition-all duration-300 h-full ${
                          waitlistMode
                            ? 'cursor-default'
                            : 'hover:scale-105 cursor-pointer'
                        } group/pack`}
                      >
                        <div className="text-center">
                          <div className="text-sm text-[#03b3c3] font-semibold mb-2">
                            Reverb
                          </div>
                          <div className="flex items-baseline justify-center mb-2">
                            <span className="text-3xl font-bold text-white">
                              $15
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[#d856bf] mb-3">
                            450
                          </div>
                          <div className="text-xs text-gray-400 mb-4">
                            credits (7.5 hours)
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              color="oklch(79.2% 0.209 151.711)"
                              size={20}
                            />
                            <span className="text-xs text-gray-300">
                              $0.033/min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="pt-3"
                      onClick={
                        waitlistMode
                          ? undefined
                          : () => handleCreditPurchase('premium')
                      }
                    >
                      <div
                        className={`bg-white/5 border border-white/10 rounded-2xl p-5 transition-all duration-300 h-full ${
                          waitlistMode
                            ? 'cursor-default'
                            : 'hover:bg-white/10 hover:border-[#c247ac]/50 hover:scale-105 cursor-pointer'
                        } group/pack`}
                      >
                        <div className="text-center">
                          <div className="text-sm text-[#03b3c3] font-semibold mb-2">
                            Amplify
                          </div>
                          <div className="flex items-baseline justify-center mb-2">
                            <span className="text-3xl font-bold text-white">
                              $40
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[#d856bf] mb-3">
                            1,500
                          </div>
                          <div className="text-xs text-gray-400 mb-4">
                            credits (25 hours)
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              color="oklch(79.2% 0.209 151.711)"
                              size={20}
                            />
                            <span className="text-xs text-gray-300">
                              $0.027/min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-xs text-gray-500">
                    Credits never expire • Use them whenever you need • No
                    recurring charges
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <ElectricBorder
                color="#d856bf"
                speed={2}
                chaos={0.6}
                thickness={2}
                className="rounded-3xl"
              >
                <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex-1 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 bg-[#03b3c3] rounded-full px-4 py-1.5 mb-4">
                        <HugeiconsIcon
                          icon={ZapIcon}
                          color="#ffffff"
                          size={22}
                        />
                        <span className="text-sm font-semibold text-white">
                          Out of Credits?
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-3">
                        Top Up Your Credits
                      </h3>
                      <p className="text-gray-400 text-base max-w-md mx-auto lg:mx-0">
                        Stay on the free plan and purchase credit packs as you
                        need them. No subscription required.
                      </p>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4">
                      <div
                        className="pt-3"
                        onClick={
                          waitlistMode
                            ? undefined
                            : () => handleCreditPurchase('basic')
                        }
                      >
                        <div
                          className={`bg-white/5 border border-white/10 rounded-2xl p-5 transition-all duration-300 h-full ${
                            waitlistMode
                              ? 'cursor-default'
                              : 'hover:bg-white/10 hover:border-[#d856bf]/50 hover:scale-105 cursor-pointer'
                          } group/pack`}
                        >
                          <div className="text-center">
                            <div className="text-sm text-[#03b3c3] font-semibold mb-2">
                              Echo
                            </div>
                            <div className="flex items-baseline justify-center mb-2">
                              <span className="text-3xl font-bold text-white">
                                $5
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-[#d856bf] mb-3">
                              120
                            </div>
                            <div className="text-xs text-gray-400 mb-4">
                              credits (2 hours)
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                color="oklch(79.2% 0.209 151.711)"
                                size={20}
                              />
                              <span className="text-xs text-gray-300">
                                $0.042/min
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="relative pt-3"
                        onClick={
                          waitlistMode
                            ? undefined
                            : () => handleCreditPurchase('popular')
                        }
                      >
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                          <span className="bg-[#d856bf] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                            Best Value
                          </span>
                        </div>
                        <div
                          className={`bg-[#d856bf]/20 border-2 border-[#d856bf]/50 rounded-2xl p-5 transition-all duration-300 h-full ${
                            waitlistMode
                              ? 'cursor-default'
                              : 'hover:scale-105 cursor-pointer'
                          } group/pack`}
                        >
                          <div className="text-center">
                            <div className="text-sm text-[#03b3c3] font-semibold mb-2">
                              Reverb
                            </div>
                            <div className="flex items-baseline justify-center mb-2">
                              <span className="text-3xl font-bold text-white">
                                $15
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-[#d856bf] mb-3">
                              450
                            </div>
                            <div className="text-xs text-gray-400 mb-4">
                              credits (7.5 hours)
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                color="oklch(79.2% 0.209 151.711)"
                                size={20}
                              />
                              <span className="text-xs text-gray-300">
                                $0.033/min
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="pt-3"
                        onClick={
                          waitlistMode
                            ? undefined
                            : () => handleCreditPurchase('premium')
                        }
                      >
                        <div
                          className={`bg-white/5 border border-white/10 rounded-2xl p-5 transition-all duration-300 h-full ${
                            waitlistMode
                              ? 'cursor-default'
                              : 'hover:bg-white/10 hover:border-[#c247ac]/50 hover:scale-105 cursor-pointer'
                          } group/pack`}
                        >
                          <div className="text-center">
                            <div className="text-sm text-[#03b3c3] font-semibold mb-2">
                              Amplify
                            </div>
                            <div className="flex items-baseline justify-center mb-2">
                              <span className="text-3xl font-bold text-white">
                                $40
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-[#d856bf] mb-3">
                              1,500
                            </div>
                            <div className="text-xs text-gray-400 mb-4">
                              credits (25 hours)
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                color="oklch(79.2% 0.209 151.711)"
                                size={20}
                              />
                              <span className="text-xs text-gray-300">
                                $0.027/min
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-500">
                      Credits never expire • Use them whenever you need • No
                      recurring charges
                    </p>
                  </div>
                </div>
              </ElectricBorder>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-12">
        <p className="text-gray-400 text-sm mb-4">
          {waitlistMode
            ? 'Closed beta includes free usage while we finalize pricing • We’ll notify you before any billing begins'
            : 'All plans include a 14-day free trial • No setup fees • Cancel anytime'}
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ZapIcon} color="#03b3c3" size={20} />
            <span>99.9% uptime SLA</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ZapIcon} color="#d856bf" size={20} />
            <span>SOC 2 compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ZapIcon} color="#c247ac" size={20} />
            <span>GDPR ready</span>
          </div>
        </div>
      </div>
    </section>
  )
}
