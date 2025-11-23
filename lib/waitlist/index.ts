import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const WAITLIST_SET_KEY = 'waitlist:set'
const WAITLIST_IP_KEY = 'waitlist:ip:'
const APPROVED_WAITLIST_SET_KEY = 'waitlist:approved'

export interface WaitlistEntry {
  email: string
  timestamp: number
  position: number
}

export async function checkIPRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `${WAITLIST_IP_KEY}${ip}`
    const count = await redis.incr(key)

    if (count === 1) {
      await redis.expire(key, 3600)
    }

    return count > 3
  } catch (error) {
    console.error('Error checking IP rate limit:', error)
    return false
  }
}

export async function addToWaitlist(
  email: string,
  ip?: string
): Promise<WaitlistEntry | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const timestamp = Date.now()

    const exists = await checkIfExists(normalizedEmail)
    if (exists) {
      return null
    }

    await redis.zadd(WAITLIST_SET_KEY, {
      score: timestamp,
      member: normalizedEmail
    })

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

export async function getWaitlistCount(): Promise<number> {
  try {
    const count = await redis.zcard(WAITLIST_SET_KEY)
    return count || 0
  } catch (error) {
    console.error('Error getting waitlist count:', error)
    return 0
  }
}

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

export async function getWaitlistEntries(limit = 100): Promise<string[]> {
  try {
    const entries = await redis.zrange(WAITLIST_SET_KEY, 0, limit - 1)
    return entries as string[]
  } catch (error) {
    console.error('Error getting waitlist entries:', error)
    return []
  }
}

export async function approveEmail(email: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim()

    await redis.sadd(APPROVED_WAITLIST_SET_KEY, normalizedEmail)

    return true
  } catch (error) {
    console.error('Error approving email:', error)
    return false
  }
}

export async function isEmailApproved(email: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const isMember = await redis.sismember(
      APPROVED_WAITLIST_SET_KEY,
      normalizedEmail
    )
    return isMember === 1
  } catch (error) {
    console.error('Error checking email approval:', error)
    return false
  }
}

export async function getApprovedEmails(): Promise<string[]> {
  try {
    const emails = await redis.smembers(APPROVED_WAITLIST_SET_KEY)
    return emails as string[]
  } catch (error) {
    console.error('Error getting approved emails:', error)
    return []
  }
}

export async function revokeApproval(email: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    await redis.srem(APPROVED_WAITLIST_SET_KEY, normalizedEmail)
    return true
  } catch (error) {
    console.error('Error revoking approval:', error)
    return false
  }
}
