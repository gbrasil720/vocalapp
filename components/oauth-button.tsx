'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { GoogleIcon } from './assets/google-icon'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export function OAuthButton() {
  const [wasGoogleLastLoginMethod, setWasGoogleLastLoginMethod] =
    useState(false)

  useEffect(() => {
    // Only check on client-side to avoid hydration mismatch
    setWasGoogleLastLoginMethod(authClient.isLastUsedLoginMethod('google'))
  }, [])

  const signIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google'
      })
    } catch (error) {
      console.log(error)
      toast.error('Failed to sign in with Google')
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={signIn}
      className="cursor-pointer w-full py-3 bg-white/5 border-white/20 hover:bg-white/10 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
    >
      <GoogleIcon />
      Continue with Google
      {wasGoogleLastLoginMethod && (
        <Badge asChild>
          <span className="text-xs text-green-500">Last used</span>
        </Badge>
      )}
    </Button>
  )
}
