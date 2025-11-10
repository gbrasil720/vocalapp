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
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'About Vocal',
  description:
    'Learn why we are building Vocal and how our closed beta is shaping the future of voice-driven workflows.'
}

export default function AboutPage() {
  return (
    <div className="relative z-10 py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-12 text-gray-200">
        <header className="space-y-4">
          <Badge className="gap-2 rounded-full border-[#03b3c3]/30 bg-[#03b3c3]/10 px-4 py-1 text-sm font-semibold text-[#03b3c3]">
            Behind the scenes
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            About Vocal
          </h1>
          <p className="text-lg text-gray-300">
            Vocal exists to make transcription fast, accurate, and accessible to
            every creator. We’re a small team exploring what happens when
            AI-native tooling meets human-first design.
          </p>
        </header>

        <div className="space-y-6">
          <Card className="p-8">
            <CardHeader className="space-y-3">
              <CardTitle>Why a closed beta?</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                We’re focused on building with intention, which means shipping
                features alongside the people who rely on them each day. The
                closed beta gives us space to learn from real teams, respond
                quickly, and keep things reliable before we invite everyone in.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-8">
            <CardHeader className="space-y-3">
              <CardTitle>How we’re building</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div className="space-y-4">
                <p>
                  Transparent roadmap and changelog updates shared with our
                  testers
                </p>
                <Separator className="bg-white/10" />
                <p>
                  Open-source core that welcomes new contributors and community
                  stewarding
                </p>
                <Separator className="bg-white/10" />
                <p>
                  Privacy-by-design infrastructure backed by modern compliance
                  standards
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-8">
            <CardHeader className="space-y-3">
              <CardTitle>Join the journey</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Want to help shape what we’re building? Join the waitlist,
                contribute on GitHub, or drop us a note. We’re always excited to
                hear from people who care about making voice more useful.
              </CardDescription>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button
                asChild
                className="rounded-full bg-[#810081] px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-[#810081]/90"
              >
                <a href="#waitlist">Join the waitlist</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/20 px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10"
              >
                <a href="https://github.com/gbrasil720/vocalapp">
                  Visit our GitHub
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>

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
