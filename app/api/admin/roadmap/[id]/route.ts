import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { roadmapEntry } from '@/db/schema'
import { auth } from '@/lib/auth'
import { roadmapEntryUpdateSchema } from '@/schemas/beta-content.schemas'

async function requireAdmin() {
  const headerList = await headers()
  const session = await auth.api.getSession({
    headers: headerList
  })

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const adminEmail =
    process.env.ADMIN_EMAIL ||
    session.user.email ||
    'resendebrasilgui@gmail.com'

  if (session.user.email !== adminEmail) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden - Admin access only' },
        { status: 403 }
      )
    }
  }

  return { session }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminResult = await requireAdmin()
    if ('error' in adminResult) {
      return adminResult.error
    }

    const { id } = params

    const raw = await request.json()
    const parsed = roadmapEntryUpdateSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updateValues = parsed.data

    if (Object.keys(updateValues).length === 0) {
      return NextResponse.json(
        { error: 'No values provided for update' },
        { status: 400 }
      )
    }

    const [existing] = await db
      .select()
      .from(roadmapEntry)
      .where(eq(roadmapEntry.id, id))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const payload: Record<string, unknown> = {
      updatedAt: new Date()
    }

    if (updateValues.title !== undefined) {
      payload.title = updateValues.title
    }
    if (updateValues.status !== undefined) {
      payload.status = updateValues.status
    }
    if (updateValues.content !== undefined) {
      payload.content = updateValues.content
    }
    if (updateValues.published !== undefined) {
      payload.published = updateValues.published
    }
    if (updateValues.sortOrder !== undefined) {
      payload.sortOrder = updateValues.sortOrder
    }
    if (updateValues.category !== undefined) {
      const trimmed = updateValues.category.trim()
      payload.category = trimmed.length > 0 ? trimmed : null
    }

    const [entry] = await db
      .update(roadmapEntry)
      .set(payload)
      .where(eq(roadmapEntry.id, id))
      .returning()

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error updating roadmap entry:', error)
    return NextResponse.json(
      { error: 'Failed to update roadmap entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminResult = await requireAdmin()
    if ('error' in adminResult) {
      return adminResult.error
    }

    const { id } = params

    const [entry] = await db
      .delete(roadmapEntry)
      .where(eq(roadmapEntry.id, id))
      .returning()

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error('Error deleting roadmap entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete roadmap entry' },
      { status: 500 }
    )
  }
}
