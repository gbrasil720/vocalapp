'use client'

import { AudioWave01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Calendar,
  Check,
  Copy,
  Download,
  FileAudio,
  FileText,
  Globe,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CustomAudioPlayer } from '@/components/custom-audio-player'
import { ExpiredAudioMessage } from '@/components/expired-audio-message'
import { LoadingScreen } from '@/components/loading-screen'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import SpotlightCard from '@/components/SpotlightCard'
import { authClient } from '@/lib/auth-client'
import { getLanguageName } from '@/lib/utils'

interface TranscriptionData {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl: string | null
  duration: number | null
  language: string | null
  status: 'processing' | 'completed' | 'failed'
  text: string | null
  creditsUsed: number | null
  errorMessage: string | null
  metadata: unknown
  isPublic: boolean
  createdAt: Date
  completedAt: Date | null
  user: {
    name: string | null
    email: string
    image: string | null
  } | null
}

export default function SharedTranscriptionPage() {
  const params = useParams()
  const id = params.id as string

  const [transcription, setTranscription] = useState<TranscriptionData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const { data: session } = authClient.useSession()

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const response = await fetch(`/api/transcriptions/${id}`, {
          cache: 'no-store'
        })
        if (response.ok) {
          const data = await response.json()
          setTranscription(data.transcription)
        } else if (response.status === 404) {
          // toast.error('Transcription not found')
        } else if (response.status === 401) {
          // toast.error('This transcription is private')
        }
      } catch (err) {
        console.error('Error fetching transcription:', err)
        toast.error('Failed to load transcription')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscription()
  }, [id])

  const copyToClipboard = async () => {
    if (transcription?.text) {
      try {
        await navigator.clipboard.writeText(transcription.text)
        toast.success('Copied to clipboard!')
      } catch {
        toast.error('Failed to copy')
      }
    }
  }

  const downloadTranscription = () => {
    if (transcription?.text) {
      const blob = new Blob([transcription.text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${transcription.fileName.replace(/\.[^/.]+$/, '')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Downloaded!')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!transcription) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-40">
          <MemoizedHyperspeed />
        </div>
        <div className="z-10 w-full max-w-md px-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 backdrop-blur-xl text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileAudio className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Transcription Unavailable
            </h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              We couldn't find the transcription you're looking for. It might have been deleted, made private by the owner, or the link is incorrect.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Go to Homepage
              </Link>
              {session ? (
                <Link
                  href="/dashboard"
                  className="block w-full py-3 px-4 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="block w-full py-3 px-4 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Create Free Account
                </Link>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-xs text-gray-500">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }



  return (
    <>
      <div className="fixed inset-0 z-0 opacity-40">
        <MemoizedHyperspeed />
      </div>

      <div className="relative min-h-screen z-10">
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Link
                  href="/"
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <HugeiconsIcon icon={AudioWave01Icon} color="#03b3c3" size={22} />
                  <p className="font-['Satoshi'] font-medium text-lg sm:text-xl text-white">
                    vocalapp
                  </p>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-white truncate">
                    {transcription.fileName}
                  </h1>
                  <p className="text-xs text-gray-400">
                    Shared by <span className="capitalize">{transcription.user?.name || transcription.user?.email || 'Unknown'}</span> via VocalApp
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {transcription.status === 'completed' && (
                  <button
                    type="button"
                    onClick={downloadTranscription}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                )}
                {!session && (
                  <Link
                    href="/sign-up"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white font-semibold hover:scale-105 transition-transform"
                  >
                    Get Started
                  </Link>
                )}
                {session && (
                   <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!session && (
            <div className="mb-8">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 rounded-full bg-blue-500/20">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-blue-400 font-semibold mb-1">
                      Viewing as Guest
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      You are viewing a public transcription. Create a free account to transcribe your own audio files, save them, and share with others!
                    </p>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 text-sm font-medium rounded-lg transition-all"
                    >
                      Create Free Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      transcription.status === 'completed'
                        ? 'bg-green-400/20'
                        : transcription.status === 'processing'
                          ? 'bg-[#d856bf]/20'
                          : 'bg-red-400/20'
                    }`}
                  >
                    {transcription.status === 'completed' ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : transcription.status === 'processing' ? (
                      <Loader2 className="w-6 h-6 text-[#d856bf] animate-spin" />
                    ) : (
                      <FileText className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white capitalize">
                      {transcription.status}
                    </p>
                    <p className="text-sm text-gray-400">
                      {transcription.status === 'processing'
                        ? 'This transcription is being processed...'
                        : transcription.status === 'completed'
                          ? 'Transcription completed successfully'
                          : `Error: ${transcription.errorMessage}`}
                    </p>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <FileAudio className="w-5 h-5 text-[#03b3c3]" />
                <h3 className="font-semibold text-white">File Details</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Size</p>
                  <p className="text-white font-medium">
                    {formatFileSize(transcription.fileSize)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="text-white font-medium">
                    {transcription.mimeType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="text-white font-medium">
                    {formatDuration(transcription.duration)}
                  </p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-[#c247ac]" />
                <h3 className="font-semibold text-white">Transcription Info</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Language</p>
                  <p className="text-white font-medium">
                    {transcription.language ? getLanguageName(transcription.language) : 'Auto-detected'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Created</p>
                  <p className="text-white font-medium">
                    {new Date(transcription.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-[#d856bf]" />
                <h3 className="font-semibold text-white">Timeline</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Created</p>
                  <p className="text-white font-medium">
                    {new Date(transcription.createdAt).toLocaleString()}
                  </p>
                </div>
                {transcription.completedAt && (
                  <div>
                    <p className="text-gray-400">Completed</p>
                    <p className="text-white font-medium">
                      {new Date(transcription.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </SpotlightCard>
          </div>

          {transcription.status === 'completed' && transcription.text && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Transcription</h2>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-white hover:bg-white/5 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <div className="p-6">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                    {transcription.text}
                  </div>
                </div>
              </SpotlightCard>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Audio Playback
            </h2>
            {transcription.fileUrl ? (
              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <CustomAudioPlayer
                  src={transcription.fileUrl}
                  mimeType={transcription.mimeType}
                />
              </SpotlightCard>
            ) : (
              <ExpiredAudioMessage
                createdAt={transcription.createdAt}
                isPro={false} 
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
