import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-charcoal">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 rounded-xl border bg-surface px-4 text-charcoal placeholder:text-stone',
              'transition-colors duration-150',
              'border-mist focus:border-deep-green focus:outline-none focus:ring-2 focus:ring-deep-green/20',
              error && 'border-coral focus:border-coral focus:ring-coral/20',
              leftIcon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-coral">{error}</p>}
        {hint && !error && <p className="text-sm text-stone">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
