'use client'

import { HelpCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

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

export function FAQ() {
  return (
    <section className="relative z-10 py-20 px-6">
      {/* Section Title */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-xl text-[#03b3c3]/90 leading-relaxed max-w-2xl mx-auto">
          Everything you need to know about our AI-powered transcription
          service. Can't find what you're looking for?{' '}
          <span className="text-[#d856bf] cursor-pointer hover:underline">
            Contact our support team
          </span>
          .
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-4xl mx-auto">
        <Accordion
          type="single"
          collapsible
          className="space-y-4"
          defaultValue="item-0"
        >
          {faqData.map((faq, index) => (
            <AccordionItem
              key={`faq-${faq.question.slice(0, 20)}`}
              value={`item-${index}`}
              className="bg-transparent backdrop-blur-xl border border-white/10 rounded-2xl px-6 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-[#03b3c3]/10"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-[#03b3c3] transition-colors duration-200 py-6 [&[data-state=open]]:text-[#03b3c3]">
                <span className="flex items-start gap-4">
                  <span className="text-[#d856bf] font-bold text-sm mt-1 flex-shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-['Satoshi']">{faq.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 leading-relaxed pb-6 pl-8">
                <div className="border-l-2 border-[#03b3c3]/30 pl-6 py-2">
                  <p className="font-['Inter'] text-base">{faq.answer}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <div className="bg-transparent backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4 font-['Satoshi']">
            Still have questions?
          </h3>
          <p className="text-gray-300 mb-6">
            Our support team is here to help you get the most out of our
            transcription service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              className="px-8 py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white font-semibold rounded-full hover:from-[#c247ac] hover:to-[#d856bf] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#d856bf]/25"
            >
              Contact Support
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-transparent border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            >
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
