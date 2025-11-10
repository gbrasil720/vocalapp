import { NextResponse } from 'next/server'
import { z } from 'zod'

const FeedbackSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional(),
  category: z.enum(['bug', 'feature', 'workflow', 'praise', 'other']),
  impact: z.enum(['blocking', 'slowdown', 'nice-to-have', 'delight']),
  message: z.string().min(10).max(2000),
  allowContact: z.boolean()
})

export async function POST(request: Request) {
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
      console.log('Name:', feedback.name)
      console.log('Email:', feedback.email ?? 'not provided')
      console.log('Category:', feedback.category)
      console.log('Impact:', feedback.impact)
      console.log('Allow contact:', feedback.allowContact ? 'yes' : 'no')
      console.log('Message:', feedback.message)
      console.log('='.repeat(60))

      return NextResponse.json({ success: true })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const subject = `Beta feedback: ${feedback.category} (${feedback.impact})`
    const body = `
      <h2>New beta feedback</h2>
      <p><strong>Name:</strong> ${feedback.name}</p>
      <p><strong>Email:</strong> ${feedback.email ?? 'not provided'}</p>
      <p><strong>Category:</strong> ${feedback.category}</p>
      <p><strong>Impact:</strong> ${feedback.impact}</p>
      <p><strong>Allow contact:</strong> ${feedback.allowContact ? 'yes' : 'no'}</p>
      <p><strong>Message:</strong></p>
      <p>${feedback.message.replace(/\n/g, '<br/>')}</p>
    `

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Vocal Beta Feedback <hello@vocalapp.ai>',
      to: process.env.FEEDBACK_INBOX || 'hello@vocalapp.ai',
      subject,
      html: body
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
