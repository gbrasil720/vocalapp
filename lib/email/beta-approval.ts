import { render } from '@react-email/components'
import BetaApprovalEmail from '@/emails/beta-approval'
import { sendEmail } from './send-email'

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

  await sendEmail({
    to: email,
    subject: 'You now have access to VocalApp Beta',
    html: await emailHtml
  })
}
