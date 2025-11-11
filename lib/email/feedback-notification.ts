import { render } from '@react-email/components'
import FeedbackNotificationEmail from '@/emails/feedback-notification'
import { sendEmail } from './send-email'

type FeedbackCategory = 'bug' | 'feature' | 'workflow' | 'praise' | 'other'
type FeedbackImpact = 'blocking' | 'slowdown' | 'nice-to-have' | 'delight'

interface FeedbackDetails {
  category: FeedbackCategory
  impact: FeedbackImpact
  message: string
  allowContact: boolean
}

interface FeedbackUser {
  name?: string | null
  email?: string | null
}

interface SendFeedbackNotificationEmailParams {
  feedback: FeedbackDetails
  user?: FeedbackUser | null
  submittedAt?: string
}

export async function sendFeedbackNotificationEmail({
  feedback,
  user,
  submittedAt
}: SendFeedbackNotificationEmailParams): Promise<void> {
  const emailHtml = render(
    FeedbackNotificationEmail({
      feedback,
      user: user ?? null,
      submittedAt
    })
  )

  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(80))
    console.log('🛎️ New beta feedback submission')
    console.log('='.repeat(80))
    console.log('Category:', feedback.category)
    console.log('Impact:', feedback.impact)
    console.log('Allow contact:', feedback.allowContact ? 'yes' : 'no')
    console.log('Submitted by:', user?.name || 'not provided')
    console.log('Email:', user?.email || 'not provided')
    console.log('Message:', feedback.message)
    console.log('='.repeat(80))
    return
  }

  await sendEmail({
    from: process.env.EMAIL_FROM || 'Vocal Beta Feedback <hello@vocalapp.io>',
    to: process.env.FEEDBACK_INBOX || 'hello@vocalapp.io',
    subject: `Beta feedback: ${feedback.category} (${feedback.impact})`,
    html: await emailHtml
  })

  console.log(
    `✓ Beta feedback notification sent for ${user?.email || 'unknown user'}`
  )
}
