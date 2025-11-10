import type { Metadata } from 'next'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Contact Support',
  description:
    'Reach the Vocal team for beta access questions, billing help, or technical issues.'
}

export default function SupportPage() {
  return (
    <div className="relative z-10 py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-12 text-gray-200">
        <header className="space-y-4">
          <Badge className="gap-2 rounded-full border-[#d856bf]/30 bg-[#d856bf]/10 px-4 py-1 text-sm font-semibold text-[#d856bf]">
            Need assistance?
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Contact Support
          </h1>
          <p className="text-lg text-gray-300">
            We’re here to help current and future beta testers stay productive.
            Choose the path that matches what you need.
          </p>
        </header>

        <section className="grid gap-6">
          <Card className="p-8">
            <CardHeader className="space-y-3">
              <CardTitle>Beta onboarding questions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Waiting for access or need to update your details? Reply to any
                waitlist email or send a note to{' '}
                <a
                  href="mailto:hello@vocalapp.io"
                  className="text-[#03b3c3] hover:underline"
                >
                  hello@vocalapp.io
                </a>{' '}
                and we’ll get back to you within two business days.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-8">
            <CardHeader className="space-y-3">
              <CardTitle>Bug reports &amp; feature requests</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Found something unexpected or want to see a new workflow? Head
                to our GitHub repository to open an issue or contribute a fix—we
                tag good first issues and roadmap priorities.
              </CardDescription>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button
                asChild
                className="rounded-full bg-[#810081] px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-[#810081]/90"
              >
                <a href="https://github.com/gbrasil720/vocalapp/issues">
                  Open an issue
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/20 px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
              >
                <a href="https://github.com/gbrasil720/vocalapp">
                  View repository
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="p-8">
            <CardHeader className="space-y-3">
              <CardTitle>Billing or account issues</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Billing is paused during the closed beta, but if you have
                account concerns or compliance requests, let us know and we’ll
                coordinate a secure channel for any sensitive data.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-white/10 bg-transparent p-8 text-center">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">Prefer async updates?</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                We share release notes and upcoming cohort details via email.
                Join the waitlist to get updates the moment we expand access.
              </CardDescription>
            </CardContent>
            <CardFooter className="justify-center">
              <Button
                asChild
                className="rounded-full bg-[#810081] px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-[#810081]/90"
              >
                <a href="#waitlist">Join the waitlist</a>
              </Button>
            </CardFooter>
          </Card>
        </section>

        <div className="pt-8">
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
