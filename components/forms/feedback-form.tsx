/** biome-ignore-all lint/correctness/noChildrenProp: <explanation> */
'use client'

import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { feedbackFormSchema } from '@/schemas/dashboard.schemas'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Field, FieldContent, FieldGroup, FieldLabel } from '../ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Spinner } from '../ui/spinner'
import { Textarea } from '../ui/textarea'

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

export function FeedbackForm() {
  const form = useForm({
    defaultValues: {
      category: 'bug',
      impact: 'blocking',
      message: '',
      allowContact: false
    },
    validators: {
      onSubmit: feedbackFormSchema
    },
    onSubmit: async (values) => {
      toast.success('Feedback submitted successfully')

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category: values.value.category,
            impact: values.value.impact,
            message: values.value.message,
            allowContact: values.value.allowContact
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Unable to send feedback right now.')
        }

        toast.success(
          'Thanks! We received your feedback and will follow up soon.'
        )
      } catch (error) {
        console.error('Error submitting feedback:', error)
        toast.error(
          'We could not submit your feedback. Please try again in a moment.'
        )
      }
    }
  })

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

      <form
        id="feedback-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup className="grid grid-cols-2 gap-4">
          <form.Field
            name="category"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid} orientation="responsive">
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger
                        aria-invalid={isInvalid}
                        className="w-full h-20"
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              )
            }}
          />
          <form.Field
            name="impact"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid} orientation="responsive">
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>Impact</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger
                        aria-invalid={isInvalid}
                        className="w-full h-20"
                      >
                        <SelectValue placeholder="Select an impact" />
                      </SelectTrigger>
                      <SelectContent>
                        {impactLevels.map((impact) => (
                          <SelectItem key={impact.value} value={impact.value}>
                            {impact.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              )
            }}
          />
        </FieldGroup>
        <FieldGroup className="mt-4">
          <form.Field
            name="message"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid} orientation="vertical">
                  <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                  <Textarea
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Walk us through the scenario, steps to reproduce, or the workflow you’re envisioning."
                    className="resize-none placeholder:text-md"
                  />
                </Field>
              )
            }}
          />
        </FieldGroup>
        <form.Field
          name="allowContact"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <FieldGroup data-slot="checkbox-group" className="mt-4">
                <Field data-invalid={isInvalid} orientation="horizontal">
                  <Checkbox
                    id={field.name}
                    name={field.name}
                    aria-invalid={isInvalid}
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <FieldLabel htmlFor={field.name}>
                    I’m okay with the Vocal team contacting me about this
                    feedback. We’ll reach out if we need more detail or have
                    updates.
                  </FieldLabel>
                </Field>
              </FieldGroup>
            )
          }}
        />

        <div className="flex items-center mt-4 gap-4">
          <Button
            type="submit"
            form="feedback-form"
            className="cursor-pointer p-6 bg-[#d856bf] text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:bg-[#c247ac]"
          >
            {form.state.isSubmitting ? <Spinner /> : 'Send feedback'}
          </Button>
          <p className="text-xs text-gray-500">
            Our average response time during the beta is under 24 hours. We’ll
            tag your note in the roadmap so you can track it.
          </p>
        </div>
      </form>
    </div>
  )
}
