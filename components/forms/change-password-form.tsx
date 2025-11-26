/** biome-ignore-all lint/correctness/noChildrenProp: Required by TanStack Form API */
'use client'

import {
  SquareLock02Icon,
  ViewIcon,
  ViewOffIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
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
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordStrength } from '@/components/ui/password-strength'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

// Schema factories - these will be created inside the component to access hasPassword
const createChangePasswordSchema = (hasPassword: boolean) =>
  z
    .object({
      currentPassword: z.string().optional(),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
      revokeOtherSessions: z.boolean().default(false)
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword']
    })
    .refine(
      (data) => {
        // If user has password, currentPassword is required
        if (hasPassword) {
          return data.currentPassword && data.currentPassword.length > 0
        }
        return true
      },
      {
        message: 'Current password is required',
        path: ['currentPassword']
      }
    )

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

interface ChangePasswordFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasPassword?: boolean
  onPasswordSet?: () => void
}

export function ChangePasswordForm({
  open,
  onOpenChange,
  hasPassword = true,
  onPasswordSet
}: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: false
    },
    validators: {
      onSubmit: ({ value }) => {
        const schema = hasPassword
          ? createChangePasswordSchema(hasPassword)
          : setPasswordSchema
        const result = schema.safeParse(value)
        if (!result.success) {
          // Return validation errors to prevent submission
          // TanStack Form will not call async onSubmit if this returns errors
          const fieldErrors: Record<string, string[]> = {}
          for (const [key, value] of Object.entries(
            result.error.flatten().fieldErrors
          )) {
            fieldErrors[key] = Array.isArray(value) ? value : [value as string]
          }
          return fieldErrors
        }
        // Return undefined to allow submission
        return undefined
      }
    },
    onSubmit: async ({ value }) => {
      // Double-check validation before submitting
      const schema = hasPassword
        ? createChangePasswordSchema(hasPassword)
        : setPasswordSchema
      const validationResult = schema.safeParse(value)

      if (!validationResult.success) {
        // Show validation errors
        const errors = validationResult.error.flatten().fieldErrors

        // Show toast for the first error
        if (errors.confirmPassword) {
          toast.error(
            Array.isArray(errors.confirmPassword)
              ? errors.confirmPassword[0]
              : errors.confirmPassword
          )
        } else if (errors.newPassword) {
          toast.error(
            Array.isArray(errors.newPassword)
              ? errors.newPassword[0]
              : errors.newPassword
          )
        } else if (
          hasPassword &&
          'currentPassword' in errors &&
          errors.currentPassword
        ) {
          toast.error(
            Array.isArray(errors.currentPassword)
              ? errors.currentPassword[0]
              : errors.currentPassword
          )
        }
        return // Stop here, don't submit - this prevents the spinner from continuing
      }

      try {
        if (hasPassword) {
          // Change password flow
          const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              currentPassword: value.currentPassword,
              newPassword: value.newPassword,
              revokeOtherSessions: value.revokeOtherSessions
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to change password')
          }

          toast.success('Password changed successfully')
        } else {
          // Set password flow
          const response = await fetch('/api/auth/set-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              newPassword: value.newPassword
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to set password')
          }

          toast.success('Password set successfully')
          // Notify parent that password was set
          onPasswordSet?.()
        }

        form.reset()
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : hasPassword
              ? 'Failed to change password'
              : 'Failed to set password'
        )
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-neutral-900/95 backdrop-blur-xl border-white/10 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#d856bf]/10 border border-[#d856bf]/20">
              <KeyRound className="w-5 h-5 text-[#d856bf]" />
            </div>
            <DialogTitle className="text-white text-lg">
              {hasPassword ? 'Change Password' : 'Set Password'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 text-sm">
            {hasPassword
              ? 'Enter your current password and choose a new one'
              : 'Set a password for your account to enable password-based login'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            {hasPassword && (
              <form.Field
                name="currentPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel
                        htmlFor={field.name}
                        className="block text-sm font-medium text-gray-300"
                      >
                        Current Password
                      </FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <HugeiconsIcon
                            icon={SquareLock02Icon}
                            size={22}
                            color="#99a1af"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
                          />
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid ? 'true' : 'false'}
                            className={cn(
                              'w-full pl-10 pr-12 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#03b3c3] transition-all duration-200 focus:ring-[3px] focus:ring-[#03b3c3]/20',
                              isInvalid &&
                                'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                            )}
                            placeholder="Enter current password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                          />
                          <Button
                            variant="link"
                            type="button"
                            size="icon"
                            className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <HugeiconsIcon
                                icon={ViewIcon}
                                size={22}
                                color="#99a1af"
                              />
                            ) : (
                              <HugeiconsIcon
                                icon={ViewOffIcon}
                                size={22}
                                color="#99a1af"
                              />
                            )}
                          </Button>
                        </div>
                        {isInvalid && field.state.meta.errors.length > 0 && (
                          <FieldError
                            errors={field.state.meta.errors.map((err) => ({
                              message:
                                typeof err === 'string'
                                  ? err
                                  : typeof err === 'object' &&
                                      err !== null &&
                                      'message' in err
                                    ? String(
                                        (err as { message?: string }).message ||
                                          'Invalid input'
                                      )
                                    : 'Invalid input'
                            }))}
                          />
                        )}
                      </FieldContent>
                    </Field>
                  )
                }}
              />
            )}
            <form.Field
              name="newPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-300"
                    >
                      New Password
                    </FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <HugeiconsIcon
                          icon={SquareLock02Icon}
                          size={22}
                          color="#99a1af"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
                        />
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid ? 'true' : 'false'}
                          className={cn(
                            'w-full pl-10 pr-12 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#03b3c3] transition-all duration-200 focus:ring-[3px] focus:ring-[#03b3c3]/20',
                            isInvalid &&
                              'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                          )}
                          placeholder="Enter new password"
                          type={showNewPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                        />
                        <Button
                          variant="link"
                          type="button"
                          size="icon"
                          className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <HugeiconsIcon
                              icon={ViewIcon}
                              size={22}
                              color="#99a1af"
                            />
                          ) : (
                            <HugeiconsIcon
                              icon={ViewOffIcon}
                              size={22}
                              color="#99a1af"
                            />
                          )}
                        </Button>
                      </div>
                      {/* Password Strength Indicator */}
                      <PasswordStrength
                        password={field.state.value}
                        className="mt-3"
                      />
                      {isInvalid && field.state.meta.errors.length > 0 && (
                        <FieldError
                          errors={field.state.meta.errors.map((err) => ({
                            message:
                              typeof err === 'string'
                                ? err
                                : typeof err === 'object' &&
                                    err !== null &&
                                    'message' in err
                                  ? String(
                                      (err as { message?: string }).message ||
                                        'Invalid input'
                                    )
                                  : 'Invalid input'
                          }))}
                        />
                      )}
                    </FieldContent>
                  </Field>
                )
              }}
            />
            <form.Field
              name="confirmPassword"
              validators={{
                onChange: ({ value }) => {
                  // Basic validation - password matching is handled in onSubmit
                  if (!value || value.length === 0) {
                    return 'Please confirm your password'
                  }
                  return undefined
                }
              }}
              children={(field) => {
                // Get newPassword value for real-time comparison
                const newPasswordValue = form.getFieldValue('newPassword')
                const passwordsDontMatch =
                  field.state.value &&
                  newPasswordValue &&
                  field.state.value !== newPasswordValue &&
                  field.state.meta.isTouched

                const isInvalid =
                  (field.state.meta.isTouched && !field.state.meta.isValid) ||
                  passwordsDontMatch

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-300"
                    >
                      Confirm New Password
                    </FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <HugeiconsIcon
                          icon={SquareLock02Icon}
                          size={22}
                          color="#99a1af"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
                        />
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                            // Re-validate this field when it changes
                            field.validate('change')
                          }}
                          aria-invalid={isInvalid ? 'true' : 'false'}
                          className={cn(
                            'w-full pl-10 pr-12 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#03b3c3] transition-all duration-200 focus:ring-[3px] focus:ring-[#03b3c3]/20',
                            isInvalid &&
                              'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                          )}
                          placeholder="Confirm new password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                        />
                        <Button
                          variant="link"
                          type="button"
                          size="icon"
                          className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <HugeiconsIcon
                              icon={ViewIcon}
                              size={22}
                              color="#99a1af"
                            />
                          ) : (
                            <HugeiconsIcon
                              icon={ViewOffIcon}
                              size={22}
                              color="#99a1af"
                            />
                          )}
                        </Button>
                      </div>
                      {isInvalid && (
                        <FieldError
                          errors={[
                            {
                              message: passwordsDontMatch
                                ? "Passwords don't match"
                                : field.state.meta.errors.length > 0
                                  ? typeof field.state.meta.errors[0] ===
                                    'string'
                                    ? field.state.meta.errors[0]
                                    : typeof field.state.meta.errors[0] ===
                                          'object' &&
                                        field.state.meta.errors[0] !== null &&
                                        'message' in field.state.meta.errors[0]
                                      ? String(
                                          (
                                            field.state.meta.errors[0] as {
                                              message?: string
                                            }
                                          ).message ||
                                            'Please confirm your password'
                                        )
                                      : 'Please confirm your password'
                                  : 'Please confirm your password'
                            }
                          ]}
                        />
                      )}
                    </FieldContent>
                  </Field>
                )
              }}
            />
            {hasPassword && (
              <form.Field
                name="revokeOtherSessions"
                children={(field) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={field.name}
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#03b3c3] focus:ring-[#03b3c3] focus:ring-offset-0"
                    />
                    <label
                      htmlFor={field.name}
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      Revoke all other sessions
                    </label>
                  </div>
                )}
              />
            )}
          </FieldGroup>
          <form.Subscribe
            selector={(state) => ({
              values: state.values,
              isSubmitting: state.isSubmitting
            })}
            children={({ values, isSubmitting }) => {
              const newPassword = values.newPassword || ''
              const confirmPassword = values.confirmPassword || ''
              const currentPassword = values.currentPassword || ''

              // Calculate if button should be disabled
              let isDisabled = isSubmitting

              if (!isDisabled) {
                // For set password (no current password required)
                if (!hasPassword) {
                  isDisabled =
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 8
                } else {
                  // For change password (current password required)
                  isDisabled =
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 8
                }
              }

              return (
                <DialogFooter className="pt-4 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="border-white/10 text-white hover:bg-white/5 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isDisabled}
                    className="bg-[#d856bf] hover:bg-[#c247ac] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#d856bf]/20 hover:shadow-[#d856bf]/30"
                  >
                    {isSubmitting ? (
                      <Spinner />
                    ) : hasPassword ? (
                      'Change Password'
                    ) : (
                      'Set Password'
                    )}
                  </Button>
                </DialogFooter>
              )
            }}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
