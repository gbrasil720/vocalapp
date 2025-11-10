import type { Metadata } from 'next'
import Link from 'next/link'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Find quick answers, beta onboarding tips, and ways to reach the Vocal team.'
}

const faqItems = [
  {
    question: 'How do I join the closed beta?',
    answer:
      'Add your team to the waitlist from our homepage. We review new applications every Friday and follow up via email when a slot opens.'
  },
  {
    question: 'Where do I share product feedback?',
    answer:
      'Use the in-app feedback panel or open a GitHub issue if you prefer. We read everything and respond within two business days.'
  },
  {
    question: 'Is there a public roadmap?',
    answer:
      'Yes! Once you are in the beta you’ll receive a link to our roadmap board so you can track what we’re exploring next.'
  }
]

export default function HelpPage() {
  return (
    <div className="relative z-10 py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-12 text-gray-200">
        <header className="space-y-4">
          <Badge className="mx-auto w-fit gap-2 rounded-full border-[#03b3c3]/30 bg-[#03b3c3]/10 px-4 py-1 text-sm font-semibold text-[#03b3c3]">
            Help Center
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            How can we help?
          </h1>
          <p className="text-lg text-gray-300">
            If you’re already in the beta, you have a direct line to us. If
            you’re waiting to get in, here’s how to stay in the loop and prep
            your team.
          </p>
        </header>

        <section>
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`item-${index}`}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-transform duration-300 data-[state=open]:border-white/20 data-[state=open]:shadow-lg"
              >
                <AccordionTrigger className="px-6 py-5 text-left text-2xl font-semibold text-white hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-gray-300">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="rounded-3xl border border-white/10 bg-transparent p-8 text-center backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Still need a hand?
          </h2>
          <p className="text-gray-300 mb-6">
            Ping us at{' '}
            <a
              href="mailto:hello@vocalapp.ai"
              className="text-[#03b3c3] hover:underline"
            >
              hello@vocalapp.io
            </a>{' '}
            or jump into our GitHub discussions to reach the team and community
            maintainers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/20 px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
            >
              <a href="https://github.com/gbrasil720/vocalapp/issues">
                Open an issue
              </a>
            </Button>
          </div>
        </section>

        <div className="flex justify-center pt-8">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/15 px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
          >
            <Link href="/">← Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
