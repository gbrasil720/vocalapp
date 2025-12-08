'use client'

import {
  CloudIcon,
  CpuIcon,
  LinkSquare02Icon,
  StarIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const partners = [
  {
    name: 'CloudScale AI',
    category: 'AI Infrastructure',
    description:
      'Powering our neural network processing with cutting-edge GPU clusters for blazing-fast transcription.',
    icon: CpuIcon
  },
  {
    name: 'SecureVault',
    category: 'Cloud Security',
    description:
      'Enterprise-grade encryption and compliance ensuring your audio data remains private and protected.',
    icon: CloudIcon
  },
  {
    name: 'WorkflowHub',
    category: 'Integrations',
    description:
      'Seamless connections to your favorite tools—Notion, Slack, Zapier, and 100+ other platforms.',
    icon: LinkSquare02Icon
  }
]

export function Partners() {
  return (
    <section className="relative z-10 py-20 px-6" id="partners">
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#d856bf]/10 border border-[#d856bf]/30 rounded-full px-4 py-2 mb-6">
          <HugeiconsIcon icon={StarIcon} color="#d856bf" size={18} />
          <span className="text-sm font-medium text-[#d856bf]">
            Trusted Technology Stack
          </span>
        </div>
        <h2 className="font-['Satoshi'] text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
          Powered by Industry Leaders
        </h2>
        <p className="text-xl text-primary/90 leading-relaxed max-w-2xl mx-auto">
          We partner with best-in-class technology providers to deliver
          enterprise-grade transcription at scale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#03b3c3]/40 hover:shadow-lg hover:shadow-[#03b3c3]/10 group"
          >
            <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#03b3c3]/20 to-[#d856bf]/10 border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <HugeiconsIcon icon={partner.icon} color="#03b3c3" size={28} />
            </div>
            <div className="mb-2">
              <span className="text-xs font-semibold text-[#d856bf] uppercase tracking-wider">
                {partner.category}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              {partner.name}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {partner.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-[#03b3c3]/10 via-transparent to-[#d856bf]/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center">
          <p className="text-lg text-gray-300 mb-2">
            Want to become a technology partner?
          </p>
          <p className="text-sm text-gray-500">
            We're always looking to integrate with tools that help our users
            work smarter.
          </p>
          <a
            href="mailto:partnerships@vocalapp.io"
            className="inline-flex items-center gap-2 mt-6 px-8 py-3 rounded-full bg-transparent border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  )
}
