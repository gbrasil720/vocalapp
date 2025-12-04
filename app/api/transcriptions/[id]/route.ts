import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { transcription, user } from '@/db/schema'
import { auth } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = await params

    const [result] = await db
      .select({
        transcription,
        user: {
          name: user.name,
          email: user.email,
          image: user.image
        }
      })
      .from(transcription)
      .leftJoin(user, eq(transcription.userId, user.id))
      .where(eq(transcription.id, id))
      .limit(1)

    if (!result) {
      return NextResponse.json(
        { error: 'Transcription not found' },
        { status: 404 }
      )
    }

    const isOwner = session?.user?.id === result.transcription.userId
    if (!isOwner && !result.transcription.isPublic) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      transcription: {
        ...result.transcription,
        user: result.user
      }
    })
  } catch (error) {
    console.error('Error fetching transcription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcription' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { isPublic } = body

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const [updated] = await db
      .update(transcription)
      .set({ isPublic })
      .where(
        and(eq(transcription.id, id), eq(transcription.userId, session.user.id))
      )
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: 'Transcription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ transcription: updated })
  } catch (error) {
    console.error('Error updating transcription:', error)
    return NextResponse.json(
      { error: 'Failed to update transcription' },
      { status: 500 }
    )
  }
}
