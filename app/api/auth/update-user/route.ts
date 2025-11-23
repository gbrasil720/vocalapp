import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth'

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.union([z.string().url(), z.literal('')]).optional()
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

    const updateData: { name?: string; image?: string } = {}
    if (result.data.name !== undefined) {
      updateData.name = result.data.name
    }
    if (result.data.image !== undefined) {
      updateData.image = result.data.image
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    await db.update(user).set(updateData).where(eq(user.id, session.user.id))

    const updatedUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    return NextResponse.json({
      success: true,
      name: updatedUser[0]?.name,
      image: updatedUser[0]?.image
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
