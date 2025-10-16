'use client'

import { AudioLines, Github, Linkedin, Mail, Twitter, Zap } from 'lucide-react'
import Link from 'next/link'

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'API', href: '/api' },
    { name: 'Integrations', href: '/integrations' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Press', href: '/press' }
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Support', href: '/support' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Status', href: '/status' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' }
  ]
}

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/vocalapp', icon: Twitter },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/vocalapp',
    icon: Linkedin
  },
  { name: 'GitHub', href: 'https://github.com/vocalapp', icon: Github },
  { name: 'Email', href: 'mailto:hello@vocal.app', icon: Mail }
]

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-transparent backdrop-blur-xl">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <AudioLines className="w-8 h-8 text-[#03b3c3]" />
              <span className="text-2xl font-bold text-[#e5e5e5] font-['Satoshi']">
                vocal.app
              </span>
            </div>
            <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-sm">
              Transform any audio into precise text with cutting-edge AI. The
              best speech-to-text experience you'll ever have.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-['Satoshi']">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-[#03b3c3] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-['Satoshi']">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-[#03b3c3] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-['Satoshi']">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-[#03b3c3] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-['Satoshi']">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-[#03b3c3] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Trust Badges */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-6">
              <span className="text-gray-300 font-medium font-['Satoshi']">
                Follow us:
              </span>
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="p-2 bg-white/5 border border-white/20 rounded-lg text-gray-300 hover:text-[#03b3c3] hover:border-[#03b3c3]/50 transition-all duration-300 transform hover:scale-110"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#03b3c3]" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#d856bf]" />
                <span>GDPR Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#c247ac]" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-transparent backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 vocal.app. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Made with ❤️ for creators worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
