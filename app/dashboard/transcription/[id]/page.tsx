'use client'

import {
  ArrowLeft,
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
import { isMobileDevice } from '@/lib/utils'

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
  createdAt: Date
  completedAt: Date | null
}

export default function TranscriptionDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = authClient.useSession()

  const [isMobile, setIsMobile] = useState(false)
  const [transcription, setTranscription] = useState<TranscriptionData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const response = await fetch(`/api/transcriptions/${id}`)
        if (response.ok) {
          const data = await response.json()
          setTranscription(data.transcription)

          // If still processing, continue polling
          if (data.transcription.status === 'processing') {
            setPolling(true)
          } else {
            setPolling(false)
          }
        } else if (response.status === 404) {
          toast.error('Transcription not found')
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

  // Check if user has Pro subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user) return

      try {
        const response = await fetch('/api/user/subscription')
        if (response.ok) {
          const data = await response.json()
          setIsPro(data.isPro || false)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      }
    }

    checkSubscription()
  }, [session])

  // Poll for updates if processing
  useEffect(() => {
    if (!polling) return

    const fetchUpdate = async () => {
      try {
        const response = await fetch(`/api/transcriptions/${id}`)
        if (response.ok) {
          const data = await response.json()
          setTranscription(data.transcription)

          if (data.transcription.status !== 'processing') {
            setPolling(false)
          }
        }
      } catch (err) {
        console.error('Error polling transcription:', err)
      }
    }

    const interval = setInterval(fetchUpdate, 5000)
    return () => clearInterval(interval)
  }, [polling, id])

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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Transcription not found</p>
      </div>
    )
  }

  return (
    <>
      {/* Background Animation */}
      {!isMobile && (
        <div className="fixed inset-0 z-0 opacity-40">
          <MemoizedHyperspeed />
        </div>
      )}

      <div className="relative min-h-screen z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">
                  {transcription.fileName}
                </h1>
                <p className="text-sm text-gray-400">
                  {new Date(transcription.createdAt).toLocaleDateString()}
                </p>
              </div>
              {transcription.status === 'completed' && (
                <button
                  type="button"
                  onClick={downloadTranscription}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white font-semibold hover:scale-105 transition-transform"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Card */}
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
                        ? 'Your transcription is being processed...'
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
            {/* File Info */}
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

            {/* Language & Credits */}
            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-[#c247ac]" />
                <h3 className="font-semibold text-white">Transcription Info</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Language</p>
                  <p className="text-white font-medium capitalize">
                    {transcription.language || 'Auto-detected'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Credits Used</p>
                  <p className="text-white font-medium">
                    {transcription.creditsUsed || 'N/A'} credits
                  </p>
                </div>
              </div>
            </SpotlightCard>

            {/* Date Info */}
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

          {/* Transcription Text */}
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
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {transcription.text}
                  </p>
                </div>
              </SpotlightCard>
            </div>
          )}

          {/* Audio Player */}
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
                isPro={isPro}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
