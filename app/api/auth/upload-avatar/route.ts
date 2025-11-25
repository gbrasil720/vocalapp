import { put } from '@vercel/blob'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate blob path
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'jpg'
    const blobPath = `avatars/${session.user.id}/${timestamp}-${randomSuffix}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false
    })

    return NextResponse.json({
      success: true,
      url: blob.url
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}


