import { AudioLines } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'

export function Navbar() {
  return (
    <div className="fixed justify-between flex items-center py-3 sm:py-4 mt-2 sm:mt-4 my-0 mx-auto px-4 sm:px-6 lg:px-8 top-0 left-0 right-0 z-50 w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[50%] shadow-md backdrop-blur-md rounded-full">
      <div className="flex items-center gap-2">
        <AudioLines
          size={18}
          strokeWidth={1.5}
          className="sm:w-5 sm:h-5 text-[#03b3c3]"
        />
        <p className="font-['Satoshi'] font-medium text-lg sm:text-xl">
          vocal.app
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/"
          className="hidden sm:block font-['Satoshi'] font-normal text-base sm:text-lg"
        >
          Home
        </Link>
        <Link
          href="#features"
          className="hidden md:block font-['Satoshi'] font-normal text-base sm:text-lg hover:text-[#03b3c3] transition-colors duration-200"
        >
          Features
        </Link>
        <Link
          href="#pricing"
          className="hidden md:block font-['Satoshi'] font-normal text-base sm:text-lg hover:text-[#03b3c3] transition-colors duration-200"
        >
          Pricing
        </Link>
        <Button asChild size="sm" className="text-sm sm:text-base">
          <Link href="/sign-in" className="font-['Satoshi'] font-normal">
            Sign In
          </Link>
        </Button>
      </div>
    </div>
  )
}
