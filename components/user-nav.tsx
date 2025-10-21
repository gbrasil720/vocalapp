'use client'

import { ChevronDown, CreditCard, LogOut, Settings, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { authClient } from '@/lib/auth-client'

export function UserNav() {
  const { data: session } = authClient.useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
  }

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
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#d856bf] to-[#03b3c3] flex items-center justify-center text-white text-sm font-semibold">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
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
          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <p className="text-sm font-medium text-white">
              {session.user.name || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session.user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">Dashboard</span>
            </Link>

            <Link
              href="/dashboard/billing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">Billing</span>
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">Settings</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
