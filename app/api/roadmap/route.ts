import { asc, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { roadmapEntry } from '@/db/schema'
import { auth } from '@/lib/auth'
import { isBetaUser } from '@/lib/beta-access'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await isBetaUser(session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Beta access required' },
        { status: 403 }
      )
    }

    const entries = await db
      .select({
        id: roadmapEntry.id,
        title: roadmapEntry.title,
        status: roadmapEntry.status,
        category: roadmapEntry.category,
        content: roadmapEntry.content,
        published: roadmapEntry.published,
        sortOrder: roadmapEntry.sortOrder,
        updatedAt: roadmapEntry.updatedAt,
        createdAt: roadmapEntry.createdAt
      })
      .from(roadmapEntry)
      .where(eq(roadmapEntry.published, true))
      .orderBy(
        asc(roadmapEntry.sortOrder),
        desc(roadmapEntry.updatedAt),
        desc(roadmapEntry.createdAt)
      )

    return NextResponse.json(
      { entries },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
          'CDN-Cache-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching roadmap entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roadmap entries' },
      { status: 500 }
    )
  }
}
