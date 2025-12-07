'use client'

import {
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeMute01Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'

interface CustomAudioPlayerProps {
  src: string
  mimeType: string
  onTimeUpdate?: (currentTime: number) => void
}

export interface CustomAudioPlayerHandle {
  seekToTime: (time: number) => void
  play: () => void
  pause: () => void
  getCurrentTime: () => number
}

// Generate stable waveform bar properties once
const generateWaveformBars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    height: Math.floor(Math.random() * 24 + 8),
    animDelay: (Math.random() * 0.8).toFixed(2),
    animDuration: (Math.random() * 0.6 + 0.4).toFixed(2)
  }))
}

export const CustomAudioPlayer = forwardRef<
  CustomAudioPlayerHandle,
  CustomAudioPlayerProps
>(function CustomAudioPlayer({ src, mimeType, onTimeUpdate }, ref) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Memoize waveform bars to prevent glitchy re-renders
  const waveformBars = useMemo(() => generateWaveformBars(24), [])

  useImperativeHandle(ref, () => ({
    seekToTime: (time: number) => {
      const audio = audioRef.current
      if (!audio) return
      audio.currentTime = time
      setCurrentTime(time)
    },
    play: () => {
      const audio = audioRef.current
      if (!audio) return
      audio.play()
      setIsPlaying(true)
    },
    pause: () => {
      const audio = audioRef.current
      if (!audio) return
      audio.pause()
      setIsPlaying(false)
    },
    getCurrentTime: () => {
      return audioRef.current?.currentTime ?? 0
    }
  }))

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
        onTimeUpdate?.(audio.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [isDragging, onTimeUpdate])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleProgressMouseDown = () => {
    setIsDragging(true)
  }

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percentage = x / rect.width
    const newTime = percentage * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleProgressMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false)
      window.addEventListener('mouseup', handleGlobalMouseUp)
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = Number.parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
      audio.muted = false
    }
  }

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="w-full">
      <audio ref={audioRef} src={src} preload="metadata">
        <source src={src} type={mimeType} />
        <track kind="captions" />
      </audio>

      {/* Main Player Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 p-5">
        {/* Ambient Background Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#d856bf]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#03b3c3]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5">
          {/* Waveform Visualizer */}
          <div className="flex items-center justify-center gap-[3px] h-12 px-2">
            {waveformBars.map((bar) => {
              const barProgress = (bar.id / waveformBars.length) * 100
              const isPast = barProgress < progress
              
              return (
                <div
                  key={bar.id}
                  className="w-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{
                    height: isPlaying ? `${bar.height}px` : '4px',
                    background: isPast
                      ? '#d856bf'
                      : 'rgba(255, 255, 255, 0.15)',
                    animationName: isPlaying ? 'waveform' : 'none',
                    animationDuration: `${bar.animDuration}s`,
                    animationDelay: `${bar.animDelay}s`,
                    animationIterationCount: 'infinite',
                    animationTimingFunction: 'ease-in-out',
                    animationDirection: 'alternate'
                  }}
                />
              )
            })}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div
              className="relative h-2 bg-white/10 rounded-full cursor-pointer group overflow-hidden"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseUp={handleProgressMouseUp}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const syntheticEvent = {
                    currentTarget: e.currentTarget,
                    clientX: rect.left + (rect.width * currentTime) / duration
                  } as React.MouseEvent<HTMLDivElement>
                  handleProgressClick(syntheticEvent)
                }
              }}
              role="slider"
              aria-label="Audio progress"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              tabIndex={0}
            >
              <div
                className="absolute inset-y-0 left-0 bg-[#d856bf] rounded-full"
                style={{ width: `${progress}%` }}
              />
              
              {/* Glow Effect */}
              <div
                className="absolute inset-y-0 left-0 bg-[#d856bf] rounded-full blur-sm opacity-40"
                style={{ width: `${progress}%` }}
              />

              {/* Scrubber Handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-white/70 tabular-nums">{formatTime(currentTime)}</span>
              <span className="text-white/40 tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2 flex-1 max-w-[140px]">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200"
              >
                <HugeiconsIcon
                  icon={isMuted || volume === 0 ? VolumeMute01Icon : VolumeHighIcon}
                  className="w-5 h-5 text-white/60 hover:text-white transition-colors"
                />
              </button>

              <div className="relative flex-1 h-1.5 bg-white/10 rounded-full group">
                <div
                  className="absolute inset-y-0 left-0 bg-white/50 rounded-full transition-all duration-150"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Volume"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={togglePlay}
              className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#d856bf] hover:bg-[#c247ac] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-[#d856bf]/30 group"
            >
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              <HugeiconsIcon
                icon={isPlaying ? PauseIcon : PlayIcon}
                className={`w-7 h-7 text-white relative z-10 ${!isPlaying ? 'ml-1' : ''}`}
                fill="white"
              />
            </button>

            {/* Spacer for symmetry */}
            <div className="flex-1 max-w-[140px]" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes waveform {
          0% {
            transform: scaleY(0.4);
          }
          100% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  )
})

