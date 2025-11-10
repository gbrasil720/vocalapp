import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { user } from '@/db/schema'

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
