/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
'use client'

import type React from 'react'
import { memo, useEffect, useRef, useState } from 'react'
import { isMobileDevice } from '@/lib/device-utils'

interface Position {
  x: number
  y: number
}

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`
}

const SpotlightCard: React.FC<SpotlightCardProps> = memo(
  ({
    children,
    className = '',
    spotlightColor = 'rgba(255, 255, 255, 0.25)'
  }) => {
    const divRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState<number>(0)
    const [isMobile, setIsMobile] = useState(false)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
      setIsMobile(isMobileDevice())
    }, [])

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
      if (!divRef.current || isFocused || isMobile) return

      // Use requestAnimationFrame to throttle updates
      if (rafRef.current !== null) return

      rafRef.current = requestAnimationFrame(() => {
        const rect = divRef.current?.getBoundingClientRect()
        if (rect) {
          setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        }
        rafRef.current = null
      })
    }

    useEffect(() => {
      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
        }
      }
    }, [])

    const handleFocus = () => {
      setIsFocused(true)
      setOpacity(0.6)
    }

    const handleBlur = () => {
      setIsFocused(false)
      setOpacity(0)
    }

    const handleMouseEnter = () => {
      setOpacity(0.6)
    }

    const handleMouseLeave = () => {
      setOpacity(0)
    }

    return (
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className}`}
        role="presentation"
      >
        {/* Only render spotlight effect on non-mobile for better performance */}
        {!isMobile && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
            style={{
              opacity,
              background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`
            }}
          />
        )}
        {children}
      </div>
    )
  }
)

SpotlightCard.displayName = 'SpotlightCard'

export default SpotlightCard
