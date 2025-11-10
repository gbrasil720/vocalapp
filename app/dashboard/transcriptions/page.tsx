'use client'

import {
  AudioLines,
  Check,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Globe,
  Loader2,
  Search,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { LoadingScreen } from '@/components/loading-screen'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import SpotlightCard from '@/components/SpotlightCard'
import { UserNav } from '@/components/user-nav'
import { authClient } from '@/lib/auth-client'

interface Transcription {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  duration: number | null
  language: string | null
  status: 'processing' | 'completed' | 'failed'
  creditsUsed: number | null
  createdAt: string
  completedAt: string | null
}

type StatusFilter = 'all' | 'completed' | 'processing' | 'failed'
type SortOption = 'recent' | 'oldest' | 'duration'

export default function TranscriptionsPage() {
  const { data: session, isPending } = authClient.useSession()
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [filteredTranscriptions, setFilteredTranscriptions] = useState<
    Transcription[]
  >([])
  const [displayedTranscriptions, setDisplayedTranscriptions] = useState<
    Transcription[]
  >([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('recent')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    if (!isPending && !session) {
      redirect('/sign-in')
    }
  }, [session, isPending])

  const fetchTranscriptions = useCallback(async () => {
    try {
      const response = await fetch('/api/transcriptions', {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setTranscriptions(data.transcriptions || [])
      }
    } catch (error) {
      console.error('Error fetching transcriptions:', error)
      toast.error('Failed to load transcriptions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchTranscriptions()
    }
  }, [session, fetchTranscriptions])

  useEffect(() => {
    let filtered = [...transcriptions]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((t) =>
        t.fileName.toLowerCase().includes(query)
      )
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'recent':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case 'duration':
          return (b.duration || 0) - (a.duration || 0)
        default:
          return 0
      }
    })

    setFilteredTranscriptions(filtered)
    setDisplayedTranscriptions(filtered.slice(0, ITEMS_PER_PAGE))
    setPage(1)
    setHasMore(filtered.length > ITEMS_PER_PAGE)
  }, [transcriptions, statusFilter, searchQuery, sortOption])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true)
          const nextPage = page + 1
          const start = nextPage * ITEMS_PER_PAGE
          const end = start + ITEMS_PER_PAGE
          const newItems = filteredTranscriptions.slice(start, end)

          if (newItems.length > 0) {
            setDisplayedTranscriptions((prev) => [...prev, ...newItems])
            setPage(nextPage)
            setHasMore(end < filteredTranscriptions.length)
          } else {
            setHasMore(false)
          }
          setLoadingMore(false)
        }
      },
      { threshold: 0.1 }
    )

    const target = observerTarget.current
    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [hasMore, loadingMore, page, filteredTranscriptions])

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === displayedTranscriptions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(displayedTranscriptions.map((t) => t.id)))
    }
  }

  const handleExportAll = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/transcriptions/export-all', {
        method: 'POST'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transcriptions-${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Transcriptions exported successfully!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to export transcriptions')
      }
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Failed to export transcriptions')
    } finally {
      setIsExporting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.size} transcription(s)? This action cannot be undone.`
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/transcriptions/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcriptionIds: Array.from(selectedIds)
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(
          `${data.deletedCount} transcription(s) deleted successfully`
        )
        setSelectedIds(new Set())
        fetchTranscriptions()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete transcriptions')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Failed to delete transcriptions')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const totalMinutes =
    transcriptions.reduce((sum, t) => sum + (t.duration || 0), 0) / 60
  const totalCreditsUsed = transcriptions.reduce(
    (sum, t) => sum + (t.creditsUsed || 0),
    0
  )

  if (isPending || loading) {
    return <LoadingScreen />
  }

  if (!session) {
    return null
  }

  return (
    <>
      <div className="hidden md:block fixed inset-0 z-0 opacity-40">
        <MemoizedHyperspeed />
      </div>

      <div className="relative min-h-screen z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <AudioLines
                  size={24}
                  strokeWidth={1.5}
                  className="text-[#03b3c3]"
                />
                <span className="font-['Satoshi'] font-medium text-xl">
                  vocalapp
                </span>
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Billing
                </Link>
                <UserNav />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent mb-2">
              All Transcriptions
            </h1>
            <p className="text-gray-400 text-lg">
              Manage and export your transcriptions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">
                    Total Transcriptions
                  </p>
                  <h3 className="text-3xl font-bold text-white">
                    {transcriptions.length}
                  </h3>
                </div>
                <FileText className="w-8 h-8 text-[#03b3c3]" />
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Minutes</p>
                  <h3 className="text-3xl font-bold text-white">
                    {Math.round(totalMinutes)}
                  </h3>
                </div>
                <Clock className="w-8 h-8 text-[#c247ac]" />
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Credits Used</p>
                  <h3 className="text-3xl font-bold text-white">
                    {totalCreditsUsed}
                  </h3>
                </div>
                <Globe className="w-8 h-8 text-[#d856bf]" />
              </div>
            </SpotlightCard>
          </div>

          {/* Filter and Action Bar */}
          <SpotlightCard className="bg-transparent backdrop-blur-xl mb-6">
            <div className="space-y-4">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  ['all', 'completed', 'processing', 'failed'] as StatusFilter[]
                ).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      statusFilter === filter
                        ? 'bg-gradient-to-r from-[#d856bf] to-[#c247ac] text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Search and Sort */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d856bf]/50 transition-all"
                  />
                </div>

                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) =>
                      setSortOption(e.target.value as SortOption)
                    }
                    className="appearance-none pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#d856bf]/50 transition-all cursor-pointer"
                  >
                    <option value="recent">Recent First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="duration">By Duration</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size > 0 &&
                        selectedIds.size === displayedTranscriptions.length
                      }
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-gradient-to-r checked:from-[#d856bf] checked:to-[#c247ac] focus:outline-none focus:ring-2 focus:ring-[#d856bf]/50 cursor-pointer"
                    />
                    <span className="text-sm text-gray-400">
                      Select All ({selectedIds.size} selected)
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {selectedIds.size > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete Selected
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleExportAll}
                    disabled={isExporting || transcriptions.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:scale-105 text-white rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Export All
                  </button>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Transcriptions List */}
          <div className="space-y-4">
            {displayedTranscriptions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  {transcriptions.length === 0
                    ? 'No transcriptions yet'
                    : 'No transcriptions match your filters'}
                </p>
                <p className="text-gray-500 text-sm">
                  {transcriptions.length === 0
                    ? 'Upload an audio file to get started'
                    : 'Try adjusting your filters or search query'}
                </p>
              </div>
            ) : (
              <>
                {displayedTranscriptions.map((transcription) => (
                  <SpotlightCard
                    key={transcription.id}
                    className="bg-transparent backdrop-blur-xl hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(transcription.id)}
                        onChange={() => toggleSelection(transcription.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-gradient-to-r checked:from-[#d856bf] checked:to-[#c247ac] focus:outline-none focus:ring-2 focus:ring-[#d856bf]/50 cursor-pointer flex-shrink-0"
                      />

                      <Link
                        href={`/dashboard/transcription/${transcription.id}`}
                        className="flex-1 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 rounded-xl bg-white/5">
                            <FileText className="w-5 h-5 text-[#03b3c3]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white mb-1 truncate">
                              {transcription.fileName}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(transcription.duration)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {transcription.language || 'Unknown'}
                              </span>
                              <span>
                                {formatRelativeTime(transcription.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {transcription.status === 'completed' ? (
                            <span className="px-3 py-1 bg-green-400/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Completed
                            </span>
                          ) : transcription.status === 'failed' ? (
                            <span className="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded-full">
                              Failed
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-[#d856bf]/20 text-[#d856bf] text-xs rounded-full animate-pulse flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Processing
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  </SpotlightCard>
                ))}

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div
                    ref={observerTarget}
                    className="flex items-center justify-center py-8"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-[#d856bf]" />
                  </div>
                )}

                {!hasMore && displayedTranscriptions.length > 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    You've reached the end
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
