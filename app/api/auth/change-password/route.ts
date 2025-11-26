import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  revokeOtherSessions: z.boolean().optional().default(false)
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
    const result = ChangePasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid body parameters',
          details: result.error.flatten()
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword, revokeOtherSessions } = result.data

    // Use Better Auth's built-in changePassword API
    const changePasswordResult = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions
      },
      headers: requestHeaders
    })

    if (!changePasswordResult) {
      return NextResponse.json(
        { error: 'Failed to change password. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing password:', error)

    // Handle specific Better Auth errors
    if (error instanceof Error) {
      if (
        error.message.toLowerCase().includes('invalid password') ||
        error.message.toLowerCase().includes('incorrect password') ||
        error.message.toLowerCase().includes('wrong password')
      ) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

