'use client'

import { QuoteDownIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Creator',
      company: 'TechFlow Media',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      content:
        'This AI transcription service has completely transformed my workflow. The accuracy is incredible, and it saves me hours every week. The real-time feature is a game-changer for live content creation.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CEO',
      company: 'InnovateLabs',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      content:
        "We've been using this for all our team meetings and client calls. The multi-language support is outstanding, and the API integration was seamless. Our productivity has increased by 40%."
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Research Director',
      company: 'University of Technology',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      content:
        "As a researcher, accuracy is everything. This platform delivers 99.9% accuracy even with complex scientific terminology. It's become an essential tool for our research documentation."
    },
    {
      name: 'James Thompson',
      role: 'Podcast Producer',
      company: 'AudioVision Studios',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      content:
        'The batch processing feature is phenomenal. I can upload hours of audio and get perfect transcripts in minutes. The speaker identification feature is incredibly accurate too.'
    },
    {
      name: 'Lisa Park',
      role: 'Marketing Director',
      company: 'Global Dynamics',
      avatar:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      content:
        'The enterprise features are exactly what we needed. Custom integrations, dedicated support, and the security compliance give us complete confidence. Highly recommended for any serious business.'
    },
    {
      name: 'Alex Kumar',
      role: 'Freelance Journalist',
      company: 'Independent',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      content:
        'The free tier is perfect for getting started, and the Pro plan offers incredible value. The transcription quality is consistently excellent, even with noisy environments or multiple speakers.'
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const animateTransition = useCallback((callback: () => void) => {
    setIsAnimating(true)
    setTimeout(() => {
      callback()
      setTimeout(() => setIsAnimating(false), 150)
    }, 150)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      animateTransition(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, animateTransition])

  const nextTestimonial = () => {
    animateTransition(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    })
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    animateTransition(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      )
    })
    setIsAutoPlaying(false)
  }

  const goToTestimonial = (index: number) => {
    if (index === currentIndex) return
    animateTransition(() => {
      setCurrentIndex(index)
    })
    setIsAutoPlaying(false)
  }

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight mb-6">
          Trusted by Professionals Worldwide
        </h2>
        <p className="text-xl text-[#03b3c3]/90 leading-relaxed max-w-2xl mx-auto">
          Join thousands of satisfied users who rely on our AI transcription for
          their most important work.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="relative">
          <div className="bg-transparent backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 min-h-[400px] flex flex-col justify-center transition-all duration-500">
            <div
              className={`flex flex-col h-full transition-all duration-300 ${
                isAnimating
                  ? 'opacity-0 transform translate-y-4 scale-95'
                  : 'opacity-100 transform translate-y-0 scale-100'
              }`}
            >
              <div className="mb-6">
                <HugeiconsIcon icon={QuoteDownIcon} color="#03b3c3" size={30} />
              </div>

              <div className="flex-1 mb-8">
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
                  "{testimonials[currentIndex].content}"
                </p>
              </div>

              <div className="flex items-center gap-1 mb-6">
                {Array.from(
                  { length: testimonials[currentIndex].rating },
                  (_, i) => (
                    <Star
                      key={`${testimonials[currentIndex].name}-star-${i}`}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  )
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#03b3c3]/30 hover:ring-[#03b3c3] transition-all duration-300">
                  <Image
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {testimonials[currentIndex].role}
                  </p>
                  <p className="text-[#03b3c3] text-sm font-medium">
                    {testimonials[currentIndex].company}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-[#05050a] border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-[#05050a] border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((testimonial, index) => (
            <button
              key={`dot-${testimonial.name}`}
              type="button"
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#03b3c3] scale-125'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
          >
            {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
          </button>
        </div>
      </div>
    </section>
  )
}
