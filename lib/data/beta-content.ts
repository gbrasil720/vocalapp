import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { changelogEntry, roadmapEntry } from '@/db/schema'

export async function getPublishedRoadmapEntries() {
  return db
    .select({
      id: roadmapEntry.id,
      title: roadmapEntry.title,
      status: roadmapEntry.status,
      category: roadmapEntry.category,
      content: roadmapEntry.content,
      sortOrder: roadmapEntry.sortOrder,
      published: roadmapEntry.published,
      createdAt: roadmapEntry.createdAt,
      updatedAt: roadmapEntry.updatedAt
    })
    .from(roadmapEntry)
    .where(eq(roadmapEntry.published, true))
    .orderBy(
      asc(roadmapEntry.sortOrder),
      desc(roadmapEntry.updatedAt),
      desc(roadmapEntry.createdAt)
    )
}

export async function getPublishedChangelogEntries(limit = 50) {
  return db
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
    .limit(limit)
}
