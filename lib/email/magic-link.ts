import { render } from '@react-email/components'
import MagicLinkEmail from '@/emails/magic-link'
import { sendEmail } from './send-email'

interface SendMagicLinkParams {
  email: string
  token: string
  url: string
}

export async function sendMagicLinkEmail({
  email,
  token,
  url
}: SendMagicLinkParams): Promise<void> {
  const emailHtml = render(
    MagicLinkEmail({
      email,
      magicLink: url
    })
  )

  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(80))
    console.log('🔗 Magic Link Email')
    console.log('='.repeat(80))
    console.log('To:', email)
    console.log('Token:', token)
    console.log('URL:', url)
    console.log('='.repeat(80))
    console.log('Email HTML Preview:')
    console.log('='.repeat(80))
    return
  }

  await sendEmail({
    to: email,
    subject: 'Sign in to VocalApp Beta',
    html: await emailHtml
  })
}
