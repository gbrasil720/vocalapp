'use client'

import { ReactNode } from 'react'
import { HyperspeedProvider } from '@/lib/hyperspeed-context'

export function Providers({ children }: { children: ReactNode }) {
  return <HyperspeedProvider>{children}</HyperspeedProvider>
}
