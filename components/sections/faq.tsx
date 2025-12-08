'use client'

import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

const faqData = [
  {
    question: 'How accurate is the transcription?',
    answer:
      'Our AI-powered transcription delivers industry-leading accuracy of over 95% for clear audio. The system continuously learns and improves, handling accents, industry terminology, and multiple speakers with ease.'
  },
  {
    question: 'What audio formats are supported?',
    answer:
      'We support all major audio and video formats including MP3, M4A, WAV, WEBM, FLAC, OGG, and MP4. Simply upload your file and our system handles the rest—no conversion needed.'
  },
  {
    question: 'How does the credit system work?',
    answer:
      "1 credit equals 1 minute of transcription. You receive 30 free credits when you sign up, and you can purchase credit packs anytime—they never expire. No monthly subscription required unless you want one."
  },
  {
    question: 'What languages do you support?',
    answer:
      'We support over 50 languages and dialects including English, Spanish, French, German, Portuguese, Mandarin, Japanese, Arabic, and many more. Our AI automatically detects the spoken language.'
  },
  {
    question: 'How long does transcription take?',
    answer:
      'Most transcriptions complete in real-time or faster! A 10-minute audio file typically processes in under 2 minutes. You can upload multiple files and work on other tasks while we process them.'
  },
  {
    question: 'Is my audio data secure?',
    answer:
      "Absolutely. We use enterprise-grade encryption for all uploads and storage. Your audio files are automatically deleted after your chosen retention period (7 days for free, 90 days for Pro). We never use your data to train our models."
  }
]

export function FAQ() {
  return (
    <section className="relative z-10 py-16 md:py-20 px-6 md:px-6">
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <h2 className="font-['Satoshi'] text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-xl text-primary/90 leading-relaxed max-w-2xl mx-auto">
          Everything you need to know about getting started.{' '}
          <Link
            href="/support"
            className="text-[#d856bf] cursor-pointer hover:underline"
          >
            Contact support
          </Link>{' '}
          if you need more help.
        </p>
      </div>

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
              className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl px-6 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-[#03b3c3]/10"
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

      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-[#03b3c3]/10 via-transparent to-[#d856bf]/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4 font-['Satoshi']">
            Ready to get started?
          </h3>
          <p className="text-gray-300 mb-6">
            Join our waitlist for early access and exclusive launch pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#waitlist"
              className="px-8 py-3 bg-[#d856bf] text-white font-semibold rounded-full hover:bg-[#d856bf]/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#d856bf]/25"
            >
              Join the Waitlist
            </Link>
            <Link
              href="/support"
              className="px-8 py-3 bg-transparent border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
