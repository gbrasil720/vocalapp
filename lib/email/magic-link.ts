import { render } from '@react-email/components'
import MagicLinkEmail from '@/emails/magic-link'

interface SendMagicLinkParams {
  email: string
  token: string
  url: string
}

/**
 * Send a magic link email to the user
 * Supports multiple email providers: Resend, SendGrid, or console logging for dev
 */
export async function sendMagicLinkEmail({
  email,
  token,
  url
}: SendMagicLinkParams): Promise<void> {
  // Render the email template
  const emailHtml = render(
    MagicLinkEmail({
      email,
      magicLink: url
    })
  )

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(80))
    console.log('🔗 Magic Link Email')
    console.log('='.repeat(80))
    console.log('To:', email)
    console.log('Token:', token)
    console.log('URL:', url)
    console.log('='.repeat(80))
    console.log('Email HTML Preview:')
    // console.log(emailHtml.substring(0, 500) + '...')
    console.log('='.repeat(80))
    return
  }

  await sendEmail(email, await emailHtml)
}
async function sendEmail(to: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'VocalApp <noreply@vocalapp.io>',
    to,
    subject: 'Sign in to VocalApp Beta',
    html
  })

  console.log(`✓ Magic link email sent to ${to} via Resend`)
}
