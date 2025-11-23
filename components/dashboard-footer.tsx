export function DashboardFooter({ isBetaUser }: { isBetaUser: boolean }) {
  const helpfulLinks = [
    {
      label: 'Product Roadmap',
      href: 'https://trello.com/b/roadmap',
      description: 'Track upcoming launches and vote on the next priorities.'
    },
    {
      label: 'Changelog',
      href: 'https://trello.com/b/changelog',
      description: 'Review the latest improvements, fixes, and feature drops.'
    }
  ]

  const betaHighlights = [
    {
      title: 'Direct feedback channel',
      details: 'Share feedback with the product team and influence the roadmap.'
    },
    {
      title: 'Priority support',
      details: 'Get help with your account and transcription issues.'
    }
  ]

  return (
    <footer className="mt-16 border-t border-white/10 pt-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-2">
          <p className="text-sm uppercase tracking-wide text-[#03b3c3] mb-2">
            Stay in the loop
          </p>
          <h3 className="font-['Satoshi'] text-3xl font-semibold text-white mb-4">
            What's next for vocalapp
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl">
            Follow along as we ship faster, smarter transcription features.
            Explore the roadmap, review our changelog, and share feedback so we
            can prioritize the tools you need most.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Coming soon
              </p>
              <p className="text-white font-semibold mb-1">
                Direct video transcriptions
              </p>
              <p className="text-sm text-gray-400">
                Transcribe videos directly from YouTube, Vimeo, and other
                platforms.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Coming soon
              </p>
              <p className="text-white font-semibold mb-1">
                Smart transcripts for long sessions
              </p>
              <p className="text-sm text-gray-400">
                Automatically generate concise highlight reels for long
                sessions.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white text-lg mb-3">
            Useful Links
          </h4>
          <ul className="space-y-4">
            {helpfulLinks.map((link) => (
              <li key={link.href} className="group">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#03b3c3] group-hover:text-[#d856bf] transition-colors font-medium"
                >
                  {link.label}
                </a>
                <p className="text-sm text-gray-400">{link.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-b from-white/10 to-white/[0.03] border border-white/10 rounded-3xl p-6">
          {isBetaUser ? (
            <>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                Beta perks
              </p>
              <h4 className="font-semibold text-white text-xl mb-4">
                Thanks for testing with us!
              </h4>
              <ul className="space-y-4">
                {betaHighlights.map((perk) => (
                  <li key={perk.title}>
                    <p className="text-white font-medium">{perk.title}</p>
                    <p className="text-sm text-gray-400">{perk.details}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                Early access
              </p>
              <h4 className="font-semibold text-white text-xl mb-3">
                Join the beta program
              </h4>
              <p className="text-sm text-gray-400 mb-5">
                Get priority processing, experimental language packs, and direct
                product input.
              </p>
              <a
                href="https://trello.com/b/betaprogram"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full px-5 py-3 bg-[#03b3c3] text-sm font-semibold text-black hover:bg-[#d856bf] hover:text-white transition-colors"
              >
                Apply on Trello
              </a>
            </>
          )}
        </div>
      </div>
      <div className="mt-10 text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} vocalapp · Built with ❤️ for creators
        worldwide.
      </div>
    </footer>
  )
}
