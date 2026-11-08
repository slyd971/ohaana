import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={fieldId} className="block text-sm font-medium text-charcoal">{label}</label>}
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          className={cn(
            'w-full min-h-28 rounded-control border bg-surface px-4 py-3 text-charcoal placeholder:text-stone',
            'border-mist transition-colors focus:border-deep-green focus:outline-none focus:ring-2 focus:ring-deep-green/20',
            error && 'border-coral focus:border-coral focus:ring-coral/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-coral-text">{error}</p>}
        {hint && !error && <p className="text-sm text-stone">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
