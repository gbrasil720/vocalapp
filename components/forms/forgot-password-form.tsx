/** biome-ignore-all lint/correctness/noChildrenProp: tanform field requires children prop */
'use client'

import { MailIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { forgotPasswordSchema } from '@/schemas/auth.schemas'

export function ForgotPasswordForm() {
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const form = useForm({
    defaultValues: {
      email: ''
    },
    validators: {
      onSubmit: forgotPasswordSchema
    },
    onSubmit: async (values) => {
      await authClient.requestPasswordReset(
        {
          email: values.value.email,
          redirectTo: `${window.location.origin}/reset-password`
        },
        {
          onSuccess: () => {
            setSentEmail(values.value.email)
            setIsEmailSent(true)
            toast.success('Reset link sent to your email!')
          },
          onError: (ctx) => {
            const errorMessage =
              ctx.error.message ||
              'Failed to send reset link. Please try again.'
            toast.error(errorMessage)
          }
        }
      )
    }
  })

  return (
    <>
      {!isEmailSent ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-6"
          id="forgot-password-form"
        >
          <FieldGroup>
            <form.Field
              name="email"
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
                            isInvalid
                              ? 'border-red-500/50 focus:ring-red-500/30'
                              : 'border-white/20 focus:ring-[#03b3c3]/30 focus:border-[#03b3c3]/50'
                          )}
                          placeholder="john@example.com"
                          autoComplete="off"
                        />
                      </div>
                      {isInvalid && (
                        <FieldError
                          errors={[
                            {
                              message:
                                typeof field.state.meta.errors[0] === 'string'
                                  ? field.state.meta.errors[0]
                                  : field.state.meta.errors[0]?.message ||
                                    'Please enter a valid email address'
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
            form="forgot-password-form"
            disabled={form.state.isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#c247ac] hover:to-[#d856bf] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {form.state.isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner />
                Sending Reset Link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Check Your Email
            </h3>
            <p className="text-gray-400">
              We&apos;ve sent a password reset link to{' '}
              <span className="text-[#03b3c3]">{sentEmail}</span>
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => {
                setSentEmail('')
                setIsEmailSent(false)
              }}
              className="w-full py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#c247ac] hover:to-[#d856bf] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Send Another Email
            </Button>
            <Link
              href="/sign-in"
              className="block w-full py-3 text-center text-[#03b3c3] hover:text-[#d856bf] transition-colors duration-200 font-medium"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {!isEmailSent && (
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Remember your password?{' '}
            <Link
              href="/sign-in"
              className="text-[#03b3c3] hover:text-[#d856bf] transition-colors duration-200 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}
    </>
  )
}
