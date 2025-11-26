import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { authClient } from '@/lib/auth-client'
import ElectricBorder from './ElectricBorder'
import { MostPopularBadge } from './most-popular-badge'

interface PricingCardProps {
  mostPopular?: boolean
  title: string
  description: string
  price: string
  priceUnit: string
  benefits: string[]
  buttonText: string
  waitlistMode?: boolean
}

export function PricingCard({
  mostPopular = false,
  title,
  description,
  price,
  priceUnit,
  benefits,
  buttonText,
  waitlistMode = false
}: PricingCardProps) {
  const mappedBenefits = benefits.map((benefit) => (
    <li key={benefit} className="flex items-center gap-3">
      <HugeiconsIcon
        icon={Tick02Icon}
        color="oklch(79.2% 0.209 151.711)"
        size={22}
      />
      <span className="text-gray-300">{benefit}</span>
    </li>
  ))

  const handleUpgradeToPro = async () => {
    try {
      const { data, error } = await authClient.dodopayments.checkout({
        slug: 'pro-plan',
      })
      
      if (error) {
        throw error
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (e) {
      console.error('Error upgrading to pro', e)
    }
  }

  if (mostPopular) {
    return (
      <div className="relative group -mt-4">
        <div className="block md:hidden">
          <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full flex flex-col relative">
            <MostPopularBadge />

            <div className="mb-6 mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm mb-4">{description}</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">{price}</span>
                <span className="text-gray-400 ml-2">{priceUnit}</span>
              </div>
            </div>

            <ul className="flex-1 space-y-4 mb-8">{mappedBenefits}</ul>

            {waitlistMode ? (
              <a
                href="#waitlist"
                className="cursor-pointer hover:scale-105 hover:bg-[#03b3c3]/20 transform w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full transition-all duration-300 backdrop-blur-sm text-center block"
              >
                Join Waitlist
              </a>
            ) : (
              <button
                type="button"
                className="cursor-pointer hover:scale-105 hover:bg-[#03b3c3]/20 transform w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full  transition-all duration-300 backdrop-blur-sm"
                onClick={handleUpgradeToPro}
              >
                {buttonText}
              </button>
            )}
          </div>
        </div>
        <div className="hidden md:block">
          <ElectricBorder
            color="#03b3c3"
            speed={1.5}
            chaos={0.8}
            thickness={2}
            className="rounded-3xl"
          >
            <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full flex flex-col relative">
              <MostPopularBadge />

              <div className="mb-6 mt-4">
                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm mb-4">{description}</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-white">{price}</span>
                  <span className="text-gray-400 ml-2">{priceUnit}</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">{mappedBenefits}</ul>

              {waitlistMode ? (
                <a
                  href="#waitlist"
                  className="cursor-pointer hover:scale-105 hover:bg-[#03b3c3]/20 transform w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full transition-all duration-300 backdrop-blur-sm text-center block"
                >
                  Join Waitlist
                </a>
              ) : (
                <button
                  type="button"
                  className="cursor-pointer hover:scale-105 hover:bg-[#03b3c3]/20 transform w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full  transition-all duration-300 backdrop-blur-sm"
                  onClick={handleUpgradeToPro}
                >
                  {buttonText}
                </button>
              )}
            </div>
          </ElectricBorder>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full flex flex-col">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-4">{description}</p>
          <div className="flex items-baseline mb-6">
            <span className="text-4xl font-bold text-white">{price}</span>
            <span className="text-gray-400 ml-2">{priceUnit}</span>
          </div>
        </div>

        <ul className="flex-1 space-y-4 mb-8">{mappedBenefits}</ul>

        {waitlistMode ? (
          <a
            href="#waitlist"
            className="cursor-pointer hover:scale-105 hover:bg-[#d856bf]/20 transform w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full transition-all duration-300 backdrop-blur-sm text-center block"
          >
            Join Waitlist
          </a>
        ) : (
          <button
            type="button"
            className="cursor-pointer hover:scale-105 hover:bg-[#d856bf]/20 transform w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-full  transition-all duration-300 backdrop-blur-sm"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}
