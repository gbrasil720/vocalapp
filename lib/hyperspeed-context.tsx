'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const HYPERSPEED_KEY = 'vocalapp-hyperspeed-enabled'

interface HyperspeedContextType {
  hyperspeedEnabled: boolean
  setHyperspeedEnabled: (enabled: boolean) => void
}

const HyperspeedContext = createContext<HyperspeedContextType>({
  hyperspeedEnabled: true,
  setHyperspeedEnabled: () => {}
})

export function HyperspeedProvider({ children }: { children: ReactNode }) {
  const [hyperspeedEnabled, setHyperspeedEnabledState] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Read from localStorage on mount
    const stored = localStorage.getItem(HYPERSPEED_KEY)
    if (stored !== null) {
      setHyperspeedEnabledState(stored === 'true')
    }
    setIsHydrated(true)
  }, [])

  const setHyperspeedEnabled = (enabled: boolean) => {
    setHyperspeedEnabledState(enabled)
    localStorage.setItem(HYPERSPEED_KEY, String(enabled))
  }

  // Return the default value during SSR
  if (!isHydrated) {
    return (
      <HyperspeedContext.Provider
        value={{ hyperspeedEnabled: true, setHyperspeedEnabled }}
      >
        {children}
      </HyperspeedContext.Provider>
    )
  }

  return (
    <HyperspeedContext.Provider
      value={{ hyperspeedEnabled, setHyperspeedEnabled }}
    >
      {children}
    </HyperspeedContext.Provider>
  )
}

export function useHyperspeed() {
  return useContext(HyperspeedContext)
}
