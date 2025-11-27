import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { creditTransaction, user } from '@/db/schema'

export async function getUserCredits(userId: string): Promise<number> {
  const result = await db
    .select({ credits: user.credits })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (result.length === 0) {
    throw new Error('User not found')
  }

  return result[0].credits
}

export async function addCredits(
  userId: string,
  amount: number,
  metadata?: {
    type: 'purchase' | 'refund' | 'subscription_grant'
    description?: string
    stripePaymentIntentId?: string
    dodoPaymentsPaymentId?: string
    dodoPaymentsSubscriptionId?: string
    [key: string]: unknown
  }
): Promise<void> {
  const type = metadata?.type || 'purchase'
  const description = metadata?.description || `Added ${amount} credits`

  await db
    .update(user)
    .set({
      credits: sql`${user.credits} + ${amount}`
    })
    .where(eq(user.id, userId))

  await db.insert(creditTransaction).values({
    userId,
    amount,
    type,
    description,
    stripePaymentIntentId: metadata?.stripePaymentIntentId,
    dodoPaymentsPaymentId: metadata?.dodoPaymentsPaymentId,
    metadata: metadata as Record<string, unknown>
  })
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const hasEnough = await hasEnoughCredits(userId, amount)
  if (!hasEnough) {
    throw new Error('Insufficient credits')
  }

  await db
    .update(user)
    .set({
      credits: sql`${user.credits} - ${amount}`
    })
    .where(eq(user.id, userId))

  await db.insert(creditTransaction).values({
    userId,
    amount: -amount,
    type: 'usage',
    description,
    metadata: metadata as Record<string, unknown>
  })
}

export async function hasEnoughCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  const currentCredits = await getUserCredits(userId)
  return currentCredits >= amount
}

export async function getTransactionHistory(
  userId: string,
  limit = 50
): Promise<
  Array<{
    id: string
    amount: number
    type: string
    description: string | null
    stripePaymentIntentId: string | null
    metadata: unknown
    createdAt: Date
  }>
> {
  const transactions = await db
    .select()
    .from(creditTransaction)
    .where(eq(creditTransaction.userId, userId))
    .orderBy(desc(creditTransaction.createdAt))
    .limit(limit)

  return transactions
}
