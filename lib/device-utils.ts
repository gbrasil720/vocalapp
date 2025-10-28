/**
 * Utility functions for device detection and performance optimization
 */

/**
 * Detects if the current device is a mobile device
 * Uses both screen size and user agent detection for accuracy
 *
 * @returns {boolean} True if device is mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check screen width (< 768px is considered mobile)
  const isSmallScreen = window.innerWidth < 768

  // Check user agent for mobile browsers
  const isMobileUA =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    )

  return isSmallScreen || isMobileUA
}

/**
 * Checks if user prefers reduced motion
 * Useful for accessibility and performance optimizations
 *
 * @returns {boolean} True if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
