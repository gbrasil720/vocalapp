'use client'

import {
  generateOrganizationSchema,
  generateWebApplicationSchema,
  generateFAQSchema
} from '@/lib/seo'

const faqData = [
  {
    question: 'How accurate is the speech-to-text transcription?',
    answer:
      'Our AI-powered transcription service delivers 99.9% accuracy for clear audio. We use advanced machine learning models trained on millions of audio samples to ensure the highest quality transcription for your content.'
  },
  {
    question: 'What file formats do you support?',
    answer:
      'We support all major audio and video formats including MP3, WAV, MP4, MOV, AVI, and more. You can also record directly in our web interface or upload files up to 2GB in size.'
  },
  {
    question: 'How many languages can you transcribe?',
    answer:
      'We support over 50 languages and dialects including English, Spanish, French, German, Chinese, Japanese, Arabic, and many more. Our AI automatically detects the language for seamless transcription.'
  },
  {
    question: 'Is my data secure and private?',
    answer:
      "Absolutely. We use enterprise-grade encryption for all data transmission and storage. Your files are processed securely and automatically deleted after transcription unless you choose to store them. We're SOC 2 compliant and GDPR ready."
  },
  {
    question: "Can I edit the transcription after it's generated?",
    answer:
      'Yes! Our transcription editor allows you to make real-time edits, add speaker labels, timestamps, and export in multiple formats including SRT, VTT, TXT, and DOCX.'
  },
  {
    question: 'Do you offer real-time transcription?',
    answer:
      'Yes, our Pro and Enterprise plans include real-time transcription capabilities. Perfect for live events, meetings, webinars, and interviews with instant text output.'
  },
  {
    question: "What's the difference between the free and paid plans?",
    answer:
      'The free plan includes 100 hours/month with basic features. Paid plans offer unlimited usage, real-time transcription, API access, priority support, and advanced features like speaker identification and custom vocabulary.'
  },
  {
    question: 'How fast is the transcription process?',
    answer:
      'Most transcriptions are completed in under 2 minutes for a 1-hour audio file. Real-time transcription provides instant results as you speak, making it perfect for live events and meetings.'
  },
  {
    question: 'Can I integrate this with my existing workflow?',
    answer:
      'Yes! We offer API access, webhooks, and integrations with popular tools like Zoom, Google Meet, Slack, Notion, and Zapier. Custom integrations are available for Enterprise customers.'
  },
  {
    question: "Do you offer refunds if I'm not satisfied?",
    answer:
      "We offer a 14-day free trial for all paid plans. If you're not completely satisfied within the first 30 days, we'll provide a full refund, no questions asked."
  }
]

export function StructuredData() {
  const organizationSchema = generateOrganizationSchema()
  const webAppSchema = generateWebApplicationSchema()
  const faqSchema = generateFAQSchema(faqData)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webAppSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
    </>
  )
}



