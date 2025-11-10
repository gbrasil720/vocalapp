import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { changelogEntry } from '@/db/schema'
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
        id: changelogEntry.id,
        title: changelogEntry.title,
        tag: changelogEntry.tag,
        category: changelogEntry.category,
        content: changelogEntry.content,
        published: changelogEntry.published,
        publishedAt: changelogEntry.publishedAt,
        createdAt: changelogEntry.createdAt,
        updatedAt: changelogEntry.updatedAt
      })
      .from(changelogEntry)
      .where(eq(changelogEntry.published, true))
      .orderBy(
        desc(changelogEntry.publishedAt),
        desc(changelogEntry.updatedAt),
        desc(changelogEntry.createdAt)
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
    console.error('Error fetching changelog entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch changelog entries' },
      { status: 500 }
    )
  }
}
