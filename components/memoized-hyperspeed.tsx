'use client'

import { memo } from 'react'
import Hyperspeed from './Hyperspeed'

export const MemoizedHyperspeed = memo(() => {
  return <Hyperspeed />
})

MemoizedHyperspeed.displayName = 'MemoizedHyperspeed'
