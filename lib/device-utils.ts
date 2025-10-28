/**
 * Utility functions for device detection and performance optimization
 */

/**
 * Mobile breakpoint in pixels
 * Devices with width less than this are considered mobile
 */
export const MOBILE_BREAKPOINT = 768

/**
 * Detects if the current device is a mobile device
 * Uses both screen size and user agent detection for accuracy
 *
 * Note: This function performs detection on every call. For React components,
 * consider using a custom hook that memoizes the result and handles resize events.
 *
 * @returns {boolean} True if device is mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check screen width (< MOBILE_BREAKPOINT is considered mobile)
  const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT

  // Check user agent for mobile browsers
  // Note: This is a basic detection. For production apps, consider using
  // a library like 'mobile-detect' or the User-Agent Client Hints API
  // (navigator.userAgentData) when available
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
