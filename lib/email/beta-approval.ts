import { render } from '@react-email/components'
import BetaApprovalEmail from '@/emails/beta-approval'

const DEFAULT_BASE_URL = 'https://vocalapp.io'

function buildLoginUrl(baseUrl?: string): string {
  const normalizedBase = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '')
  return `${normalizedBase}/login-beta`
}

export async function sendBetaApprovalEmail(email: string): Promise<void> {
  const loginUrl = buildLoginUrl(process.env.NEXT_PUBLIC_URL)

  const emailHtml = render(
    BetaApprovalEmail({
      email,
      loginUrl
    })
  )

  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(80))
    console.log('✅ Beta Approval Email')
    console.log('='.repeat(80))
    console.log('To:', email)
    console.log('Login URL:', loginUrl)
    console.log('='.repeat(80))
    console.log('Email HTML Preview:')
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
    subject: 'You now have access to VocalApp Beta',
    html
  })

  console.log(`✓ Beta approval email sent to ${to} via Resend`)
}
