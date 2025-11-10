import z from 'zod'

export const feedbackFormSchema = z.object({
  category: z.enum(['bug', 'feature', 'workflow', 'praise', 'other']),
  impact: z.enum(['blocking', 'slowdown', 'nice-to-have', 'delight']),
  message: z.string().min(10, 'Add a few more details so we can help'),
  allowContact: z.boolean()
})
