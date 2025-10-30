'use client'

import {
  GiftIcon,
  Mail01Icon,
  StarIcon,
  Tick02Icon,
  ZapIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import ElectricBorder from '../ElectricBorder'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        toast.success('Successfully joined the waitlist!')
        setEmail('')
      } else {
        toast.error(data.error || 'Failed to join waitlist')
      }
    } catch (error) {
      console.error('Waitlist error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="waitlist" className="relative z-10 py-20 px-6">
      {/* Section Title */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#03b3c3]/20 border border-[#03b3c3]/50 rounded-full px-4 py-2 mb-6">
          <HugeiconsIcon icon={StarIcon} color="#03b3c3" size={20} />
          <span className="text-sm font-semibold text-[#03b3c3]">
            Closed Beta
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight mb-6">
          Join the Exclusive Waitlist
        </h2>
        <p className="text-xl text-[#03b3c3]/90 leading-relaxed max-w-2xl mx-auto">
          Be among the first to experience the future of AI-powered
          transcription. Get early access, exclusive perks, and priority
          support.
        </p>
      </div>

      {/* Main Waitlist Form */}
      <div className="max-w-2xl mx-auto mb-16">
        {success ? (
          <>
            {/* Mobile version - no electric border */}
            <div className="block md:hidden">
              <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  color="oklch(79.2% 0.209 151.711)"
                  size={64}
                  className="mx-auto mb-4"
                />
                <h3 className="text-3xl font-bold text-white mb-4">
                  You're on the list!
                </h3>
                <p className="text-xl text-gray-300 mb-2">
                  Thank you for joining the waitlist
                </p>
                <p className="text-gray-400">
                  We'll notify you when it's your turn to access the beta.
                </p>
              </div>
            </div>
            {/* Desktop version - with electric border */}
            <div className="hidden md:block">
              <ElectricBorder
                color="#03b3c3"
                speed={1.5}
                chaos={0.6}
                thickness={2}
                className="rounded-3xl"
              >
                <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    color="oklch(79.2% 0.209 151.711)"
                    size={64}
                    className="mx-auto mb-4"
                  />
                  <h3 className="text-3xl font-bold text-white mb-4">
                    You're on the list!
                  </h3>
                  <p className="text-xl text-gray-300 mb-2">
                    Thank you for joining the waitlist
                  </p>
                  <p className="text-gray-400">
                    We'll notify you when it's your turn to access the beta.
                  </p>
                </div>
              </ElectricBorder>
            </div>
          </>
        ) : (
          <>
            {/* Mobile version - no electric border */}
            <div className="block md:hidden">
              <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      color="#03b3c3"
                      size={22}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full pl-14 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-[#03b3c3] h-14 text-lg rounded-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#d856bf]/90 hover:to-[#c247ac]/90 text-white font-semibold text-lg rounded-full border-0 transition-all duration-300 hover:scale-105"
                  >
                    {loading ? 'Joining...' : 'Secure Your Spot'}
                  </Button>
                </form>
                <p className="text-center text-gray-400 text-sm mt-4">
                  No spam. Unsubscribe anytime. We respect your privacy.
                </p>
              </div>
            </div>
            {/* Desktop version - with electric border */}
            <div className="hidden md:block">
              <ElectricBorder
                color="#d856bf"
                speed={2}
                chaos={0.6}
                thickness={2}
                className="rounded-3xl"
              >
                <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <HugeiconsIcon
                        icon={Mail01Icon}
                        color="#03b3c3"
                        size={22}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                      />
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full pl-14 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-[#03b3c3] h-14 text-lg rounded-full"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#d856bf]/90 hover:to-[#c247ac]/90 text-white font-semibold text-lg rounded-full border-0 transition-all duration-300 hover:scale-105"
                    >
                      {loading ? 'Joining...' : 'Secure Your Spot'}
                    </Button>
                  </form>
                  <p className="text-center text-gray-400 text-sm mt-4">
                    No spam. Unsubscribe anytime. We respect your privacy.
                  </p>
                </div>
              </ElectricBorder>
            </div>
          </>
        )}
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#d856bf] to-[#c247ac]">
              <HugeiconsIcon icon={ZapIcon} color="#ffffff" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Early Access</h3>
          </div>
          <p className="text-gray-300">
            Be the first to use our revolutionary transcription platform before
            the public launch.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#d856bf] to-[#c247ac]">
              <HugeiconsIcon icon={GiftIcon} color="#ffffff" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Exclusive Perks</h3>
          </div>
          <p className="text-gray-300">
            Get bonus credits, special pricing, and lifetime founder benefits as
            an early adopter.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#d856bf] to-[#c247ac]">
              <HugeiconsIcon icon={StarIcon} color="#ffffff" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Priority Support</h3>
          </div>
          <p className="text-gray-300">
            Direct access to our team and priority customer support throughout
            the beta period.
          </p>
        </div>
      </div>
    </section>
  )
}
