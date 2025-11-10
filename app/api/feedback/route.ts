import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { sendFeedbackNotificationEmail } from '@/lib/email/feedback-notification'

const FeedbackSchema = z.object({
  category: z.enum(['bug', 'feature', 'workflow', 'praise', 'other']),
  impact: z.enum(['blocking', 'slowdown', 'nice-to-have', 'delight']),
  message: z.string().min(10).max(2000),
  allowContact: z.boolean()
})

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  try {
    const json = await request.json()
    const result = FeedbackSchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid feedback data',
          details: result.error.flatten()
        },
        { status: 400 }
      )
    }

    const feedback = result.data

    if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
      console.log('='.repeat(60))
      console.log('📝 Beta feedback received')
      console.log('Name:', session?.user?.name ?? 'not provided')
      console.log('Email:', session?.user?.email ?? 'not provided')
      console.log('Category:', feedback.category)
      console.log('Impact:', feedback.impact)
      console.log('Allow contact:', feedback.allowContact ? 'yes' : 'no')
      console.log('Message:', feedback.message)
      console.log('='.repeat(60))

      return NextResponse.json({ success: true })
    }

    await sendFeedbackNotificationEmail({
      feedback,
      user: {
        name: session?.user?.name ?? null,
        email: session?.user?.email ?? null
      },
      submittedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling feedback submission:', error)
    return NextResponse.json(
      {
        error: 'Unable to process feedback right now. Please try again shortly.'
      },
      { status: 500 }
    )
  }
}
