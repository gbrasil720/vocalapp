/** biome-ignore-all lint/a11y/noStaticElementInteractions: interactive divs have click handlers */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: interactive divs have click handlers */
'use client'

import { Check, Zap } from 'lucide-react'
import { toast } from 'sonner'
import type { CreditPackType } from '@/lib/billing/credit-products'
import { purchaseCredits } from '@/lib/billing/purchase-credits'
import ElectricBorder from '../ElectricBorder'
import { PricingCard } from '../pricing-card'

export function Pricing() {
  const handleCreditPurchase = async (packType: CreditPackType) => {
    try {
      await purchaseCredits(packType)
    } catch (error) {
      console.error('Error purchasing credits:', error)
      toast.error('Failed to start checkout. Please try again.')
    }
  }
  return (
    <section id="pricing" className="relative z-10 py-20 px-6">
      {/* Section Title */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight mb-6">
          Choose Your Power Plan
        </h2>
        <p className="text-xl text-[#03b3c3]/90 leading-relaxed max-w-2xl mx-auto">
          Scale your productivity with flexible pricing designed for every
          professional, from individual creators to enterprise teams.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingCard
          title="Starter"
          description="Perfect to test the waters"
          price="Free"
          priceUnit="30 credits (1 credit = 1 minute of transcription)"
          benefits={[
            '30 minutes of transcription',
            'Real-time transcription',
            '10+ languages',
            'Basic email support'
          ]}
          buttonText="Get Started"
        />
        <PricingCard
          mostPopular
          title="Pro"
          description="Ideal for creator and growing businesses"
          price="$10"
          priceUnit="/month"
          benefits={[
            'Everything on Starter',
            'Real-time transcription',
            '10 hours of transcription per month',
            'Multiple files processing',
            '50+ languages',
            'Priority support'
          ]}
          buttonText="Subscribe Now"
        />
        <PricingCard
          title="Enterprise"
          description="For large organizations with high transcription needs"
          price="Custom"
          priceUnit=""
          benefits={[
            'Everything on Pro',
            'Unlimited hours and resources',
            'Dedicated account manager',
            'Custom integrations',
            '24/7 phone support'
          ]}
          buttonText="Contact Sales"
        />
      </div>

      {/* Credit Packs Section */}
      <div className="mt-16 max-w-6xl mx-auto">
        <div className="relative group">
          <ElectricBorder
            color="#d856bf"
            speed={2}
            chaos={0.6}
            thickness={2}
            className="rounded-3xl"
          >
            <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Left Section - Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full px-4 py-1.5 mb-4">
                    <Zap className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      Out of Credits?
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    Top Up Your Credits
                  </h3>
                  <p className="text-gray-400 text-base max-w-md mx-auto lg:mx-0">
                    Stay on the free plan and purchase credit packs as you need
                    them. No subscription required.
                  </p>
                </div>

                {/* Right Section - Credit Pack Options */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4">
                  {/* Pack 1 */}
                  <div
                    className="pt-3"
                    onClick={() => handleCreditPurchase('basic')}
                  >
                    <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#d856bf]/50 rounded-2xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer group/pack h-full">
                      <div className="text-center">
                        <div className="text-sm text-[#03b3c3] font-semibold mb-2">
                          Basic
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
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-gray-300">
                            $0.042/min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pack 2 - Popular */}
                  <div
                    className="relative pt-3"
                    onClick={() => handleCreditPurchase('popular')}
                  >
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                        Best Value
                      </span>
                    </div>
                    <div className="bg-gradient-to-br from-[#d856bf]/20 to-[#c247ac]/20 border-2 border-[#d856bf]/50 rounded-2xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer group/pack h-full">
                      <div className="text-center">
                        <div className="text-sm text-[#03b3c3] font-semibold mb-2">
                          Popular
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
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-gray-300">
                            $0.033/min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pack 3 */}
                  <div
                    className="pt-3"
                    onClick={() => handleCreditPurchase('premium')}
                  >
                    <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c247ac]/50 rounded-2xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer group/pack h-full">
                      <div className="text-center">
                        <div className="text-sm text-[#03b3c3] font-semibold mb-2">
                          Premium
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
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-gray-300">
                            $0.027/min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Note */}
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

      {/* Additional Info */}
      <div className="text-center mt-12">
        <p className="text-gray-400 text-sm mb-4">
          All plans include a 14-day free trial • No setup fees • Cancel anytime
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#03b3c3]" />
            <span>99.9% uptime SLA</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#d856bf]" />
            <span>SOC 2 compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#c247ac]" />
            <span>GDPR ready</span>
          </div>
        </div>
      </div>
    </section>
  )
}
