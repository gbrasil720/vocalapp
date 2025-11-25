import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter'
  })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter'
  })
  .regex(/\d/, { message: 'Password must contain at least one number' })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character'
  })

export const signInSchema = z
  .object({
    email: z.email().min(1, { message: 'Email is required' }),
    password: z.string().min(1, { message: 'Password is required' })
  })
  .refine(
    (data) => {
      return data.email.length > 0 && data.password.length > 0
    },
    {
      message: 'Email and password are required',
      path: ['email', 'password']
    }
  )

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name is required' }).trim(),
    lastName: z.string().min(1, { message: 'Last name is required' }).trim(),
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .min(1, { message: 'Email is required' }),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .min(1, { message: 'Email is required' })
})

export type SignInSchema = z.infer<typeof signInSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
