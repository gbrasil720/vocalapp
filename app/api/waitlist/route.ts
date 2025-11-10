import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  addToWaitlist,
  checkIPRateLimit,
  getWaitlistCount
} from '@/lib/waitlist'

const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const isRateLimited = await checkIPRateLimit(ip)
    if (isRateLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.'
        },
        { status: 429 }
      )
    }

    const body = await request.json()

    const validation = waitlistSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message
        },
        { status: 400 }
      )
    }

    const { email } = validation.data

    const entry = await addToWaitlist(email, ip)

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: 'This email is already on the waitlist'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully added to waitlist'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to join waitlist. Please try again.'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const count = await getWaitlistCount()
    return NextResponse.json({
      success: true,
      count
    })
  } catch (error) {
    console.error('Waitlist count error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get waitlist count'
      },
      { status: 500 }
    )
  }
}
