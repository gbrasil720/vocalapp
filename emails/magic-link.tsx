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

interface MagicLinkEmailProps {
  email: string
  magicLink: string
}

export default function MagicLinkEmail({
  email,
  magicLink
}: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your magic link to sign in to VocalApp Beta</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>VocalApp</Heading>
            <Text style={tagline}>AI-Powered Transcription</Text>
          </Section>

          <Section style={content}>
            <Heading style={h2}>Welcome to VocalApp Beta! 🎉</Heading>

            <Text style={text}>
              Click the button below to sign in to your VocalApp account:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={magicLink}>
                Sign In to VocalApp
              </Button>
            </Section>

            <Text style={text}>
              Or copy and paste this URL into your browser:
            </Text>

            <Text style={linkText}>
              <Link href={magicLink} style={link}>
                {magicLink}
              </Link>
            </Text>

            <Text style={disclaimer}>
              This link will expire in <strong>15 minutes</strong> and can only
              be used once.
            </Text>

            <Text style={disclaimer}>
              If you didn't request this email, you can safely ignore it.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you requested a magic link to
              sign in to VocalApp.
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
  margin: '0 0 16px'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const button = {
  backgroundColor: '#d856bf',
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

const linkText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#0a0a0a',
  borderRadius: '6px',
  wordBreak: 'break-all' as const
}

const link = {
  color: '#03b3c3',
  textDecoration: 'underline'
}

const disclaimer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '24px 0 0'
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
