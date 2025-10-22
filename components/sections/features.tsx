import {
  AiBrain05Icon,
  DocumentAttachmentIcon,
  EarthIcon,
  Tick02Icon,
  UserIcon,
  ZapIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Brain, Check, FileText, Globe, User, Zap } from 'lucide-react'
import SpotlightCard from '../SpotlightCard'

export function Features() {
  return (
    <section className="relative z-10 py-20 px-6" id="features">
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight mb-6">
          Elevate Your Productivity with Precision
        </h2>
        <p className="text-xl text-[#03b3c3]/90 leading-relaxed max-w-2xl mx-auto">
          Unlock the power of enterprise-grade AI transcription that transforms
          audio into actionable insights, delivering unmatched accuracy and
          speed for modern professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
        <SpotlightCard className="md:col-span-2 lg:row-span-2 bg-transparent backdrop-blur-xl">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-[#E5E5E5]">
                  {/* <Zap className="w-6 h-6 text-[#1F1F1F]" /> */}
                  <HugeiconsIcon icon={ZapIcon} color="#1f1f1f" size={22} />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  AI Powered Transcription
                </h2>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                Experience lightning-fast, 100% accurate speech-to-text
                conversion powered by cutting-edge artificial intelligence.
                Transform any audio into precise text in seconds.
              </p>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#d856bf]/20 to-[#03b3c3]/20 border border-white/10">
              <p className="text-sm text-gray-400">
                "The future of transcription is here"
              </p>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-1 bg-transparent backdrop-blur-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#E5E5E5]">
                {/* <Check className="w-5 h-5 text-[#1F1F1F]" /> */}
                <HugeiconsIcon icon={Tick02Icon} color="#1f1f1f" size={22} />
              </div>
              <h3 className="text-lg font-semibold text-white">
                100% Accurate
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Industry-leading accuracy with advanced AI models trained on
              millions of audio samples.
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-1 bg-transparent backdrop-blur-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#E5E5E5]">
                {/* <User className="w-5 h-5 text-[#1F1F1F]" /> */}
                <HugeiconsIcon icon={UserIcon} color="#1f1f1f" size={22} />
              </div>
              <h3 className="text-lg font-semibold text-white">Easy to Use</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Simple drag-and-drop interface. No technical knowledge required.
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-2 lg:col-span-1 bg-transparent backdrop-blur-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#E5E5E5]">
                {/* <Globe className="w-5 h-5 text-[#1F1F1F]" /> */}
                <HugeiconsIcon icon={EarthIcon} color="#1f1f1f" size={22} />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Multi-Language
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Support for 50+ languages and dialects with automatic detection.
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-2 lg:col-span-1 bg-transparent backdrop-blur-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#E5E5E5]">
                {/* <FileText className="w-5 h-5 text-[#1F1F1F]" /> */}
                <HugeiconsIcon
                  icon={DocumentAttachmentIcon}
                  color="#1f1f1f"
                  size={22}
                />
              </div>
              <h3 className="text-lg font-semibold text-white">
                No Manual Work
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Automated transcription eliminates hours of manual typing and
              editing.
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-1 bg-transparent backdrop-blur-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#E5E5E5]">
                {/* <Brain className="w-5 h-5 text-[#1F1F1F]" /> */}
                <HugeiconsIcon icon={AiBrain05Icon} color="#1f1f1f" size={22} />
              </div>
              <h3 className="text-lg font-semibold text-white">Smart AI</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Context-aware processing understands speaker intent and nuance.
            </p>
          </div>
        </SpotlightCard>
      </div>
    </section>
  )
}
