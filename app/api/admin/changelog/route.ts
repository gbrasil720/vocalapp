import { desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { changelogEntry } from '@/db/schema'
import { auth } from '@/lib/auth'
import { changelogEntryCreateSchema } from '@/schemas/beta-content.schemas'

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

export async function GET() {
  try {
    const adminResult = await requireAdmin()
    if ('error' in adminResult) {
      return adminResult.error
    }

    const entries = await db
      .select()
      .from(changelogEntry)
      .orderBy(
        desc(changelogEntry.publishedAt),
        desc(changelogEntry.updatedAt),
        desc(changelogEntry.createdAt)
      )

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching changelog entries (admin):', error)
    return NextResponse.json(
      { error: 'Failed to fetch changelog entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const adminResult = await requireAdmin()
    if ('error' in adminResult) {
      return adminResult.error
    }

    const raw = await request.json()
    const parsed = changelogEntryCreateSchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      title,
      tag,
      category,
      content,
      published: publishedFlag,
      publishedAt
    } = parsed.data

    const normalizedCategory =
      category === undefined
        ? undefined
        : category.trim().length > 0
          ? category.trim()
          : null

    const isPublished = publishedFlag ?? true

    const values: typeof changelogEntry.$inferInsert = {
      title,
      tag,
      category: normalizedCategory,
      content,
      published: isPublished,
      authorId: adminResult.session.user.id
    }

    if (!isPublished) {
      values.publishedAt = null
    } else if (publishedAt) {
      values.publishedAt = publishedAt
    }

    const [entry] = await db.insert(changelogEntry).values(values).returning()

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error('Error creating changelog entry:', error)
    return NextResponse.json(
      { error: 'Failed to create changelog entry' },
      { status: 500 }
    )
  }
}
