import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

const WAITLIST_SET_KEY = 'waitlist:set'
const WAITLIST_IP_KEY = 'waitlist:ip:'

export interface WaitlistEntry {
  email: string
  timestamp: number
  position: number
}

/**
 * Check if an IP has exceeded rate limit
 * Max 3 submissions per hour
 * @param ip The IP address to check
 * @returns True if rate limited, false otherwise
 */
export async function checkIPRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `${WAITLIST_IP_KEY}${ip}`
    const count = await redis.incr(key)

    // Set expiration on first request (1 hour)
    if (count === 1) {
      await redis.expire(key, 3600)
    }

    // Allow max 3 requests per hour
    return count > 3
  } catch (error) {
    console.error('Error checking IP rate limit:', error)
    // If error checking rate limit, allow the request
    return false
  }
}

/**
 * Add an email to the waitlist
 * @param email The email address to add
 * @param ip The IP address (optional, for tracking)
 * @returns The waitlist entry with position
 */
export async function addToWaitlist(
  email: string,
  ip?: string
): Promise<WaitlistEntry | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const timestamp = Date.now()

    // Check if email already exists
    const exists = await checkIfExists(normalizedEmail)
    if (exists) {
      return null
    }

    // Add to sorted set with timestamp as score
    await redis.zadd(WAITLIST_SET_KEY, {
      score: timestamp,
      member: normalizedEmail
    })

    // Get position (rank starts at 0, so add 1)
    const rank = await redis.zrank(WAITLIST_SET_KEY, normalizedEmail)
    const position = rank !== null ? rank + 1 : 1

    return {
      email: normalizedEmail,
      timestamp,
      position
    }
  } catch (error) {
    console.error('Error adding to waitlist:', error)
    throw new Error('Failed to add to waitlist')
  }
}

/**
 * Check if an email exists in the waitlist
 * @param email The email address to check
 * @returns True if email exists, false otherwise
 */
export async function checkIfExists(email: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const score = await redis.zscore(WAITLIST_SET_KEY, normalizedEmail)
    return score !== null
  } catch (error) {
    console.error('Error checking waitlist:', error)
    return false
  }
}

/**
 * Get the total number of people on the waitlist
 * @returns The total count
 */
export async function getWaitlistCount(): Promise<number> {
  try {
    const count = await redis.zcard(WAITLIST_SET_KEY)
    return count || 0
  } catch (error) {
    console.error('Error getting waitlist count:', error)
    return 0
  }
}

/**
 * Get the position of an email in the waitlist
 * @param email The email address to check
 * @returns The position or null if not found
 */
export async function getWaitlistPosition(
  email: string
): Promise<number | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const rank = await redis.zrank(WAITLIST_SET_KEY, normalizedEmail)
    return rank !== null ? rank + 1 : null
  } catch (error) {
    console.error('Error getting position:', error)
    return null
  }
}

/**
 * Get all waitlist entries (for admin purposes)
 * @param limit Maximum number of entries to return
 * @returns Array of email addresses
 */
export async function getWaitlistEntries(limit = 100): Promise<string[]> {
  try {
    const entries = await redis.zrange(WAITLIST_SET_KEY, 0, limit - 1)
    return entries as string[]
  } catch (error) {
    console.error('Error getting waitlist entries:', error)
    return []
  }
}
