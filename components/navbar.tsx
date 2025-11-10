'use client'

import { AudioWave01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AudioLines } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from './ui/button'

interface NavbarProps {
  waitlistMode?: boolean
}

type ActiveSection = 'home' | 'features' | 'pricing' | 'waitlist' | null

export function Navbar({ waitlistMode = false }: NavbarProps) {
  const { data: session } = authClient.useSession()
  const [activeSection, setActiveSection] = useState<ActiveSection>('home')
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isLandingPage = window.location.pathname === '/'

    if (!isLandingPage) {
      setActiveSection(null)
      return
    }

    let observer: IntersectionObserver | null = null
    let domContentLoadedHandler: (() => void) | null = null

    const setupObserver = () => {
      const sections = [
        { id: 'features', element: document.getElementById('features') },
        { id: 'pricing', element: document.getElementById('pricing') },
        { id: 'waitlist', element: document.getElementById('waitlist') }
      ].filter((section) => section.element !== null)

      if (sections.length === 0) {
        setTimeout(setupObserver, 100)
        return
      }

      const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5]
      }

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting)

        if (visibleSections.length > 0) {
          const mostVisible = visibleSections.reduce((prev, current) => {
            return current.intersectionRatio > prev.intersectionRatio
              ? current
              : prev
          })

          const sectionId = mostVisible.target.id as ActiveSection
          setActiveSection(sectionId)
        }
      }

      observer = new IntersectionObserver(observerCallback, observerOptions)

      sections.forEach((section) => {
        if (section.element) {
          observer?.observe(section.element)
        }
      })

      const checkInitialPosition = () => {
        const scrollY = window.scrollY
        if (scrollY < 100) {
          setActiveSection('home')
        }
      }

      checkInitialPosition()
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollY < 200) {
        setActiveSection('home')
        return
      }

      if (scrollY + windowHeight >= documentHeight - 200) {
        return
      }
    }

    const throttledHandleScroll = () => {
      if (scrollTimeoutRef.current) return
      scrollTimeoutRef.current = setTimeout(() => {
        handleScroll()
        scrollTimeoutRef.current = null
      }, 100)
    }

    if (document.readyState === 'loading') {
      domContentLoadedHandler = setupObserver
      document.addEventListener('DOMContentLoaded', domContentLoadedHandler)
    } else {
      setupObserver()
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })

    return () => {
      if (observer) {
        observer.disconnect()
      }
      if (domContentLoadedHandler) {
        document.removeEventListener(
          'DOMContentLoaded',
          domContentLoadedHandler
        )
      }
      window.removeEventListener('scroll', throttledHandleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const getLinkClassName = (section: ActiveSection) => {
    const baseClasses =
      'hidden md:block font-["Satoshi"] font-normal text-base sm:text-lg transition-colors duration-200'
    const isActive = activeSection === section
    const activeClass = isActive ? 'text-[#03b3c3]' : 'hover:text-[#03b3c3]'
    return `${baseClasses} ${activeClass}`
  }

  const getHomeLinkClassName = () => {
    const baseClasses =
      'hidden sm:block font-["Satoshi"] font-normal text-base sm:text-lg transition-colors duration-200'
    const isActive = activeSection === 'home'
    const activeClass = isActive ? 'text-[#03b3c3]' : 'hover:text-[#03b3c3]'
    return `${baseClasses} ${activeClass}`
  }

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      setActiveSection('home')
    }
  }

  return (
    <div className="fixed justify-between flex items-center py-3 sm:py-4 mt-2 sm:mt-4 my-0 mx-auto px-4 sm:px-6 lg:px-8 top-0 left-0 right-0 z-50 w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[50%] shadow-md backdrop-blur-md rounded-full">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={AudioWave01Icon} color="#03b3c3" size={22} />
        <p className="font-['Satoshi'] font-medium text-lg sm:text-xl">
          vocalapp
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/"
          className={getHomeLinkClassName()}
          onClick={handleHomeClick}
        >
          Home
        </Link>
        <Link href="#features" className={getLinkClassName('features')}>
          Features
        </Link>
        <Link href="#pricing" className={getLinkClassName('pricing')}>
          Pricing
        </Link>
        <Button asChild size="sm" className="text-sm sm:text-base">
          {session ? (
            <Link href="/dashboard" className="font-['Satoshi'] font-normal">
              Dashboard
            </Link>
          ) : (
            <Link href="/sign-in" className="font-['Satoshi'] font-normal">
              Sign In
            </Link>
          )}
        </Button>
      </div>
    </div>
  )
}
