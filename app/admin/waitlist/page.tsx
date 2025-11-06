'use client'

import { CheckCircle, XCircle, RefreshCw, Users, Clock, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface WaitlistEntry {
  email: string
  status: 'pending' | 'approved'
}

interface WaitlistData {
  entries: WaitlistEntry[]
  total: number
  approved: number
  pending: number
}

export default function AdminWaitlist() {
  const router = useRouter()
  const [data, setData] = useState<WaitlistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingEmails, setProcessingEmails] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/waitlist')
      
      if (response.status === 401) {
        toast.error('Please sign in to access admin panel')
        router.push('/sign-in')
        return
      }
      
      if (response.status === 403) {
        toast.error('Access denied - Admin only')
        router.push('/dashboard')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch waitlist')
      }

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching waitlist:', error)
      toast.error('Failed to load waitlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = async (email: string) => {
    setProcessingEmails((prev) => new Set(prev).add(email))
    try {
      const response = await fetch('/api/admin/waitlist/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('Failed to approve email')
      }

      toast.success(`✅ Approved ${email}`)
      await fetchData()
    } catch (error) {
      console.error('Error approving email:', error)
      toast.error('Failed to approve email')
    } finally {
      setProcessingEmails((prev) => {
        const next = new Set(prev)
        next.delete(email)
        return next
      })
    }
  }

  const handleReject = async (email: string) => {
    setProcessingEmails((prev) => new Set(prev).add(email))
    try {
      const response = await fetch('/api/admin/waitlist/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('Failed to reject email')
      }

      toast.success(`❌ Revoked approval for ${email}`)
      await fetchData()
    } catch (error) {
      console.error('Error rejecting email:', error)
      toast.error('Failed to reject email')
    } finally {
      setProcessingEmails((prev) => {
        const next = new Set(prev)
        next.delete(email)
        return next
      })
    }
  }

  const filteredEntries = data?.entries.filter((entry) => {
    if (filter === 'all') return true
    return entry.status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="text-gray-400 mt-4">Loading waitlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(3,179,195,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(216,86,191,0.1),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Waitlist Management
              </h1>
              <p className="text-gray-400">
                Manage beta access approvals
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchData}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#03b3c3]/20 rounded-lg">
                  <Users className="w-6 h-6 text-[#03b3c3]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Waitlist</p>
                  <p className="text-2xl font-bold text-white">{data?.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-white">{data?.approved || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-white">{data?.pending || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#03b3c3] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({data?.total || 0})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pending ({data?.pending || 0})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Approved ({data?.approved || 0})
            </button>
          </div>
        </div>

        {/* Waitlist Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredEntries && filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <tr
                      key={entry.email}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white">
                        {entry.email}
                      </td>
                      <td className="px-6 py-4">
                        {entry.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {entry.status === 'pending' ? (
                            <Button
                              onClick={() => handleApprove(entry.email)}
                              disabled={processingEmails.has(entry.email)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                              size="sm"
                            >
                              {processingEmails.has(entry.email) ? (
                                <Spinner />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleReject(entry.email)}
                              disabled={processingEmails.has(entry.email)}
                              variant="outline"
                              className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                              size="sm"
                            >
                              {processingEmails.has(entry.email) ? (
                                <Spinner />
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Revoke
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                      {filter === 'pending' ? (
                        <>No pending approvals</>
                      ) : filter === 'approved' ? (
                        <>No approved users yet</>
                      ) : (
                        <>No waitlist entries found</>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

