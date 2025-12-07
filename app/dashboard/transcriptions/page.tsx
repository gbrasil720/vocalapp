'use client'

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowUp01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete02Icon,
  Download01Icon,
  File02Icon,
  FilterIcon,
  Globe02Icon,
  GlobeIcon,
  Loading03Icon,
  LockKeyIcon,
  Search01Icon,
  AudioWave01Icon,
  Time02Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CommandInput } from '@/components/command-input'
import { LoadingScreen } from '@/components/loading-screen'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { UserNav } from '@/components/user-nav'
import { authClient } from '@/lib/auth-client'
import { useHyperspeed } from '@/lib/hyperspeed-context'
import { getLanguageName } from '@/lib/utils'

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
  isPublic: boolean
}

type StatusFilter = 'all' | 'completed' | 'processing' | 'failed'
type VisibilityFilter = 'all' | 'public' | 'private'
type SortOption = 'recent' | 'oldest' | 'duration'

export default function TranscriptionsPage() {
  const { data: session, isPending } = authClient.useSession()
  const { hyperspeedEnabled } = useHyperspeed()
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
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>('all')
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

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    // Visibility filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter((t) =>
        visibilityFilter === 'public' ? t.isPublic : !t.isPublic
      )
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((t) =>
        t.fileName.toLowerCase().includes(query)
      )
    }

    // Sort
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
  }, [transcriptions, statusFilter, visibilityFilter, searchQuery, sortOption])

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
      {hyperspeedEnabled && (
        <div className="hidden md:block fixed inset-0 z-0 opacity-40">
          <MemoizedHyperspeed />
        </div>
      )}

      <div className="relative min-h-screen z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={AudioWave01Icon}
                  size={24}
                  className="text-[#03b3c3]"
                />
                <span className="font-['Satoshi'] font-medium text-xl">
                  vocalapp
                </span>
              </Link>

              <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  <CommandInput />
                </div>

                <UserNav />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-4"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              All Transcriptions
            </h1>
            <p className="text-gray-500">
              Manage and export your transcriptions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">
                    Total Transcriptions
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {transcriptions.length}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-500/10">
                  <HugeiconsIcon
                    icon={File02Icon}
                    size={20}
                    className="text-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Total Minutes</p>
                  <h3 className="text-2xl font-bold text-white">
                    {Math.round(totalMinutes)}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-500/10">
                  <HugeiconsIcon
                    icon={Time02Icon}
                    size={20}
                    className="text-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Credits Used</p>
                  <h3 className="text-2xl font-bold text-white">
                    {totalCreditsUsed}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-[#d856bf]/10">
                  <HugeiconsIcon
                    icon={GlobeIcon}
                    size={20}
                    className="text-[#d856bf]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Action Bar */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-5 mb-6">
            <div className="space-y-4">
              {/* Filters Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <Input
                    type="text"
                    placeholder="Search by filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>

                {/* Status Filter */}
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger className="w-full lg:w-[160px] bg-zinc-800 border-zinc-700">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={FilterIcon}
                        size={14}
                        className="text-gray-500"
                      />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Visibility Filter */}
                <Select
                  value={visibilityFilter}
                  onValueChange={(value) =>
                    setVisibilityFilter(value as VisibilityFilter)
                  }
                >
                  <SelectTrigger className="w-full lg:w-[160px] bg-zinc-800 border-zinc-700">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={Globe02Icon}
                        size={14}
                        className="text-gray-500"
                      />
                      <SelectValue placeholder="Visibility" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visibility</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select
                  value={sortOption}
                  onValueChange={(value) =>
                    setSortOption(value as SortOption)
                  }
                >
                  <SelectTrigger className="w-full lg:w-[160px] bg-zinc-800 border-zinc-700">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={
                          sortOption === 'oldest'
                            ? ArrowUp01Icon
                            : ArrowDown01Icon
                        }
                        size={14}
                        className="text-gray-500"
                      />
                      <SelectValue placeholder="Sort" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="duration">By Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-zinc-700">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedIds.size > 0 &&
                      selectedIds.size === displayedTranscriptions.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm text-gray-400 cursor-pointer"
                  >
                    Select All ({selectedIds.size} selected)
                  </label>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {selectedIds.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                    >
                      <HugeiconsIcon
                        icon={isDeleting ? Loading03Icon : Delete02Icon}
                        size={16}
                        className={isDeleting ? 'animate-spin' : ''}
                      />
                      Delete Selected
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={handleExportAll}
                    disabled={isExporting || transcriptions.length === 0}
                    className="bg-[#d856bf] hover:bg-[#c247ac] text-white"
                  >
                    <HugeiconsIcon
                      icon={isExporting ? Loading03Icon : Download01Icon}
                      size={16}
                      className={isExporting ? 'animate-spin' : ''}
                    />
                    Export All
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Transcriptions List */}
          <div className="space-y-3">
            {displayedTranscriptions.length === 0 ? (
              <div className="text-center py-12">
                <HugeiconsIcon
                  icon={File02Icon}
                  size={48}
                  className="text-gray-600 mx-auto mb-4"
                />
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
                  <div
                    key={transcription.id}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <Checkbox
                        checked={selectedIds.has(transcription.id)}
                        onCheckedChange={() =>
                          toggleSelection(transcription.id)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 self-start sm:self-center"
                      />

                      <Link
                        href={`/dashboard/transcription/${transcription.id}`}
                        className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0"
                      >
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-cyan-500/10 flex-shrink-0">
                            <HugeiconsIcon
                              icon={File02Icon}
                              size={18}
                              className="text-cyan-400"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white mb-1 truncate text-sm">
                              {transcription.fileName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <HugeiconsIcon
                                  icon={Clock01Icon}
                                  size={12}
                                  className="text-gray-500"
                                />
                                <span className="whitespace-nowrap">
                                  {formatDuration(transcription.duration)}
                                </span>
                              </span>
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <HugeiconsIcon
                                  icon={GlobeIcon}
                                  size={12}
                                  className="text-gray-500"
                                />
                                <span className="whitespace-nowrap">
                                  {getLanguageName(transcription.language)}
                                </span>
                              </span>
                              <span className="whitespace-nowrap text-gray-600">
                                {formatRelativeTime(transcription.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
                              transcription.isPublic
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-zinc-800 text-gray-400 border border-zinc-700'
                            }`}
                          >
                            <HugeiconsIcon
                              icon={
                                transcription.isPublic
                                  ? Globe02Icon
                                  : LockKeyIcon
                              }
                              size={12}
                            />
                            {transcription.isPublic ? 'Public' : 'Private'}
                          </span>
                          {transcription.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs rounded-md whitespace-nowrap">
                              <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                size={12}
                              />
                              Completed
                            </span>
                          ) : transcription.status === 'failed' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-md whitespace-nowrap">
                              <HugeiconsIcon icon={CancelCircleIcon} size={12} />
                              Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#d856bf]/10 text-[#d856bf] border border-[#d856bf]/20 text-xs rounded-md animate-pulse whitespace-nowrap">
                              <HugeiconsIcon
                                icon={Loading03Icon}
                                size={12}
                                className="animate-spin"
                              />
                              Processing
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div
                    ref={observerTarget}
                    className="flex items-center justify-center py-8"
                  >
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      size={24}
                      className="animate-spin text-[#d856bf]"
                    />
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
