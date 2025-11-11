import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  from?: string
  to: string
  subject: string
  html: string | Promise<string>
}

export async function sendEmail({
  from = process.env.EMAIL_FROM || 'VocalApp <hello@vocalapp.io>',
  to,
  subject,
  html
}: SendEmailOptions): Promise<void> {
  try {
    const resolvedHtml = await html

    if (resolvedHtml == null) {
      throw new Error('Email HTML cannot be null or undefined')
    }

    await resend.emails.send({
      from,
      to,
      subject,
      html: resolvedHtml
    })
  } catch (error) {
    console.error('Failed to send email via Resend:', error)
    throw error
  }
}
