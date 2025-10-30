import { Lock01Icon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import ElectricBorder from './ElectricBorder'
import { Button } from './ui/button'

interface BetaAccessRequiredProps {
  title?: string
  message?: string
  showWaitlistButton?: boolean
}

export function BetaAccessRequired({
  title = 'Beta Access Required',
  message = 'This app is currently in closed beta. Join our waitlist to get early access when we open up more spots.',
  showWaitlistButton = true
}: BetaAccessRequiredProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full">
        <ElectricBorder
          color="#03b3c3"
          speed={1.5}
          chaos={0.6}
          thickness={2}
          className="rounded-3xl"
        >
          <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#03b3c3]/20 mb-6">
              <HugeiconsIcon icon={Lock01Icon} color="#03b3c3" size={40} />
            </div>

            <div className="inline-flex items-center gap-2 bg-[#03b3c3]/20 border border-[#03b3c3]/50 rounded-full px-4 py-2 mb-6">
              <HugeiconsIcon icon={StarIcon} color="#03b3c3" size={18} />
              <span className="text-sm font-semibold text-[#03b3c3]">
                Closed Beta
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {title}
            </h1>

            <p className="text-lg text-gray-300 mb-8 max-w-lg mx-auto">
              {message}
            </p>

            {showWaitlistButton && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#d856bf]/90 hover:to-[#c247ac]/90 text-white font-semibold rounded-full border-0 px-8 py-6 text-base"
                >
                  <Link href="/#waitlist">Join Waitlist</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            )}
          </div>
        </ElectricBorder>
      </div>
    </div>
  )
}
