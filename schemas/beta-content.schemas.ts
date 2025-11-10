import { z } from 'zod'

export const roadmapStatusOptions = [
  'planned',
  'in_progress',
  'shipped'
] as const

export const changelogTagOptions = [
  'feature',
  'improvement',
  'fix',
  'announcement',
  'other'
] as const

const nonEmptyString = z.string().trim().min(1)

export const roadmapEntryCreateSchema = z.object({
  title: nonEmptyString.max(120),
  status: z.enum(roadmapStatusOptions).optional(),
  category: z.string().max(120).optional(),
  content: nonEmptyString,
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(-1000).max(1000).optional()
})

export const roadmapEntryUpdateSchema = roadmapEntryCreateSchema.partial()

export const changelogEntryCreateSchema = z.object({
  title: nonEmptyString.max(180),
  tag: z.enum(changelogTagOptions).optional(),
  category: z.string().max(120).optional(),
  content: nonEmptyString,
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional()
})

export const changelogEntryUpdateSchema = changelogEntryCreateSchema.partial()
