/** biome-ignore-all lint/correctness/noChildrenProp: tanform field requires children prop */

import {
  MailIcon,
  SquareLock02Icon,
  UserIcon,
  ViewIcon,
  ViewOffIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { signUpSchema } from '@/schemas/auth.schemas'
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

export function SignUpForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validators: {
      onSubmit: signUpSchema
    },
    onSubmit: async (values) => {
      await authClient.signUp.email(
        {
          email: values.value.email,
          name: `${values.value.firstName} ${values.value.lastName}`,
          password: values.value.password
        },
        {
          onSuccess: () => {
            toast.success(
              'Account created successfully! Redirecting to dashboard...'
            )
            router.push('/dashboard')
          },
          onError: (error) => {
            toast.error(error.error.message)
          }
        }
      )
    }
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-3"
      id="sign-up-form"
    >
      <FieldGroup className="grid grid-cols-2 gap-4">
        <form.Field
          name="firstName"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-300"
                >
                  First Name
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    {/* <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
                    <HugeiconsIcon
                      icon={UserIcon}
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
                      placeholder="John"
                      autoComplete="off"
                    />
                  </div>
                  {isInvalid && (
                    <FieldError
                      errors={[
                        {
                          message: field.state.meta.errors[0]?.message
                        }
                      ]}
                    />
                  )}
                </FieldContent>
              </Field>
            )
          }}
        />
        <form.Field
          name="lastName"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-300"
                >
                  Last Name
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    {/* <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
                    <HugeiconsIcon
                      icon={UserIcon}
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
                      placeholder="Doe"
                      autoComplete="off"
                    />
                  </div>
                  {isInvalid && (
                    <FieldError
                      errors={[
                        {
                          message: field.state.meta.errors[0]?.message
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
                    {/* <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
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
                      autoComplete="off"
                    />
                  </div>
                  {isInvalid && (
                    <FieldError
                      errors={[
                        {
                          message: field.state.meta.errors[0]?.message
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
      <FieldGroup>
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    {/* <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
                    <HugeiconsIcon
                      icon={SquareLock02Icon}
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
                      placeholder="Create a strong password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="off"
                    />
                    <Button
                      variant="link"
                      type="button"
                      size="icon"
                      className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <HugeiconsIcon
                          icon={ViewIcon}
                          size={22}
                          color="#99a1af "
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={ViewOffIcon}
                          size={22}
                          color="#99a1af "
                        />
                      )}
                    </Button>
                  </div>
                  {isInvalid && (
                    <FieldError
                      errors={[
                        {
                          message: field.state.meta.errors[0]?.message
                        }
                      ]}
                    />
                  )}
                </FieldContent>
              </Field>
            )
          }}
        />
        <form.Field
          name="confirmPassword"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-300"
                >
                  Confirm Password
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                      placeholder="Confirm your password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="off"
                    />
                    <Button
                      variant="link"
                      type="button"
                      size="icon"
                      className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <HugeiconsIcon
                          icon={ViewIcon}
                          size={22}
                          color="#99a1af "
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={ViewOffIcon}
                          size={22}
                          color="#99a1af "
                        />
                      )}
                    </Button>
                  </div>
                  {isInvalid && (
                    <FieldError
                      errors={[
                        {
                          message: field.state.meta.errors[0]?.message
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
        form="sign-up-form"
        className="cursor-pointer w-full py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#c247ac] hover:to-[#d856bf] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? <Spinner /> : 'Create Account'}
      </Button>
    </form>
  )
}
