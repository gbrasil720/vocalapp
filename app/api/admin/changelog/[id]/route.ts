import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { changelogEntry } from '@/db/schema'
import { auth } from '@/lib/auth'
import { changelogEntryUpdateSchema } from '@/schemas/beta-content.schemas'

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
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminResult = await requireAdmin()
    if ('error' in adminResult) {
      return adminResult.error
    }

    const { id } = await context.params

    const raw = await request.json()
    const parsed = changelogEntryUpdateSchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: 'No values provided for update' },
        { status: 400 }
      )
    }

    const [existing] = await db
      .select()
      .from(changelogEntry)
      .where(eq(changelogEntry.id, id))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const payload: Record<string, unknown> = {
      updatedAt: new Date()
    }

    if (parsed.data.title !== undefined) {
      payload.title = parsed.data.title
    }
    if (parsed.data.tag !== undefined) {
      payload.tag = parsed.data.tag
    }
    if (parsed.data.content !== undefined) {
      payload.content = parsed.data.content
    }
    if (parsed.data.category !== undefined) {
      const trimmed = parsed.data.category.trim()
      payload.category = trimmed.length > 0 ? trimmed : null
    }
    if (parsed.data.published !== undefined) {
      payload.published = parsed.data.published
      if (!parsed.data.published) {
        payload.publishedAt = null
      } else if (existing.publishedAt === null) {
        payload.publishedAt = new Date()
      }
    }
    if (parsed.data.publishedAt !== undefined) {
      payload.publishedAt = parsed.data.publishedAt
    }

    const [entry] = await db
      .update(changelogEntry)
      .set(payload)
      .where(eq(changelogEntry.id, id))
      .returning()

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error updating changelog entry:', error)
    return NextResponse.json(
      { error: 'Failed to update changelog entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminResult = await requireAdmin()
    if ('error' in adminResult) {
      return adminResult.error
    }

    const { id } = await context.params

    const [entry] = await db
      .delete(changelogEntry)
      .where(eq(changelogEntry.id, id))
      .returning()

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error('Error deleting changelog entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete changelog entry' },
      { status: 500 }
    )
  }
}
