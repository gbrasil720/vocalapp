'use client'

import { memo } from 'react'
import Hyperspeed from './Hyperspeed'

export const MemoizedHyperspeed = memo(() => {
  // Options are now handled directly in Hyperspeed component with device detection
  return <Hyperspeed />
})

MemoizedHyperspeed.displayName = 'MemoizedHyperspeed'
