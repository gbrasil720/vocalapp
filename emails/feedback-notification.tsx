import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components'

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

interface FeedbackNotificationEmailProps {
  feedback: FeedbackDetails
  user?: FeedbackUser | null
  submittedAt?: string
}

export default function FeedbackNotificationEmail({
  feedback,
  user,
  submittedAt
}: FeedbackNotificationEmailProps) {
  const messageLines = feedback.message.split(/\r?\n/).filter(Boolean)

  return (
    <Html>
      <Head />
      <Preview>New beta feedback submitted</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>VocalApp</Heading>
            <Text style={tagline}>Beta Feedback Notification</Text>
          </Section>

          <Section style={content}>
            <Heading style={h2}>A beta user just submitted feedback</Heading>

            <Section style={detailsCard}>
              <Text style={detailLabel}>Submitted by</Text>
              <Text style={detailValue}>
                {user?.name || 'Not provided'}
                {user?.email ? ` · ${user.email}` : ''}
              </Text>

              {submittedAt ? (
                <>
                  <Text style={detailLabel}>Submitted at</Text>
                  <Text style={detailValue}>{submittedAt}</Text>
                </>
              ) : null}

              <Text style={detailLabel}>Category</Text>
              <Text style={detailValue}>{formatLabel(feedback.category)}</Text>

              <Text style={detailLabel}>Impact</Text>
              <Text style={detailValue}>{formatLabel(feedback.impact)}</Text>

              <Text style={detailLabel}>Contact OK?</Text>
              <Text style={detailValue}>
                {feedback.allowContact ? 'Yes' : 'No'}
              </Text>
            </Section>

            <Section style={messageSection}>
              <Text style={messageHeading}>Message</Text>
              {messageLines.length > 0 ? (
                messageLines.map((line, index) => (
                  <Text key={index} style={messageLine}>
                    {line}
                  </Text>
                ))
              ) : (
                <Text style={messageLineMuted}>No message provided.</Text>
              )}
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this email because you enabled beta feedback
              notifications.
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

function formatLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
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

const detailsCard = {
  backgroundColor: '#0f172a',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '24px',
  marginBottom: '32px'
}

const detailLabel = {
  color: '#9ca3af',
  fontSize: '13px',
  letterSpacing: '0.02em',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px'
}

const detailValue = {
  color: '#e5e7eb',
  fontSize: '16px',
  margin: '0 0 16px'
}

const messageSection = {
  backgroundColor: '#111827',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  padding: '24px'
}

const messageHeading = {
  color: '#d1d5db',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px'
}

const messageLine = {
  color: '#e5e7eb',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 12px'
}

const messageLineMuted = {
  color: '#9ca3af',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0'
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
