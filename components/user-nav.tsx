'use client'

import {
  BarChartHorizontalIcon,
  CreditCardIcon,
  Home01Icon,
  Logout01Icon,
  MessageIcon,
  Settings01Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Kbd, KbdGroup } from './ui/kbd'

export function UserNav() {
  const { data: session } = authClient.useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    await authClient.signOut()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function navigateWithKeyboard(event: KeyboardEvent) {
      const isCtrlOrCmdBeingPressed = event.metaKey || event.ctrlKey

      // Only handle shortcuts when Cmd/Ctrl is pressed
      if (!isCtrlOrCmdBeingPressed) return

      const key = event.key.toLowerCase()

      // Dashboard routes mapping
      const routeMap: Record<string, string> = {
        d: '/dashboard',
        a: '/dashboard/analytics',
        b: '/dashboard/billing',
        f: '/dashboard/feedback',
        s: '/dashboard/settings'
      }

      if (key in routeMap) {
        event.preventDefault()
        router.push(routeMap[key])
        setIsOpen(false)
        return
      }

      // Handle sign out
      if (key === 'q') {
        event.preventDefault()
        handleSignOut()
        setIsOpen(false)
        return
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', navigateWithKeyboard)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', navigateWithKeyboard)
    }
  }, [router, handleSignOut])

  if (!session) return null

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full bg-white/5 hover:bg-white/10 transition-all pl-1 pr-4 py-1"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold relative overflow-hidden ${
            session.user.image
              ? ''
              : 'bg-gradient-to-r from-[#d856bf] to-[#03b3c3]'
          }`}
        >
          {session.user.image ? (
            <>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
                  backgroundSize: '4px 4px',
                  backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                }}
              />
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full relative z-10"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                unoptimized
              />
            </>
          ) : (
            getInitials(session.user.name)
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white">
            {session.user.name || 'User'}
          </p>
          <p className="text-xs text-gray-400">{session.user.email}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-neutral-900 backdrop-blur-xl shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-white/10">
            <p className="text-sm font-medium text-white">
              {session.user.name || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session.user.email}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <HugeiconsIcon icon={Home01Icon} size={20} color="#9ca3af" />
              <span className="text-sm text-white gap-2 flex justify-between w-full">
                Dashboard{' '}
                <span className="hidden md:inline-flex">
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>D</Kbd>
                  </KbdGroup>
                </span>
              </span>
            </Link>

            <Link
              href="/dashboard/analytics"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <HugeiconsIcon
                icon={BarChartHorizontalIcon}
                size={20}
                color="#9ca3af"
              />
              <span className="text-sm text-white gap-2 flex justify-between w-full">
                Analytics{' '}
                <span className="hidden md:inline-flex">
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>A</Kbd>
                  </KbdGroup>
                </span>
              </span>
            </Link>

            <Link
              href="/dashboard/billing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <HugeiconsIcon icon={CreditCardIcon} size={20} color="#9ca3af" />
              <span className="text-sm text-white gap-2 flex justify-between w-full">
                Billing{' '}
                <span className="hidden md:inline-flex">
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>B</Kbd>
                  </KbdGroup>
                </span>
              </span>
            </Link>

            <Link
              href="/dashboard/feedback"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <HugeiconsIcon icon={MessageIcon} size={20} color="#9ca3af" />
              <span className="text-sm text-white gap-2 flex justify-between w-full">
                Feedback{' '}
                <span className="hidden md:inline-flex">
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>F</Kbd>
                  </KbdGroup>
                </span>
              </span>
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <HugeiconsIcon icon={Settings01Icon} size={20} color="#9ca3af" />
              <span className="text-sm text-white gap-2 flex justify-between w-full">
                Settings{' '}
                <span className="hidden md:inline-flex">
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>S</Kbd>
                  </KbdGroup>
                </span>
              </span>
            </Link>
          </div>

          <div className="p-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors w-full text-left"
            >
              <HugeiconsIcon icon={Logout01Icon} size={20} color="#9ca3af" />
              <span className="text-sm text-white gap-2 flex justify-between w-full">
                Sign Out
                <span className="hidden md:inline-flex">
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>Q</Kbd>
                  </KbdGroup>
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
