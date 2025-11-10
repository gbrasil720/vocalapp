import { ArrowLeft, Megaphone, Route, Sparkles } from 'lucide-react'
import Link from 'next/link'

const adminSections = [
  {
    title: 'Changelog Manager',
    description:
      'Create and schedule release notes to keep beta testers up to date.',
    href: '/admin/changelog',
    icon: Sparkles
  },
  {
    title: 'Roadmap Manager',
    description:
      'Plan, prioritize, and publish roadmap entries as initiatives evolve.',
    href: '/admin/roadmap',
    icon: Route
  },
  {
    title: 'Waitlist Approvals',
    description:
      'Review waitlist submissions and control who gets beta access.',
    href: '/admin/waitlist',
    icon: Megaphone
  }
]

export default function AdminPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(3,179,195,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_70%,rgba(216,86,191,0.1),transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-3 text-3xl font-bold text-white">
              Admin Control Center
            </h1>
            <p className="max-w-2xl text-gray-400">
              Navigate between the beta tooling areas. Each space is tailored to
              help keep testers informed and ensure a smooth rollout.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {adminSections.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-transform hover:-translate-y-1 hover:border-white/25 hover:bg-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <Icon className="h-10 w-10 text-[#03b3c3] group-hover:text-[#d856bf]" />
              <h2 className="mt-6 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm text-gray-400">{description}</p>
              <span className="mt-6 inline-flex items-center text-sm font-medium text-[#03b3c3] group-hover:text-[#d856bf]">
                Open
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
