'use client'

import { AlertTriangle, LogOut, Monitor, Smartphone, Tablet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import SpotlightCard from '@/components/SpotlightCard'
import { authClient } from '@/lib/auth-client'

interface Session {
  id: string
  token: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
  expiresAt: string
  isCurrent?: boolean
}

interface ParsedSession extends Session {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  os: string
}

function parseUserAgent(userAgent: string | null): {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  os: string
} {
  if (!userAgent) {
    return { deviceType: 'unknown', browser: 'Unknown', os: 'Unknown' }
  }

  const ua = userAgent.toLowerCase()

  // Detect OS first (before device type, as iOS detection affects OS)
  let os = 'Unknown'
  // Check for iOS first (before macOS, as iOS devices can contain "mac" in user agent)
  if (/iphone|ipod/.test(ua)) {
    os = 'iOS'
  } else if (/ipad/.test(ua)) {
    os = 'iOS'
  } else if (/ios/.test(ua) && !ua.includes('mac')) {
    os = 'iOS'
  } else if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('mac') && !ua.includes('iphone') && !ua.includes('ipod') && !ua.includes('ipad')) {
    os = 'macOS'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  }

  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'desktop'
  if (/mobile|android|iphone|ipod/.test(ua)) {
    deviceType = 'mobile'
  } else if (/tablet|ipad/.test(ua)) {
    deviceType = 'tablet'
  } else if (os === 'iOS' && /iphone|ipod/.test(ua)) {
    deviceType = 'mobile'
  } else if (os === 'iOS' && /ipad/.test(ua)) {
    deviceType = 'tablet'
  }

  // Detect browser
  let browser = 'Unknown'
  if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('crios')) {
    browser = 'Chrome'
  } else if (ua.includes('crios')) {
    browser = 'Chrome' // Chrome on iOS
  } else if (ua.includes('firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('fxios')) {
    browser = 'Firefox' // Firefox on iOS
  } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios')) {
    browser = 'Safari'
  } else if (ua.includes('edg')) {
    browser = 'Edge'
  } else if (ua.includes('opera') || ua.includes('opr') || ua.includes('opios')) {
    browser = 'Opera'
  }

  return { deviceType, browser, os }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}

function getDeviceIcon(deviceType: string) {
  switch (deviceType) {
    case 'mobile':
      return Smartphone
    case 'tablet':
      return Tablet
    case 'desktop':
      return Monitor
    default:
      return Monitor
  }
}

export function ActiveSessionsSection() {
  const [sessions, setSessions] = useState<ParsedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null
  )
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false)
  const [showRevokeOthersDialog, setShowRevokeOthersDialog] = useState(false)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/list-sessions', {
        cache: 'no-store'
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch sessions:', response.status, errorText)
        throw new Error('Failed to fetch sessions')
      }
      const data = await response.json()
      
      // Handle different possible response formats
      // Better Auth might return: { sessions: [...] } or { data: { sessions: [...] } } or just [...]
      let sessionsArray: Session[] = []
      
      if (Array.isArray(data)) {
        sessionsArray = data
      } else if (data?.sessions && Array.isArray(data.sessions)) {
        sessionsArray = data.sessions
      } else if (data?.data?.sessions && Array.isArray(data.data.sessions)) {
        sessionsArray = data.data.sessions
      } else if (data?.data && Array.isArray(data.data)) {
        sessionsArray = data.data
      }
      
      if (sessionsArray.length === 0) {
        console.warn('No sessions found in response:', data)
        setSessions([])
        return
      }
      
      // Get current session token from cookies
      const cookies = document.cookie.split(';')
      const sessionCookie = cookies.find((c) =>
        c.trim().startsWith('better-auth.session_token=')
      )
      const currentToken = sessionCookie
        ? sessionCookie.split('=')[1]?.trim()
        : null

      const parsedSessions: ParsedSession[] = sessionsArray.map(
        (session: Session) => {
          const parsed = parseUserAgent(session.userAgent)
          const isCurrent = session.token === currentToken || session.isCurrent
          return {
            ...session,
            ...parsed,
            isCurrent
          }
        }
      )
      
      console.log('Parsed sessions:', parsedSessions)
      setSessions(parsedSessions)
    } catch (error) {
      toast.error('Failed to load sessions')
      console.error('Error fetching sessions:', error)
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const revokeSession = async (token: string, sessionId: string) => {
    try {
      setRevokingSessionId(sessionId)
      const response = await fetch('/api/auth/revoke-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        throw new Error('Failed to revoke session')
      }

      toast.success('Session revoked successfully')
      await fetchSessions()
    } catch (error) {
      toast.error('Failed to revoke session')
      console.error('Error revoking session:', error)
    } finally {
      setRevokingSessionId(null)
    }
  }

  const revokeAllSessions = async () => {
    try {
      const result = await authClient.revokeSessions()

      if (result.error) {
        throw new Error(result.error.message || 'Failed to revoke all sessions')
      }

      toast.success('All sessions revoked successfully')
      setShowRevokeAllDialog(false)
      // Redirect to login since current session is revoked
      window.location.href = '/sign-in'
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to revoke all sessions'
      )
      console.error('Error revoking all sessions:', error)
    }
  }

  const revokeOtherSessions = async () => {
    try {
      const result = await authClient.revokeOtherSessions()

      if (result.error) {
        throw new Error(
          result.error.message || 'Failed to revoke other sessions'
        )
      }

      toast.success('Other sessions revoked successfully')
      setShowRevokeOthersDialog(false)
      await fetchSessions()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to revoke other sessions'
      )
      console.error('Error revoking other sessions:', error)
    }
  }

  if (loading) {
    return (
      <SpotlightCard className="bg-transparent backdrop-blur-xl">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 bg-white/5" />
              <Skeleton className="h-4 w-48 sm:w-56 bg-white/5" />
            </div>
          </div>
          {/* Session cards skeleton */}
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="w-5 h-5 rounded-full mt-0.5 bg-white/5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-white/5" />
                      <Skeleton className="h-3 w-24 bg-white/5" />
                      <Skeleton className="h-3 w-28 bg-white/5" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-lg bg-white/5 ml-8 sm:ml-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SpotlightCard>
    )
  }

  const currentSession = sessions.find((s) => s.isCurrent)
  const otherSessions = sessions.filter((s) => !s.isCurrent)

  return (
    <>
      <SpotlightCard className="bg-transparent backdrop-blur-xl">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Active Sessions
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Manage your active sessions across devices
              </p>
            </div>
            {otherSessions.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowRevokeOthersDialog(true)}
                className="border-white/10 text-white hover:bg-white/5 text-sm whitespace-nowrap self-start sm:self-auto"
              >
                Revoke Others
              </Button>
            )}
          </div>

          {sessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No active sessions
            </p>
          ) : (
            <div className="space-y-3">
              {currentSession && (
                <div className="p-3 sm:p-4 bg-white/5 border border-[#03b3c3]/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    {(() => {
                      const DeviceIcon = getDeviceIcon(
                        currentSession.deviceType
                      )
                      return (
                        <DeviceIcon className="w-5 h-5 text-[#03b3c3] mt-0.5 flex-shrink-0" />
                      )
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {currentSession.browser} on {currentSession.os}
                        </p>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-[#03b3c3]/20 text-[#03b3c3] border border-[#03b3c3]/30 rounded-full whitespace-nowrap">
                          Current
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {currentSession.ipAddress || 'IP address not available'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last active: {formatDate(currentSession.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {otherSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceType)
                return (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <DeviceIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {session.browser} on {session.os}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {session.ipAddress || 'IP address not available'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last active: {formatDate(session.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeSession(session.token, session.id)}
                        disabled={revokingSessionId === session.id}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 self-start sm:self-auto ml-8 sm:ml-0 whitespace-nowrap"
                      >
                        {revokingSessionId === session.id ? (
                          <Spinner />
                        ) : (
                          <>
                            <LogOut className="w-4 h-4" />
                            Revoke
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {sessions.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setShowRevokeAllDialog(true)}
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Revoke All Sessions
              </Button>
            </div>
          )}
        </div>
      </SpotlightCard>

      {/* Revoke All Dialog */}
      <Dialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
        <DialogContent className="sm:max-w-md bg-neutral-900/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <DialogTitle className="text-white text-lg">
                Revoke All Sessions
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 text-sm">
              This will sign you out from all devices, including this one. You
              will need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <LogOut className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">
              You will be signed out immediately and redirected to the login
              page.
            </p>
          </div>
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => setShowRevokeAllDialog(false)}
              className="border-white/10 text-white hover:bg-white/5 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={revokeAllSessions}
              className="bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all duration-200"
            >
              Revoke All Sessions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Others Dialog */}
      <Dialog
        open={showRevokeOthersDialog}
        onOpenChange={setShowRevokeOthersDialog}
      >
        <DialogContent className="sm:max-w-md bg-neutral-900/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <LogOut className="w-5 h-5 text-yellow-400" />
              </div>
              <DialogTitle className="text-white text-lg">
                Revoke Other Sessions
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 text-sm">
              This will sign you out from all other devices. You will remain
              signed in on this device.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Monitor className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-300">
              Your current session will not be affected. All other devices will
              be signed out.
            </p>
          </div>
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => setShowRevokeOthersDialog(false)}
              className="border-white/10 text-white hover:bg-white/5 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={revokeOtherSessions}
              className="bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all duration-200"
            >
              Revoke Other Sessions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

