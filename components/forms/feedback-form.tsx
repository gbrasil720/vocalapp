'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Input } from '@/components/ui/input'

const CATEGORY_VALUES = [
  'bug',
  'feature',
  'workflow',
  'praise',
  'other'
] as const
const IMPACT_VALUES = [
  'blocking',
  'slowdown',
  'nice-to-have',
  'delight'
] as const

const categories = [
  { value: CATEGORY_VALUES[0], label: 'Bug or issue' },
  { value: CATEGORY_VALUES[1], label: 'Feature request' },
  { value: CATEGORY_VALUES[2], label: 'Workflow question' },
  { value: CATEGORY_VALUES[3], label: 'Shout-out / praise' },
  { value: CATEGORY_VALUES[4], label: 'Something else' }
]

const impactLevels = [
  { value: IMPACT_VALUES[0], label: 'Blocking my work' },
  { value: IMPACT_VALUES[1], label: 'Slowing me down' },
  { value: IMPACT_VALUES[2], label: 'Nice to have' },
  { value: IMPACT_VALUES[3], label: 'Delight / success story' }
]

const FeedbackSchema = z.object({
  name: z.string().min(2, 'Let us know who you are'),
  email: z.string().email('Please provide a valid email').optional(),
  category: z.enum(CATEGORY_VALUES),
  impact: z.enum(IMPACT_VALUES),
  message: z.string().min(10, 'Add a few more details so we can help'),
  allowContact: z.boolean()
})

type FeedbackValues = z.infer<typeof FeedbackSchema>

const initialValues: FeedbackValues = {
  name: '',
  email: undefined,
  category: 'bug',
  impact: 'blocking',
  message: '',
  allowContact: true
}

type FeedbackErrors = Partial<Record<keyof FeedbackValues, string>>

export function FeedbackForm() {
  const [values, setValues] = useState<FeedbackValues>(initialValues)
  const [errors, setErrors] = useState<FeedbackErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = <T extends keyof FeedbackValues>(
    field: T,
    value: FeedbackValues[T]
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value
    }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = {
      ...values,
      email: values.email?.trim() ? values.email.trim() : undefined,
      message: values.message.trim()
    }

    const parsed = FeedbackSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors: FeedbackErrors = {}
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0]
        if (typeof path === 'string') {
          fieldErrors[path as keyof FeedbackValues] = issue.message
        }
      })
      setErrors(fieldErrors)
      toast.error('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsed.data)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Unable to send feedback right now.')
      }

      setValues(initialValues)
      toast.success(
        'Thanks! We received your feedback and will follow up soon.'
      )
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error(
        'We could not submit your feedback. Please try again in a moment.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-transparent p-8 backdrop-blur-xl">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-semibold text-white">
          Share your feedback
        </h2>
        <p className="text-gray-300">
          Tell us what’s working, what’s confusing, or what you want next. We
          review every submission and reach out if we need more detail.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="feedback-name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Your name
            </label>
            <Input
              id="feedback-name"
              value={values.name}
              placeholder="Jane Doe"
              aria-invalid={Boolean(errors.name)}
              onChange={(event) => handleChange('name', event.target.value)}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="feedback-email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email (optional, helps us follow up)
            </label>
            <Input
              type="email"
              id="feedback-email"
              value={values.email ?? ''}
              placeholder="jane@startup.com"
              aria-invalid={Boolean(errors.email)}
              onChange={(event) =>
                handleChange('email', event.target.value || undefined)
              }
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-400">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="feedback-category"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Category
            </label>
            <select
              value={values.category}
              id="feedback-category"
              onChange={(event) =>
                handleChange(
                  'category',
                  event.target.value as FeedbackValues['category']
                )
              }
              className="w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-gray-200 focus:border-[#03b3c3] focus:outline-none focus:ring-2 focus:ring-[#03b3c3]/40"
            >
              {categories.map((category) => (
                <option
                  key={category.value}
                  value={category.value}
                  className="bg-[#05050a]"
                >
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="feedback-impact"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Impact
            </label>
            <select
              value={values.impact}
              id="feedback-impact"
              onChange={(event) =>
                handleChange(
                  'impact',
                  event.target.value as FeedbackValues['impact']
                )
              }
              className="w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-gray-200 focus:border-[#03b3c3] focus:outline-none focus:ring-2 focus:ring-[#03b3c3]/40"
            >
              {impactLevels.map((impact) => (
                <option
                  key={impact.value}
                  value={impact.value}
                  className="bg-[#05050a]"
                >
                  {impact.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="feedback-message"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            What’s happening?
          </label>
          <textarea
            value={values.message}
            id="feedback-message"
            onChange={(event) => handleChange('message', event.target.value)}
            rows={6}
            placeholder="Walk us through the scenario, steps to reproduce, or the workflow you’re envisioning."
            aria-invalid={Boolean(errors.message)}
            className="w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-gray-200 focus:border-[#03b3c3] focus:outline-none focus:ring-2 focus:ring-[#03b3c3]/40"
          />
          {errors.message && (
            <p className="mt-2 text-sm text-red-400">{errors.message}</p>
          )}
        </div>

        <label className="flex items-start gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={values.allowContact}
            onChange={(event) =>
              handleChange('allowContact', event.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#03b3c3] focus:ring-[#03b3c3]/60"
          />
          <span>
            I’m okay with the Vocal team contacting me about this feedback.
            We’ll reach out if we need more detail or have updates.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#d856bf] to-[#03b3c3] px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send feedback'}
          </button>
          <p className="text-xs text-gray-500">
            Our average response time during the beta is under 24 hours. We’ll
            tag your note in the roadmap so you can track it.
          </p>
        </div>
      </form>
    </div>
  )
}
