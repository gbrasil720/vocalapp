'use client'

import {
  AlertDiamondIcon,
  ArrowLeft01Icon,
  Calendar03Icon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  FileEditIcon,
  Globe02Icon,
  Loading03Icon,
  LockPasswordIcon,
  MusicNote04Icon,
  Share01Icon,
  Tick02Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  CustomAudioPlayer,
  type CustomAudioPlayerHandle
} from '@/components/custom-audio-player'
import { ExpiredAudioMessage } from '@/components/expired-audio-message'
import {
  InteractiveTranscript,
  type TranscriptSegment
} from '@/components/interactive-transcript'
import { LoadingScreen } from '@/components/loading-screen'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import SpotlightCard from '@/components/SpotlightCard'
import { authClient } from '@/lib/auth-client'
import { useHyperspeed } from '@/lib/hyperspeed-context'
import { getElapsedTime, isTranscriptionStuck } from '@/lib/transcription-utils'
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
}

export default function TranscriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: session } = authClient.useSession()
  const { hyperspeedEnabled } = useHyperspeed()

  const [transcription, setTranscription] = useState<TranscriptionData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentAudioTime, setCurrentAudioTime] = useState(0)
  const audioPlayerRef = useRef<CustomAudioPlayerHandle>(null)

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const response = await fetch(`/api/transcriptions/${id}`)
        if (response.ok) {
          const data = await response.json()
          setTranscription(data.transcription)

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

  const togglePublic = async () => {
    if (!transcription) return

    try {
      const newIsPublic = !transcription.isPublic
      const response = await fetch(`/api/transcriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: newIsPublic })
      })

      if (response.ok) {
        setTranscription({ ...transcription, isPublic: newIsPublic })
        toast.success(
          newIsPublic
            ? 'Transcription is now public'
            : 'Transcription is now private'
        )
      } else {
        toast.error('Failed to update privacy settings')
      }
    } catch (error) {
      console.error('Error updating privacy:', error)
      toast.error('Failed to update privacy settings')
    }
  }

  const copyPublicLink = async () => {
    if (!transcription) return
    const url = `${window.location.origin}/share/${transcription.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Public link copied!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const deleteTranscription = async () => {
    if (!transcription || isDeleting) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/transcriptions/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptionIds: [transcription.id] })
      })

      if (response.ok) {
        toast.success('Transcription deleted')
        router.push('/dashboard')
      } else {
        toast.error('Failed to delete transcription')
      }
    } catch (error) {
      console.error('Error deleting transcription:', error)
      toast.error('Failed to delete transcription')
    } finally {
      setIsDeleting(false)
    }
  }

  const isStuck =
    transcription?.status === 'processing' &&
    isTranscriptionStuck(transcription.fileSize, transcription.createdAt)

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
      {hyperspeedEnabled && (
        <div className="hidden md:block fixed inset-0 z-0 opacity-40">
          <MemoizedHyperspeed />
        </div>
      )}

      <div className="relative min-h-screen z-10">
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-white/5 transition-colors flex-shrink-0"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white truncate">
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
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white font-semibold hover:scale-105 transition-transform flex-shrink-0"
                >
                  <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="w-6 h-6 text-green-400"
                      />
                    ) : transcription.status === 'processing' ? (
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        className="w-6 h-6 text-[#d856bf] animate-spin"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={FileEditIcon}
                        className="w-6 h-6 text-red-400"
                      />
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

          {isStuck && (
            <div className="mb-8">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 rounded-full bg-orange-500/20">
                    <HugeiconsIcon
                      icon={AlertDiamondIcon}
                      className="w-5 h-5 text-orange-400"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-orange-400 font-semibold mb-1">
                      Processing Delay Detected
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      This transcription has been processing for{' '}
                      <span className="text-orange-400 font-medium">
                        {getElapsedTime(transcription.createdAt)}
                      </span>
                      , which is longer than expected. This might be due to a
                      server issue on our end. You can wait a bit longer or
                      delete this transcription and try again.
                    </p>
                    <button
                      type="button"
                      onClick={deleteTranscription}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          className="w-4 h-4 animate-spin"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          className="w-4 h-4"
                        />
                      )}
                      {isDeleting ? 'Deleting...' : 'Delete Transcription'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#03b3c3]/10 to-[#d856bf]/10 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${transcription.isPublic ? 'bg-green-500/20' : 'bg-neutral-800'}`}
                    >
                      {transcription.isPublic ? (
                        <HugeiconsIcon
                          icon={Globe02Icon}
                          className="w-5 h-5 text-green-400"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={LockPasswordIcon}
                          className="w-5 h-5 text-gray-400"
                        />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {transcription.isPublic
                        ? 'Public Access'
                        : 'Private Access'}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm max-w-xl">
                    {transcription.isPublic
                      ? 'This transcription is currently visible to anyone with the link. You can share it freely.'
                      : 'Only you can see this transcription. Enable public access to share it with others.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {transcription.isPublic && (
                    <div className="flex items-center gap-2 bg-black/30 rounded-xl p-1.5 border border-white/5 w-full sm:w-auto">
                      <code className="text-xs text-gray-400 px-2 truncate max-w-[200px]">
                        {`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${transcription.id}`}
                      </code>
                      <button
                        type="button"
                        onClick={copyPublicLink}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                        title="Copy Link"
                      >
                        <HugeiconsIcon icon={Copy01Icon} className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={togglePublic}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      transcription.isPublic
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                        : 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10'
                    }`}
                  >
                    {transcription.isPublic ? (
                      <>
                        <HugeiconsIcon
                          icon={LockPasswordIcon}
                          className="w-4 h-4"
                        />
                        Make Private
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={Share01Icon} className="w-4 h-4" />
                        Make Public
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <HugeiconsIcon icon={MusicNote04Icon} className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-medium text-white">File Details</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Size</span>
                  <span className="text-gray-200">{formatFileSize(transcription.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-200">{transcription.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-gray-200">{formatDuration(transcription.duration)}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <HugeiconsIcon icon={Globe02Icon} className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-medium text-white">Transcription Info</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Language</span>
                  <span className="text-gray-200">
                    {transcription.language ? getLanguageName(transcription.language) : 'Auto-detected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Credits Used</span>
                  <span className="text-gray-200">{transcription.creditsUsed || 'N/A'} credits</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <HugeiconsIcon icon={Calendar03Icon} className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-medium text-white">Timeline</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-200">{new Date(transcription.createdAt).toLocaleString()}</span>
                </div>
                {transcription.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed</span>
                    <span className="text-gray-200">{new Date(transcription.completedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(() => {
            if (transcription.status !== 'completed') return null
            if (!transcription.metadata) return null
            if (typeof transcription.metadata !== 'object') return null
            if (transcription.metadata === null) return null

            const metadata = transcription.metadata as Record<
              string,
              any | undefined
            >
            if (metadata.languageLimitExceeded !== true) return null

            return (
              <div className="mb-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-yellow-500 text-sm">⚠️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-yellow-400 font-semibold mb-1">
                        Language Limit Exceeded
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {metadata.languageLimitMessage
                          ? String(metadata.languageLimitMessage)
                          : 'Your free plan supports up to 10 languages. This audio was transcribed to English.'}
                      </p>
                      {metadata.originalDetectedLanguage && (
                        <p className="text-gray-400 text-xs mb-3">
                          Detected language:{' '}
                          <span className="text-yellow-400 capitalize">
                            {String(metadata.originalDetectedLanguage)}
                          </span>
                          {' → '}Transcribed in:{' '}
                          <span className="text-yellow-400 capitalize">
                            {transcription.language || 'English'}
                          </span>
                        </p>
                      )}
                      {!isPro && (
                        <Link
                          href="/dashboard/billing"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03b3c3] to-[#028a96] hover:from-[#028a96] hover:to-[#03b3c3] text-white text-sm font-medium rounded-lg transition-all"
                        >
                          Upgrade to Pro for Unlimited Languages
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {transcription.status === 'completed' && transcription.text && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Transcription</h2>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-all"
                >
                  <HugeiconsIcon icon={Copy01Icon} className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                {(() => {
                  const metadata = transcription.metadata as Record<
                    string,
                    unknown
                  > | null
                  const segments = metadata?.segments as
                    | TranscriptSegment[]
                    | undefined

                  if (segments && segments.length > 0) {
                    return (
                      <InteractiveTranscript
                        segments={segments}
                        currentTime={currentAudioTime}
                        onSegmentClick={(startTime) => {
                          audioPlayerRef.current?.seekToTime(startTime)
                          audioPlayerRef.current?.play()
                        }}
                      />
                    )
                  }

                  return (
                    <div className="text-gray-200 text-lg leading-loose">
                      {transcription.text}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Audio Playback
            </h2>
            {transcription.fileUrl ? (
              <SpotlightCard className="bg-transparent backdrop-blur-xl">
                <CustomAudioPlayer
                  ref={audioPlayerRef}
                  src={transcription.fileUrl}
                  mimeType={transcription.mimeType}
                  onTimeUpdate={setCurrentAudioTime}
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
