import type { Metadata } from 'next'
import Link from 'next/link'
import { FeedbackForm } from '@/components/forms/feedback-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Beta Feedback',
  description:
    'Share your experience with Vocal beta and help us build the roadmap together.',
  robots: {
    index: false
  }
}

const helperCards = [
  {
    title: 'Check release notes',
    description:
      'We publish a short changelog on the dashboard home every Friday. See what shipped before sending your idea.',
    label: 'View dashboard',
    href: '/dashboard'
  },
  {
    title: 'Need a deeper dive?',
    description:
      'If something is blocking your team, reply to any onboarding email or drop us a note—we’ll set up a quick call.',
    label: 'Email the team',
    href: 'mailto:hello@vocalapp.ai?subject=Beta%20support'
  }
]

export default function FeedbackPage() {
  return (
    <div className="relative z-10 py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-12 text-gray-200">
        <header className="space-y-3">
          <Badge className="gap-2 rounded-full border-[#03b3c3]/30 bg-[#03b3c3]/10 px-4 py-1 text-sm font-semibold text-[#03b3c3]">
            Closed beta feedback
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Help us build the roadmap
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Send feedback without leaving the dashboard. We review every
            submission, tag it in the roadmap, and keep you updated as it makes
            progress.
          </p>
        </header>

        <FeedbackForm />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helperCards.map((card) => (
            <Card
              key={card.title}
              className="p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <CardHeader className="space-y-3">
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/20 px-5 py-2 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
                >
                  <Link href={card.href}>{card.label}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}
