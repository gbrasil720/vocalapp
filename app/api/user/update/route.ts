import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth'

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100)
})

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = UpdateUserSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: result.error.flatten()
        },
        { status: 400 }
      )
    }

    const { name } = result.data

    await db.update(user).set({ name }).where(eq(user.id, session.user.id))

    return NextResponse.json({ success: true, name })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}


