/** biome-ignore-all lint/correctness/noChildrenProp: <explanation> */
import { useForm } from '@tanstack/react-form'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { signInSchema } from '@/schemas/auth.schemas'
import { Button } from '../ui/button'
import { Field, FieldContent, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { Spinner } from '../ui/spinner'

export function SignInForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    validators: {
      onSubmit: signInSchema
    },
    onSubmit: async (values) => {
      await authClient.signIn.email(
        {
          email: values.value.email,
          password: values.value.password,
          callbackURL: `${window.location.origin}/dashboard`
        },
        {
          onSuccess: () => {
            toast.success('Signed in successfully! Redirecting to dashboard...')
          },
          onError: (error) => {
            toast.error(error.error.message)
          },
          onSettled: () => {
            router.push('/dashboard')
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
      className="space-y-6"
      id="sign-in-form"
    >
      <FieldGroup>
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                </FieldContent>
              </Field>
            )
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
                      placeholder="Enter your password"
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
                        <Eye
                          size={22}
                          className="text-gray-400 cursor-pointer"
                        />
                      ) : (
                        <EyeOff
                          size={22}
                          className="text-gray-400 cursor-pointer"
                        />
                      )}
                    </Button>
                  </div>
                </FieldContent>
              </Field>
            )
          }}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-[#03b3c3] hover:text-[#d856bf] transition-colors duration-200"
        >
          Forgot your password?
        </Link>
      </div>

      <Button
        type="submit"
        form="sign-in-form"
        className="cursor-pointer w-full py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] hover:from-[#c247ac] hover:to-[#d856bf] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {form.state.isSubmitting ? <Spinner /> : 'Sign In'}
      </Button>
    </form>
  )
}
