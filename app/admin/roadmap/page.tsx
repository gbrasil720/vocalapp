'use client'

import {
  ArrowLeft,
  LayoutGrid,
  CheckCircle2,
  Edit3,
  Inbox,
  ListChecks,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import MarkdownEditor from '@/components/admin/markdown-editor'
import SpotlightCard from '@/components/SpotlightCard'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type RoadmapStatus = 'planned' | 'in_progress' | 'shipped'

interface RoadmapEntry {
  id: string
  title: string
  status: RoadmapStatus
  category: string | null
  content: string
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface FormState {
  title: string
  status: RoadmapStatus
  category: string
  content: string
  published: boolean
  sortOrder: number
}

const STATUS_OPTIONS: Array<{ value: RoadmapStatus; label: string }> = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'shipped', label: 'Shipped' }
]

const defaultFormState: FormState = {
  title: '',
  status: 'planned',
  category: '',
  content: '',
  published: false,
  sortOrder: 0
}

export default function AdminRoadmapPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<RoadmapEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState>(defaultFormState)

  const isEditing = useMemo(() => selectedId !== null, [selectedId])

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedId) ?? null,
    [entries, selectedId]
  )

  const loadEntries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/roadmap', {
        cache: 'no-store'
      })

      if (response.status === 401) {
        toast.error('Please sign in to access admin tools')
        router.push('/sign-in')
        return
      }

      if (response.status === 403) {
        toast.error('Access denied - Admin only')
        router.push('/dashboard')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load roadmap entries')
      }

      const data = await response.json()
      setEntries(
        Array.isArray(data.entries)
          ? data.entries.map((entry: RoadmapEntry) => ({
              ...entry,
              category: entry.category ?? ''
            }))
          : []
      )
    } catch (error) {
      console.error('Error loading roadmap entries:', error)
      toast.error('Failed to load roadmap entries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEntries()
  }, [])

  const resetForm = () => {
    setSelectedId(null)
    setFormState(defaultFormState)
  }

  const handleSelectEntry = (id: string) => {
    const entry = entries.find((item) => item.id === id)
    if (!entry) return

    setSelectedId(id)
    setFormState({
      title: entry.title,
      status: entry.status,
      category: entry.category ?? '',
      content: entry.content,
      published: entry.published,
      sortOrder: entry.sortOrder
    })
  }

  const handleSubmit = async () => {
    if (!formState.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formState.content.trim()) {
      toast.error('Content is required')
      return
    }

    setSaving(true)

    const payload = {
      title: formState.title.trim(),
      status: formState.status,
      category:
        formState.category.trim().length > 0
          ? formState.category.trim()
          : undefined,
      content: formState.content,
      published: formState.published,
      sortOrder: formState.sortOrder
    }

    const isUpdate = Boolean(selectedId)
    const endpoint = isUpdate
      ? `/api/admin/roadmap/${selectedId}`
      : '/api/admin/roadmap'
    const method = isUpdate ? 'PATCH' : 'POST'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Failed to save entry')
      }

      toast.success(
        isUpdate ? 'Roadmap entry updated' : 'Roadmap entry created'
      )
      await loadEntries()
      if (!isUpdate) {
        resetForm()
      }
    } catch (error) {
      console.error('Error saving roadmap entry:', error)
      toast.error('Failed to save roadmap entry')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/roadmap/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Failed to delete entry')
      }

      toast.success('Roadmap entry deleted')
      if (selectedId === id) {
        resetForm()
      }
      await loadEntries()
    } catch (error) {
      console.error('Error deleting roadmap entry:', error)
      toast.error('Failed to delete entry')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(3,179,195,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(216,86,191,0.08),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Roadmap Manager
            </h1>
            <p className="max-w-2xl text-gray-400">
              Curate upcoming releases for beta users. Draft entries stay hidden
              until you publish them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Admin Home
              </Button>
            </Link>
            <Button
              onClick={() => {
                resetForm()
                toast.info('Creating new roadmap entry')
              }}
              className="bg-[#03b3c3] text-black hover:bg-[#03b3c3]/80"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => void loadEntries()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <SpotlightCard className="bg-transparent backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Existing Entries
                </h2>
                <p className="text-sm text-gray-400">
                  Click an entry to edit. Drafts are marked in yellow.
                </p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
                {entries.length} total
              </div>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Spinner />
              </div>
            ) : entries.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-gray-500">
                <Inbox className="mb-3 h-10 w-10" />
                <p>No roadmap entries yet</p>
                <p className="text-sm">Create your first update on the right</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => {
                  const status = STATUS_OPTIONS.find(
                    (option) => option.value === entry.status
                  )

                  return (
                    <div
                      key={entry.id}
                      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform hover:-translate-y-1 hover:border-white/30 ${
                        selectedId === entry.id ? 'ring-2 ring-[#03b3c3]' : ''
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {entry.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {entry.category || 'Uncategorized'} ·{' '}
                            {new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }).format(new Date(entry.updatedAt))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                              entry.published
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {entry.published ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {entry.published ? 'Published' : 'Draft'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-200">
                            <ListChecks className="h-3 w-3" />
                            {status?.label ?? entry.status}
                          </span>
                        </div>
                      </div>

                      <p className="line-clamp-3 text-sm text-gray-300">
                        {entry.content}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          size="sm"
                          className="bg-white/10 text-white hover:bg-white/20"
                          onClick={() => handleSelectEntry(entry.id)}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                        >
                          {deletingId === entry.id ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SpotlightCard>

          <SpotlightCard className="bg-transparent backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {isEditing ? 'Edit Entry' : 'Create Entry'}
                </h2>
                <p className="text-sm text-gray-400">
                  Fill out the details and save to update the roadmap.
                </p>
              </div>
              {isEditing ? (
                <Button
                  variant="ghost"
                  className="text-sm text-gray-300 hover:text-white"
                  onClick={() => resetForm()}
                >
                  Clear
                </Button>
              ) : null}
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Title
                </label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      title: event.target.value
                    }))
                  }
                  placeholder="What are you building?"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-[#03b3c3] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={formState.status}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          status: event.target.value as RoadmapStatus
                        }))
                      }
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-[#03b3c3] focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                      ▾
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formState.sortOrder}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        sortOrder: Number.parseInt(
                          event.target.value || '0',
                          10
                        )
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-[#03b3c3] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Lower numbers appear first.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Category
                </label>
                <input
                  type="text"
                  value={formState.category}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      category: event.target.value
                    }))
                  }
                  placeholder="Optional. e.g. Performance, Collaboration"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-[#03b3c3] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Publish Status
                </label>
                <button
                  type="button"
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    formState.published ? 'bg-[#03b3c3]' : 'bg-white/10'
                  }`}
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      published: !prev.published
                    }))
                  }
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                      formState.published ? 'translate-x-8' : 'translate-x-2'
                    }`}
                  />
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  Publish to make the entry visible to beta users.
                </p>
              </div>

              <MarkdownEditor
                label="Details"
                value={formState.content}
                onChange={(value) =>
                  setFormState((prev) => ({
                    ...prev,
                    content: value
                  }))
                }
                placeholder="Share roadmap details in markdown..."
                preview="live"
              />

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={saving}
                  className="bg-[#d856bf] text-white hover:bg-[#d856bf]/80"
                >
                  {saving ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditing ? 'Update Entry' : 'Create Entry'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm text-gray-400 hover:text-white"
                  onClick={() => resetForm()}
                >
                  Clear Form
                </Button>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  )
}
