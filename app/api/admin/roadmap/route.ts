import { asc, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { roadmapEntry } from '@/db/schema'
import { auth } from '@/lib/auth'
import { roadmapEntryCreateSchema } from '@/schemas/beta-content.schemas'

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
      .from(roadmapEntry)
      .orderBy(asc(roadmapEntry.sortOrder), desc(roadmapEntry.updatedAt))

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching roadmap entries (admin):', error)
    return NextResponse.json(
      { error: 'Failed to fetch roadmap entries' },
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
    const parsed = roadmapEntryCreateSchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          details: parsed.error.flatten()
        },
        { status: 400 }
      )
    }

    const { title, status, category, content, published, sortOrder } =
      parsed.data
    const normalizedCategory =
      category === undefined
        ? undefined
        : category.trim().length > 0
          ? category.trim()
          : null

    const [entry] = await db
      .insert(roadmapEntry)
      .values({
        title,
        status,
        category: normalizedCategory,
        content,
        published,
        sortOrder,
        authorId: adminResult.session.user.id
      })
      .returning()

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error('Error creating roadmap entry:', error)
    return NextResponse.json(
      { error: 'Failed to create roadmap entry' },
      { status: 500 }
    )
  }
}
