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
    question: 'Who can join the closed beta?',
    answer:
      'Right now we’re onboarding teams from our waitlist who have active transcription workflows and are willing to give regular feedback. If that sounds like you, request access through the waitlist and we’ll reach out.'
  },
  {
    question: 'How long does it take to get approved?',
    answer:
      'We review new requests every Friday. You’ll get an email letting you know if you’re approved for the next cohort or if we need additional details to prioritize your team.'
  },
  {
    question: 'What features are available during beta?',
    answer:
      'Closed beta users get early access to our core transcription engine, real-time streaming, and collaboration tools. Some enterprise features are still in development, so we’ll invite you to try them as they unlock.'
  },
  {
    question: 'Is there a cost to participate?',
    answer:
      'Access is free during the closed beta. We’ll share pricing options ahead of general availability so you can plan ahead—no charges will be made without your opt-in.'
  },
  {
    question: 'How should I share feedback or report issues?',
    answer:
      'Every beta workspace includes an in-app feedback panel and a direct line to our product team. You can also reply to any onboarding email and we’ll jump into a call if needed.'
  },
  {
    question: 'Can I invite my teammates?',
    answer:
      'Yes! Each beta account can add up to five teammates so you can test real workflows. Just send us their emails when you’re approved and we’ll arrange access.'
  }
]

export function FAQ() {
  return (
    <section className="relative z-10 py-20 px-6">
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-xl text-[#03b3c3]/90 leading-relaxed max-w-2xl mx-auto">
          The essentials for teams joining our closed beta. Still curious?{' '}
          <span className="text-[#d856bf] cursor-pointer hover:underline">
            Reply to your invite email
          </span>{' '}
          and we’ll help out personally.
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

      <div className="text-center mt-16">
        <div className="bg-transparent backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4 font-['Satoshi']">
            Still have questions?
          </h3>
          <p className="text-gray-300 mb-6">
            We’re building the beta with you—let us know what you need next.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/feedback"
              className="px-8 py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white font-semibold rounded-full hover:from-[#c247ac] hover:to-[#d856bf] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#d856bf]/25"
            >
              Join the Conversation
            </Link>
            <button
              type="button"
              className="px-8 py-3 bg-transparent border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            >
              Join the Waitlist
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
