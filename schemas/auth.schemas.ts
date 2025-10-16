import { z } from 'zod'

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

export type SignInSchema = z.infer<typeof signInSchema>
