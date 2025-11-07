import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text
} from '@react-email/components'

interface BetaApprovalEmailProps {
  email: string
  loginUrl: string
}

export default function BetaApprovalEmail({
  email,
  loginUrl
}: BetaApprovalEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to VocalApp Beta — you're approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>VocalApp</Heading>
            <Text style={tagline}>AI-Powered Transcription</Text>
          </Section>

          <Section style={content}>
            <Heading style={h2}>You&apos;re in! 🎉</Heading>

            <Text style={text}>
              Hi {email},
              <br />
              Your request for beta access has been approved. We&apos;re excited
              to have you try VocalApp.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={loginUrl}>
                Access the Beta Dashboard
              </Button>
            </Section>

            <Text style={text}>Here&apos;s how to get started:</Text>

            <Section style={stepsList}>
              <Text style={stepItem}>
                <strong>1.</strong> Click the button above or visit{' '}
                <Link href={loginUrl} style={inlineLink}>
                  {loginUrl}
                </Link>
              </Text>
              <Text style={stepItem}>
                <strong>2.</strong> Sign in using the email that was approved.
                Use the magic link option or Google OAuth.
              </Text>
              <Text style={stepItem}>
                <strong>3.</strong> Explore the dashboard, upload audio, and
                start transcribing.
              </Text>
            </Section>

            <Text style={text}>
              Need help? Reply to this email and our team will get back to you.
            </Text>

            <Text style={disclaimer}>
              This approval is tied to {email}. If you didn&apos;t request
              access, you can ignore this message.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this email because you joined the VocalApp
              waitlist.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} VocalApp. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif'
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px'
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px'
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 8px',
  padding: '0',
  lineHeight: '1.2'
}

const tagline = {
  color: '#9ca3af',
  fontSize: '16px',
  margin: '0',
  padding: '0'
}

const content = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '40px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
}

const h2 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 24px',
  padding: '0',
  lineHeight: '1.3'
}

const text = {
  color: '#d1d5db',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const button = {
  backgroundColor: '#03b3c3',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  lineHeight: '1.4'
}

const stepsList = {
  backgroundColor: '#0f172a',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '16px 20px',
  margin: '0 0 24px'
}

const stepItem = {
  color: '#d1d5db',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px'
}

const inlineLink = {
  color: '#03b3c3',
  textDecoration: 'underline'
}

const disclaimer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0 0'
}

const footer = {
  marginTop: '40px',
  paddingTop: '24px',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '8px 0',
  textAlign: 'center' as const
}
