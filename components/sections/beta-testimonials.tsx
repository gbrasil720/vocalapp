'use client'

import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Content Manager',
    company: 'MediaFlow Studios',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    quote:
      "Vocalapp has completely transformed how we handle podcast transcriptions. What used to take hours now takes minutes. The accuracy is incredible, especially with multiple speakers.",
  },
  {
    name: 'Marcus Chen',
    role: 'Legal Consultant',
    company: 'Chen & Associates',
    avatar: 'https://i.pravatar.cc/150?img=8',
    rating: 5,
    quote:
      "We transcribe dozens of client depositions weekly. The multi-language support is a game-changer for our international cases. Highly recommend for any legal professional.",
  },
  {
    name: 'Emily Rodriguez',
    role: 'Research Director',
    company: 'University of California',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    quote:
      "As an academic, I interview participants from around the world. The automatic language detection and accurate transcription have saved countless hours of manual work.",
  }
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <HugeiconsIcon
          key={`star-${rating}-${i}`}
          icon={StarIcon}
          size={16}
          color={i < rating ? '#f59e0b' : '#374151'}
          fill={i < rating ? '#f59e0b' : 'transparent'}
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section
      className="relative z-10 py-16 md:py-20 px-6 md:px-6"
      id="testimonials"
    >
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#03b3c3]/10 border border-[#03b3c3]/30 rounded-full px-4 py-2 mb-6">
          <HugeiconsIcon icon={StarIcon} color="#03b3c3" size={18} />
          <span className="text-sm font-medium text-[#03b3c3]">
            Customer Stories
          </span>
        </div>
        <h2 className="font-['Satoshi'] text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
          Loved by Professionals
        </h2>
        <p className="text-xl text-primary/90 leading-relaxed max-w-2xl mx-auto">
          See how teams across industries are saving time and improving
          productivity with Vocalapp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#d856bf]/30 hover:shadow-lg hover:shadow-[#d856bf]/10 group"
          >
            {/* Quote mark */}
            <div className="absolute top-6 right-6 text-6xl text-white/5 font-serif leading-none select-none">
              "
            </div>

            {/* Rating */}
            <div className="mb-4">
              <StarRating rating={testimonial.rating} />
            </div>

            {/* Quote */}
            <blockquote className="text-gray-300 leading-relaxed mb-6 relative z-10">
              "{testimonial.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#03b3c3]/30">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-gray-400">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
