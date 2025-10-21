'use client'

import { AudioLines } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d856bf] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#03b3c3] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#c247ac] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full border-2 border-[#03b3c3]/30 animate-ping" />

          <div className="absolute w-24 h-24 rounded-full border-2 border-[#c247ac]/40 animate-pulse" />

          <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-[#d856bf] to-[#03b3c3] flex items-center justify-center animate-pulse">
            <div className="w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-full bg-black flex items-center justify-center">
              <AudioLines className="w-10 h-10 text-[#03b3c3]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
