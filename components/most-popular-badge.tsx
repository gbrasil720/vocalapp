import { Crown03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function MostPopularBadge() {
  return (
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
      <div className="bg-[#03b3c3] backdrop-blur-2xl text-black px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
        <HugeiconsIcon icon={Crown03Icon} size={18} />
        Most Popular
      </div>
    </div>
  )
}
