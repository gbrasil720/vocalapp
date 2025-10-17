import { Check, Crown, Zap } from 'lucide-react'
import ElectricBorder from '../ElectricBorder'
import { PricingCard } from '../pricing-card'

export function Pricing() {
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
