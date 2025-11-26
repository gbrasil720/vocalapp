import * as React from 'react'

import { cn } from '@/lib/utils'

interface InputProps extends React.ComponentProps<'input'> {
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leadingIcon, trailingIcon, error, ...props }, ref) => {
    // If no icons, use the simple version
    if (!leadingIcon && !trailingIcon) {
      return (
        <input
          type={type}
          ref={ref}
          data-slot="input"
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'transition-all duration-200',
            'focus-visible:border-[#03b3c3] focus-visible:ring-[3px] focus-visible:ring-[#03b3c3]/20',
            error &&
              'border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            className
          )}
          {...props}
        />
      )
    }

    // With icons, wrap in a container
    return (
      <div className="relative w-full">
        {leadingIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            {leadingIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          data-slot="input"
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'transition-all duration-200',
            'focus-visible:border-[#03b3c3] focus-visible:ring-[3px] focus-visible:ring-[#03b3c3]/20',
            error &&
              'border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            leadingIcon ? 'pl-10' : 'pl-3',
            trailingIcon ? 'pr-10' : 'pr-3',
            className
          )}
          {...props}
        />
        {trailingIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailingIcon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
export type { InputProps }
