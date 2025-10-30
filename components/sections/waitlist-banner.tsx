'use client'

import { Mail01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import ElectricBorder from '../ElectricBorder'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export function WaitlistBanner() {
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

  if (success) {
    const content = (
      <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-center gap-3 text-center">
          <HugeiconsIcon
            icon={Tick02Icon}
            color="oklch(79.2% 0.209 151.711)"
            size={32}
          />
          <div>
            <p className="text-xl font-semibold text-white mb-1">
              You're on the list!
            </p>
            <p className="text-gray-300">
              We'll notify you when it's your turn for early access
            </p>
          </div>
        </div>
      </div>
    )

    return (
      <div className="w-full max-w-4xl mx-auto px-6 mb-8">
        {/* Mobile version - no electric border */}
        <div className="block md:hidden">{content}</div>
        {/* Desktop version - with electric border */}
        <div className="hidden md:block">
          <ElectricBorder
            color="#03b3c3"
            speed={1.5}
            chaos={0.6}
            thickness={2}
            className="rounded-2xl"
          >
            {content}
          </ElectricBorder>
        </div>
      </div>
    )
  }

  const formContent = (
    <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-2xl p-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="flex-1 w-full">
          <div className="relative">
            <HugeiconsIcon
              icon={Mail01Icon}
              color="#03b3c3"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <Input
              type="email"
              placeholder="Enter your email for early access"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full pl-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-[#03b3c3] h-12 text-base"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#d856bf]/90 hover:to-[#c247ac]/90 text-white font-semibold rounded-full border-0 transition-all duration-300 hover:scale-105"
        >
          {loading ? 'Joining...' : 'Join Waitlist'}
        </Button>
      </form>
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto px-6 mb-8">
      {/* Mobile version - no electric border */}
      <div className="block md:hidden">{formContent}</div>
      {/* Desktop version - with electric border */}
      <div className="hidden md:block">
        <ElectricBorder
          color="#d856bf"
          speed={2}
          chaos={0.6}
          thickness={2}
          className="rounded-2xl"
        >
          {formContent}
        </ElectricBorder>
      </div>
    </div>
  )
}
