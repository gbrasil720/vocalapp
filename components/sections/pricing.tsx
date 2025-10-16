import { Check, Crown, Zap } from 'lucide-react'
import ElectricBorder from '../ElectricBorder'

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
        {/* Starter Plan */}
        <div className="relative group">
          <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <p className="text-gray-400 text-sm mb-4">
                Perfect for individual creators
              </p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">Free</span>
                <span className="text-gray-400 ml-2">forever</span>
              </div>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">100 hours/month</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Real-time transcription</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">10 languages</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Basic support</span>
              </li>
            </ul>

            <button
              type="button"
              className="cursor-pointer hover:scale-105 hover:bg-[#c247ac]/20 transform w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full  transition-all duration-300 backdrop-blur-sm"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Pro Plan - Most Popular with Electric Border */}
        <div className="relative group -mt-4">
          <ElectricBorder
            color="#03b3c3"
            speed={1.5}
            chaos={0.8}
            thickness={2}
            className="rounded-3xl"
          >
            <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full flex flex-col relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#03b3c3] backdrop-blur-2xl text-black px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Most Popular
                </div>
              </div>

              <div className="mb-6 mt-4">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Ideal for growing businesses
                </p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-white">$20</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">500 hours/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">
                    Real-time + batch processing
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">50+ languages</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">API access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Custom integrations</span>
                </li>
              </ul>

              <button
                type="button"
                className="cursor-pointer hover:scale-105 hover:bg-[#03b3c3]/20 transform w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full  transition-all duration-300 backdrop-blur-sm"
              >
                Start Free Trial
              </button>
            </div>
          </ElectricBorder>
        </div>

        {/* Enterprise Plan */}
        <div className="relative group">
          <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 text-sm mb-4">
                For large organizations
              </p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">Custom</span>
                <span className="text-gray-400 ml-2">pricing</span>
              </div>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Unlimited hours</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">All features included</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">100+ languages</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Dedicated account manager</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">On-premise deployment</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">24/7 phone support</span>
              </li>
            </ul>

            <button
              type="button"
              className="cursor-pointer hover:scale-105 hover:bg-[#d856bf]/20 transform w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full  transition-all duration-300 backdrop-blur-sm"
            >
              Contact Sales
            </button>
          </div>
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
