import { and, eq, isNotNull } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { account } from '@/db/schema'
import { auth } from '@/lib/auth'

const SetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
})

export async function POST(request: Request) {
  try {
    const requestHeaders = await headers()

    const session = await auth.api.getSession({
      headers: requestHeaders
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = SetPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid body parameters',
          details: result.error.flatten()
        },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const { newPassword } = result.data

    // Check if user already has a credential account with a password
    const existingCredentialAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'credential'),
          isNotNull(account.password)
        )
      )
      .limit(1)

    if (existingCredentialAccount.length > 0) {
      return NextResponse.json(
        {
          error:
            'User already has a password. Use change-password endpoint instead.'
        },
        { status: 400 }
      )
    }

    // Check if there's a credential account without password (from previous failed attempt)
    const credentialAccountWithoutPassword = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, userId), eq(account.providerId, 'credential'))
      )
      .limit(1)

    // If there's an existing credential account without password, delete it first
    // This ensures Better Auth creates a fresh one with the correct password
    if (credentialAccountWithoutPassword.length > 0) {
      await db
        .delete(account)
        .where(eq(account.id, credentialAccountWithoutPassword[0].id))
    }

    // Use Better Auth's built-in setPassword API
    // This ensures the password is hashed correctly with Better Auth's internal format
    const setPasswordResult = await auth.api.setPassword({
      body: { newPassword },
      headers: requestHeaders
    })

    if (!setPasswordResult) {
      return NextResponse.json(
        { error: 'Failed to set password. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting password:', error)

    // Handle specific Better Auth errors
    if (error instanceof Error) {
      // Check if user already has a password
      if (
        error.message.includes('already has a password') ||
        error.message.includes('credential account')
      ) {
        return NextResponse.json(
          {
            error:
              'User already has a password. Use change-password endpoint instead.'
          },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'Failed to set password' },
      { status: 500 }
    )
  }
}
