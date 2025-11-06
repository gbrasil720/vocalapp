/** biome-ignore-all lint/correctness/noChildrenProp: <explanation> */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */

'use client'

import { MailIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel
} from '../ui/field'
import { Input } from '../ui/input'
import { Spinner } from '../ui/spinner'

export function MagicLinkForm() {
  const router = useRouter()
  const [emailSent, setEmailSent] = useState(false)
  const [errorState, setErrorState] = useState<{
    show: boolean
    email: string
    message: string
  }>({
    show: false,
    email: '',
    message: ''
  })

  const form = useForm({
    defaultValues: {
      email: ''
    },
    onSubmit: async (values) => {
      try {
        const result = await authClient.signIn.magicLink({
          email: values.value.email,
          callbackURL: `${window.location.origin}/dashboard`
        })

        // Check if there was an error in the response
        if (result?.error) {
          console.log('Magic link error:', result.error)
          const errorMessage =
            result.error.message ||
            'Failed to send magic link. Please try again.'

          // Show error state instead of just toast
          setErrorState({
            show: true,
            email: values.value.email,
            message: errorMessage
          })
          toast.error(errorMessage)
          return
        }

        setEmailSent(true)
        toast.success('Magic link sent! Check your email to sign in.')
      } catch (error: any) {
        console.log('Magic link error (caught):', error)

        // Extract error message from different possible structures
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          error?.toString() ||
          'Failed to send magic link. Please try again.'

        // Show error state instead of just toast
        setErrorState({
          show: true,
          email: values.value.email,
          message: errorMessage
        })
        toast.error(errorMessage)
      }
    }
  })

  // Error State - Not Approved
  if (errorState.show) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">
          Access Not Approved
        </h3>
        <p className="text-gray-400">
          <span className="text-red-400">{errorState.email}</span> is not on the
          approved beta list.
        </p>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-gray-300">
            This email hasn't been approved for beta access yet. Join our
            waitlist to get early access when we open more slots!
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => {
              setErrorState({ show: false, email: '', message: '' })
              form.reset()
            }}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            Try Another Email
          </Button>
          <Button
            type="button"
            onClick={() => {
              window.location.href = '/#waitlist'
            }}
            className="w-full bg-gradient-to-r from-[#03b3c3] to-[#028a96] hover:from-[#028a96] hover:to-[#03b3c3] text-white"
          >
            Join Waitlist
          </Button>
        </div>
      </div>
    )
  }

  // Success State - Email Sent
  if (emailSent) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full flex items-center justify-center">
          <HugeiconsIcon icon={MailIcon} size={32} color="white" />
        </div>
        <h3 className="text-xl font-semibold text-white">Check your email</h3>
        <p className="text-gray-400">
          We've sent a magic link to{' '}
          <span className="text-[#03b3c3]">{form.state.values.email}</span>
        </p>
        <p className="text-sm text-gray-500">
          Click the link in the email to sign in. The link will expire in 15
          minutes.
        </p>
        <Button
          type="button"
          variant="link"
          onClick={() => setEmailSent(false)}
          className="text-[#03b3c3] hover:text-[#d856bf]"
        >
          Try a different email
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-3"
      id="magic-link-form"
    >
      <FieldGroup>
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'Email is required'
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return 'Please enter a valid email address'
              }
              return undefined
            }
          }}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-300"
                >
                  Email Address
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <HugeiconsIcon
                      icon={MailIcon}
                      size={22}
                      color="#99a1af "
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    />
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className={cn(
                        'w-full pl-10 pr-12 py-6 placeholder:text-md bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200',
                        isInvalid && 'border-red-500/50 focus:ring-red-500/30'
                      )}
                      placeholder="john@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {isInvalid && (
                    <FieldError
                      errors={[
                        {
                          message: field.state.meta.errors[0]?.toString()
                        }
                      ]}
                    />
                  )}
                </FieldContent>
              </Field>
            )
          }}
        />
      </FieldGroup>

      <Button
        type="submit"
        form="magic-link-form"
        className="cursor-pointer w-full py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#c247ac] hover:to-[#d856bf] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? <Spinner /> : 'Continue with Email'}
      </Button>
    </form>
  )
}
