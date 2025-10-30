import { redirect } from 'next/navigation'
import { db } from '@/db'
import { user } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Check if a user has beta access
 * @param userId The user ID to check
 * @returns True if user has beta access, false otherwise
 */
export async function isBetaUser(userId: string): Promise<boolean> {
  try {
    const [userRecord] = await db
      .select({ isBetaUser: user.isBetaUser })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    return userRecord?.isBetaUser ?? false
  } catch (error) {
    console.error('Error checking beta access:', error)
    return false
  }
}

/**
 * Check if a user has beta access by email
 * @param email The email to check
 * @returns True if user has beta access, false otherwise
 */
export async function isBetaUserByEmail(email: string): Promise<boolean> {
  try {
    const [userRecord] = await db
      .select({ isBetaUser: user.isBetaUser })
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    return userRecord?.isBetaUser ?? false
  } catch (error) {
    console.error('Error checking beta access by email:', error)
    return false
  }
}

/**
 * Server-side check for beta access with redirect
 * Use this in server components or route handlers
 * @param userId The user ID to check
 * @param redirectUrl Where to redirect if not beta user (default: '/')
 */
export async function requireBetaAccess(
  userId: string | undefined,
  redirectUrl = '/'
): Promise<void> {
  if (!userId) {
    redirect(redirectUrl)
  }

  const hasBetaAccess = await isBetaUser(userId)
  if (!hasBetaAccess) {
    redirect(redirectUrl)
  }
}

/**
 * Grant beta access to a user by email
 * @param email The email of the user to grant access to
 * @returns True if successful, false otherwise
 */
export async function grantBetaAccess(email: string): Promise<boolean> {
  try {
    const result = await db
      .update(user)
      .set({ isBetaUser: true })
      .where(eq(user.email, email.toLowerCase().trim()))

    return true
  } catch (error) {
    console.error('Error granting beta access:', error)
    return false
  }
}

/**
 * Revoke beta access from a user by email
 * @param email The email of the user to revoke access from
 * @returns True if successful, false otherwise
 */
export async function revokeBetaAccess(email: string): Promise<boolean> {
  try {
    await db
      .update(user)
      .set({ isBetaUser: false })
      .where(eq(user.email, email.toLowerCase().trim()))

    return true
  } catch (error) {
    console.error('Error revoking beta access:', error)
    return false
  }
}

/**
 * Get all beta users
 * @returns Array of beta user records
 */
export async function listBetaUsers() {
  try {
    const betaUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      })
      .from(user)
      .where(eq(user.isBetaUser, true))

    return betaUsers
  } catch (error) {
    console.error('Error listing beta users:', error)
    return []
  }
}

