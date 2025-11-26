'use client'

import {
  AlertTriangle,
  Copy,
  Download,
  Key,
  Lock,
  Shield,
  ShieldCheck,
  ShieldOff,
  Smartphone
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import SpotlightCard from '@/components/SpotlightCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

interface TwoFactorSectionProps {
  twoFactorEnabled: boolean
}

export function TwoFactorSection({ twoFactorEnabled }: TwoFactorSectionProps) {
  const [enabled, setEnabled] = useState(twoFactorEnabled)
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [showEnableDialog, setShowEnableDialog] = useState(false)

  // Sync enabled state with prop when it changes (e.g., after API fetch)
  // But don't sync while the enable dialog is open - the status should only
  // update after successful TOTP verification, not when the two_factor record is created
  useEffect(() => {
    if (!showEnableDialog) {
      setEnabled(twoFactorEnabled)
    }
  }, [twoFactorEnabled, showEnableDialog])
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false)
  const [showGenerateBackupCodesDialog, setShowGenerateBackupCodesDialog] =
    useState(false)
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'password' | 'qr' | 'verify'>('password')

  const handleEnable2FA = async () => {
    if (!password) {
      toast.error('Password is required')
      return
    }

    try {
      setLoading(true)
      console.log('Attempting to enable 2FA...')
      const result = await authClient.twoFactor.enable({
        password,
        issuer: 'VocalApp'
      })

      console.log('2FA enable result:', JSON.stringify(result, null, 2))

      if (result.error) {
        console.error('2FA enable error:', result.error)

        // Handle specific error cases
        const errorCode = result.error.code || result.error.status
        const errorMsg = result.error.message || ''

        let userFriendlyMessage =
          'Failed to enable 2FA. Please check your password and try again.'

        if (
          errorMsg.toLowerCase().includes('invalid password') ||
          errorMsg.toLowerCase().includes('password hash') ||
          errorCode === 'INVALID_PASSWORD'
        ) {
          userFriendlyMessage = 'Incorrect password. Please try again.'
        } else if (
          errorMsg.toLowerCase().includes('unauthorized') ||
          errorCode === 'UNAUTHORIZED'
        ) {
          userFriendlyMessage = 'Session expired. Please log in again.'
        } else if (errorMsg) {
          userFriendlyMessage = errorMsg
        }

        throw new Error(userFriendlyMessage)
      }

      // Better Auth returns totpURI and backupCodes in result.data
      const totpURI = result.data?.totpURI
      const resultBackupCodes = result.data?.backupCodes || []

      console.log('Extracted TOTP URI:', totpURI)
      console.log('Extracted backup codes:', resultBackupCodes)
      console.log('Full result structure:', {
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
        resultKeys: Object.keys(result)
      })

      if (!totpURI) {
        console.error('No TOTP URI found in response. Full result:', result)
        throw new Error(
          'Failed to generate QR code. The server response was invalid. Please try again.'
        )
      }

      setTotpUri(totpURI)
      setBackupCodes(resultBackupCodes)
      setStep('qr')
      console.log('2FA setup successful, moving to QR step')
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to enable 2FA. Please check your password and try again.'
      toast.error(errorMessage)
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode) {
      toast.error('Verification code is required')
      return
    }

    if (verificationCode.length !== 6) {
      toast.error('Verification code must be 6 digits')
      return
    }

    try {
      setLoading(true)
      const result = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
        trustDevice: true
      })

      if (result.error) {
        const errorMessage =
          result.error.message ||
          result.error.code ||
          'Invalid verification code. Please try again.'
        throw new Error(errorMessage)
      }

      toast.success('Two-factor authentication enabled successfully')
      setEnabled(true)
      setShowEnableDialog(false)
      // Don't reset backup codes here - they should still be in state from handleEnable2FA
      // Only reset the other fields
      setStep('password')
      setPassword('')
      setVerificationCode('')
      setTotpUri(null)
      // Show backup codes dialog if we have codes, otherwise fetch them
      if (backupCodes.length > 0) {
        setShowBackupCodesDialog(true)
      } else {
        // Try to fetch backup codes if they weren't stored
        try {
          const response = await fetch('/api/auth/two-factor/backup-codes')
          if (response.ok) {
            const data = await response.json()
            if (data.backupCodes && data.backupCodes.length > 0) {
              setBackupCodes(data.backupCodes)
              setShowBackupCodesDialog(true)
            }
          }
        } catch (e) {
          console.error('Failed to fetch backup codes:', e)
        }
      }
      // Dispatch event to notify parent of 2FA status change
      window.dispatchEvent(new Event('two-factor-changed'))
      // Refresh session to get updated twoFactorEnabled status
      await authClient.getSession()
    } catch (error) {
      console.error('Error verifying 2FA code:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to verify code. Please check the code and try again.'
      toast.error(errorMessage)
      setVerificationCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!password) {
      toast.error('Password is required')
      return
    }

    try {
      setLoading(true)
      const result = await authClient.twoFactor.disable({
        password
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      toast.success('Two-factor authentication disabled successfully')
      setEnabled(false)
      setShowDisableDialog(false)
      setPassword('')
      // Dispatch event to notify parent of 2FA status change
      window.dispatchEvent(new Event('two-factor-changed'))
      // Refresh session to get updated twoFactorEnabled status
      await authClient.getSession()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to disable 2FA'
      )
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  const handleViewBackupCodes = async () => {
    try {
      setLoading(true)
      // Check backup codes status - they're encrypted so we can't view existing ones
      const response = await fetch('/api/auth/two-factor/backup-codes')
      const data = await response.json()

      if (data.backupCodes && data.backupCodes.length > 0) {
        // If we somehow got decrypted codes, show them
        setBackupCodes(data.backupCodes)
        setShowBackupCodesDialog(true)
      } else if (data.needsRegeneration || data.hasBackupCodes) {
        // Backup codes exist but are encrypted - prompt to generate new ones
        toast.info(
          'To view your backup codes, you need to generate new ones. Your old codes will be replaced.'
        )
        setShowGenerateBackupCodesDialog(true)
      } else {
        toast.error('No backup codes found. Please generate backup codes.')
        setShowGenerateBackupCodesDialog(true)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to check backup codes'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateBackupCodes = async () => {
    if (!password) {
      toast.error('Password is required')
      return
    }

    try {
      setLoading(true)
      const result = await authClient.twoFactor.generateBackupCodes({
        password
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      if (result.data?.backupCodes) {
        setBackupCodes(result.data.backupCodes)
        setShowGenerateBackupCodesDialog(false)
        setShowBackupCodesDialog(true)
        setPassword('')
        toast.success('New backup codes generated')
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to generate backup codes'
      )
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    toast.success('Backup codes copied to clipboard')
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vocalapp-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  const resetEnableFlow = useCallback((clearBackupCodes = true) => {
    setStep('password')
    setPassword('')
    setVerificationCode('')
    setTotpUri(null)
    // Only clear backup codes if explicitly requested
    // Don't clear when dialog closes after successful enable (backup codes dialog will show)
    if (clearBackupCodes) {
      setBackupCodes([])
    }
  }, [])

  useEffect(() => {
    if (!showEnableDialog && !showBackupCodesDialog) {
      // Only reset when enable dialog closes AND backup codes dialog is not showing
      resetEnableFlow(true)
    } else if (!showEnableDialog && showBackupCodesDialog) {
      // Enable dialog closed but backup codes showing - only reset form fields, keep codes
      resetEnableFlow(false)
    }
  }, [showEnableDialog, showBackupCodesDialog, resetEnableFlow])

  const checkHasPassword = useCallback(async () => {
    try {
      const response = await fetch('/api/user/has-password')
      if (response.ok) {
        const data = await response.json()
        setHasPassword(data.hasPassword ?? true)
      } else {
        setHasPassword(true) // Default to true if check fails
      }
    } catch (error) {
      console.error('Error checking password status:', error)
      setHasPassword(true) // Default to true if check fails
    }
  }, [])

  useEffect(() => {
    checkHasPassword()
  }, [checkHasPassword])

  // Listen for password set events from parent
  useEffect(() => {
    const handlePasswordSet = () => {
      checkHasPassword()
    }

    // Listen for custom event dispatched when password is set
    window.addEventListener('password-set', handlePasswordSet)
    return () => {
      window.removeEventListener('password-set', handlePasswordSet)
    }
  }, [checkHasPassword])

  return (
    <>
      <SpotlightCard className="bg-transparent backdrop-blur-xl">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              {enabled ? (
                <ShieldCheck className="w-5 h-5 text-[#03b3c3] flex-shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              )}
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Two-Factor Authentication
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  {enabled
                    ? '2FA is enabled for your account'
                    : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-8 sm:ml-0">
              {enabled ? (
                <span className="px-2 py-1 text-xs font-semibold bg-[#03b3c3]/20 text-[#03b3c3] border border-[#03b3c3]/30 rounded-full whitespace-nowrap">
                  Enabled
                </span>
              ) : (
                <span className="px-2 py-1 text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full whitespace-nowrap">
                  Disabled
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            {enabled ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDisableDialog(true)}
                  className="w-full border-white/10 text-white hover:bg-white/5 text-sm"
                >
                  Disable Two-Factor Authentication
                </Button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={handleViewBackupCodes}
                    disabled={loading}
                    className="flex-1 border-white/10 text-white hover:bg-white/5 text-sm"
                  >
                    {loading ? <Spinner /> : 'View Backup Codes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowGenerateBackupCodesDialog(true)}
                    className="flex-1 border-white/10 text-white hover:bg-white/5 text-sm"
                  >
                    Generate New Codes
                  </Button>
                </div>
              </>
            ) : hasPassword === null ? (
              // Skeleton while checking password status
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-full bg-white/5" />
              </div>
            ) : hasPassword === false ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-sm text-yellow-400 mb-2">
                  Password required to enable 2FA
                </p>
                <p className="text-xs text-gray-400">
                  Please set a password for your account first to enable
                  two-factor authentication.
                </p>
              </div>
            ) : (
              <Button
                onClick={() => setShowEnableDialog(true)}
                className="w-full bg-[#d856bf] hover:bg-[#c247ac] text-white"
              >
                Enable Two-Factor Authentication
              </Button>
            )}
          </div>
        </div>
      </SpotlightCard>

      {/* Enable 2FA Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent className="sm:max-w-md bg-neutral-900/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#03b3c3]/10 border border-[#03b3c3]/20">
                <ShieldCheck className="w-5 h-5 text-[#03b3c3]" />
              </div>
              <DialogTitle className="text-white text-lg">
                Enable Two-Factor Authentication
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 text-sm">
              {step === 'password' &&
                'Enter your password to begin setting up 2FA'}
              {step === 'qr' && 'Scan the QR code with your authenticator app'}
              {step === 'verify' && 'Enter the verification code from your app'}
            </DialogDescription>
            {/* Step indicator */}
            <div className="flex items-center gap-2 pt-2">
              {['password', 'qr', 'verify'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step === s
                        ? 'bg-[#03b3c3]'
                        : ['password', 'qr', 'verify'].indexOf(step) > i
                          ? 'bg-[#03b3c3]/50'
                          : 'bg-white/10'
                    }`}
                  />
                  {i < 2 && (
                    <div
                      className={`w-8 h-0.5 transition-colors ${
                        ['password', 'qr', 'verify'].indexOf(step) > i
                          ? 'bg-[#03b3c3]/50'
                          : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>

          {step === 'password' && (
            <div className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel className="block text-sm font-medium text-gray-300">
                    Password
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#03b3c3] focus:ring-[3px] focus:ring-[#03b3c3]/20 transition-all duration-200"
                        autoComplete="current-password"
                      />
                    </div>
                  </FieldContent>
                </Field>
              </FieldGroup>
              <DialogFooter className="pt-4 border-t border-white/5">
                <Button
                  variant="outline"
                  onClick={() => setShowEnableDialog(false)}
                  className="border-white/10 text-white hover:bg-white/5 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEnable2FA}
                  disabled={!password || loading}
                  className="bg-[#d856bf] hover:bg-[#c247ac] text-white shadow-lg shadow-[#d856bf]/20 hover:shadow-[#d856bf]/30 transition-all duration-200"
                >
                  {loading ? <Spinner /> : 'Continue'}
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 'qr' && (
            <div className="space-y-4">
              {totpUri ? (
                <>
                  <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl">
                    <QRCode value={totpUri} size={180} />
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <Smartphone className="w-5 h-5 text-[#03b3c3] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-400">
                      Scan this QR code with your authenticator app (Google
                      Authenticator, Authy, 1Password, etc.)
                    </p>
                  </div>
                  <DialogFooter className="pt-4 border-t border-white/5">
                    <Button
                      variant="outline"
                      onClick={() => setStep('password')}
                      className="border-white/10 text-white hover:bg-white/5 transition-all duration-200"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep('verify')}
                      className="bg-[#d856bf] hover:bg-[#c247ac] text-white shadow-lg shadow-[#d856bf]/20 hover:shadow-[#d856bf]/30 transition-all duration-200"
                    >
                      I've Scanned the Code
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">
                      Failed to generate QR code. Please try again.
                    </p>
                  </div>
                  <DialogFooter className="pt-4 border-t border-white/5">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep('password')
                        setTotpUri(null)
                      }}
                      className="border-white/10 text-white hover:bg-white/5 transition-all duration-200"
                    >
                      Back
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel className="block text-sm font-medium text-gray-300 mb-3 text-center">
                    Enter the 6-digit code from your authenticator app
                  </FieldLabel>
                  <FieldContent>
                    <InputOTP
                      maxLength={6}
                      value={verificationCode}
                      onChange={(value) => setVerificationCode(value)}
                      containerClassName="justify-center"
                      autoFocus
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot
                          index={0}
                          className="w-12 h-14 rounded-xl border-white/10 bg-white/5 text-white text-xl font-mono data-[active=true]:border-[#03b3c3] data-[active=true]:ring-[#03b3c3]/20"
                        />
                        <InputOTPSlot
                          index={1}
                          className="w-12 h-14 rounded-xl border-white/10 bg-white/5 text-white text-xl font-mono data-[active=true]:border-[#03b3c3] data-[active=true]:ring-[#03b3c3]/20"
                        />
                        <InputOTPSlot
                          index={2}
                          className="w-12 h-14 rounded-xl border-white/10 bg-white/5 text-white text-xl font-mono data-[active=true]:border-[#03b3c3] data-[active=true]:ring-[#03b3c3]/20"
                        />
                        <InputOTPSlot
                          index={3}
                          className="w-12 h-14 rounded-xl border-white/10 bg-white/5 text-white text-xl font-mono data-[active=true]:border-[#03b3c3] data-[active=true]:ring-[#03b3c3]/20"
                        />
                        <InputOTPSlot
                          index={4}
                          className="w-12 h-14 rounded-xl border-white/10 bg-white/5 text-white text-xl font-mono data-[active=true]:border-[#03b3c3] data-[active=true]:ring-[#03b3c3]/20"
                        />
                        <InputOTPSlot
                          index={5}
                          className="w-12 h-14 rounded-xl border-white/10 bg-white/5 text-white text-xl font-mono data-[active=true]:border-[#03b3c3] data-[active=true]:ring-[#03b3c3]/20"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FieldContent>
                </Field>
              </FieldGroup>
              <DialogFooter className="pt-4 border-t border-white/5">
                <Button
                  variant="outline"
                  onClick={() => setStep('qr')}
                  className="border-white/10 text-white hover:bg-white/5 transition-all duration-200"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerify2FA}
                  disabled={verificationCode.length !== 6 || loading}
                  className="bg-[#d856bf] hover:bg-[#c247ac] text-white shadow-lg shadow-[#d856bf]/20 hover:shadow-[#d856bf]/30 transition-all duration-200"
                >
                  {loading ? <Spinner /> : 'Verify & Enable'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md bg-neutral-900/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20">
                <ShieldOff className="w-5 h-5 text-red-400" />
              </div>
              <DialogTitle className="text-white text-lg">
                Disable Two-Factor Authentication
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 text-sm">
              Enter your password to disable two-factor authentication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">
                Disabling 2FA will make your account less secure. You can always
                re-enable it later.
              </p>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel className="block text-sm font-medium text-gray-300">
                  Password
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#03b3c3] focus:ring-[3px] focus:ring-[#03b3c3]/20 transition-all duration-200"
                      autoComplete="current-password"
                    />
                  </div>
                </FieldContent>
              </Field>
            </FieldGroup>
            <DialogFooter className="pt-4 border-t border-white/5">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisableDialog(false)
                  setPassword('')
                }}
                className="border-white/10 text-white hover:bg-white/5 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDisable2FA}
                disabled={!password || loading}
                className="bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all duration-200"
              >
                {loading ? <Spinner /> : 'Disable 2FA'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog
        open={showBackupCodesDialog}
        onOpenChange={setShowBackupCodesDialog}
      >
        <DialogContent className="sm:max-w-md bg-neutral-900/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#03b3c3]/10 border border-[#03b3c3]/20">
                <Key className="w-5 h-5 text-[#03b3c3]" />
              </div>
              <DialogTitle className="text-white text-lg">
                Backup Codes
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 text-sm">
              Save these codes in a safe place. You can use them to access your
              account if you lose access to your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {backupCodes.length > 0 ? (
              <>
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-300">
                    Each code can only be used once. Store them securely.
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code) => (
                      <div
                        key={code}
                        className="p-2.5 bg-white/5 rounded-lg text-white text-center hover:bg-white/10 transition-colors cursor-default border border-transparent hover:border-white/10"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={copyBackupCodes}
                    className="flex-1 border-white/10 text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadBackupCodes}
                    className="flex-1 border-white/10 text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-400 text-sm">
                  No backup codes available. Generate new codes below.
                </p>
              </div>
            )}
            <DialogFooter className="pt-4 border-t border-white/5">
              <Button
                onClick={() => {
                  setShowBackupCodesDialog(false)
                  setBackupCodes([])
                }}
                className="w-full bg-[#d856bf] hover:bg-[#c247ac] text-white shadow-lg shadow-[#d856bf]/20 hover:shadow-[#d856bf]/30 transition-all duration-200"
              >
                {backupCodes.length > 0 ? "I've Saved These Codes" : 'Close'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Backup Codes Dialog */}
      <Dialog
        open={showGenerateBackupCodesDialog}
        onOpenChange={setShowGenerateBackupCodesDialog}
      >
        <DialogContent className="sm:max-w-md bg-neutral-900/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#d856bf]/10 border border-[#d856bf]/20">
                <Key className="w-5 h-5 text-[#d856bf]" />
              </div>
              <DialogTitle className="text-white text-lg">
                Generate New Backup Codes
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 text-sm">
              Enter your password to generate new backup codes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-300">
                Generating new codes will invalidate all your existing backup
                codes.
              </p>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel className="block text-sm font-medium text-gray-300">
                  Password
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#03b3c3] focus:ring-[3px] focus:ring-[#03b3c3]/20 transition-all duration-200"
                      autoComplete="current-password"
                    />
                  </div>
                </FieldContent>
              </Field>
            </FieldGroup>
            <DialogFooter className="pt-4 border-t border-white/5">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGenerateBackupCodesDialog(false)
                  setPassword('')
                }}
                className="border-white/10 text-white hover:bg-white/5 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateBackupCodes}
                disabled={!password || loading}
                className="bg-[#d856bf] hover:bg-[#c247ac] text-white shadow-lg shadow-[#d856bf]/20 hover:shadow-[#d856bf]/30 transition-all duration-200"
              >
                {loading ? <Spinner /> : 'Generate Codes'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
