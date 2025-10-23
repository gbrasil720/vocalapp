'use client'

import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface CustomAudioPlayerProps {
  src: string
  mimeType: string
}

export function CustomAudioPlayer({ src, mimeType }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isDragging])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
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

      <div className="flex flex-col gap-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            className="relative h-3 bg-white/10 rounded-full cursor-pointer group"
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
            {/* Progress Fill with Gradient */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#03b3c3] via-[#c247ac] to-[#d856bf] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />

            {/* Progress Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 10px)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#03b3c3] to-[#d856bf] rounded-full blur-md opacity-50" />
            </div>
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-start gap-6">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] hover:scale-110 transition-transform shadow-lg relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            {isPlaying ? (
              <Pause
                className="w-6 h-6 text-white relative z-10"
                fill="white"
              />
            ) : (
              <Play
                className="w-6 h-6 text-white relative z-10 ml-1"
                fill="white"
              />
            )}
          </button>

          {/* Volume Controls */}
          <div className="flex items-center gap-3 w-64 flex-shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-white/5 transition-colors flex-shrink-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              )}
            </button>

            {/* Volume Slider */}
            <div className="relative flex-1 h-2 bg-white/10 rounded-full">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#03b3c3] to-[#c247ac] rounded-full"
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

          {/* Separator */}
          <div className="hidden lg:block h-8 w-px bg-white/10" />

          {/* Waveform Visualization */}
          <div className="hidden lg:flex items-center gap-1 flex-1 max-w-md">
            {[...Array(20)].map((_, i) => {
              const height = Math.floor(Math.random() * 20 + 10)
              const animDuration = (Math.random() * 1 + 0.5).toFixed(2)
              return (
                <div
                  key={`wave-${i}-${height}`}
                  className={`w-1 rounded-full transition-all ${
                    isPlaying && i < progress / 5
                      ? 'bg-gradient-to-t from-[#03b3c3] to-[#d856bf]'
                      : 'bg-white/20'
                  }`}
                  style={{
                    height: `${height}px`,
                    animation: isPlaying
                      ? `pulse ${animDuration}s ease-in-out infinite`
                      : 'none'
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
