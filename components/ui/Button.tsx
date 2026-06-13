'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'coral' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-deep-green text-coconut hover:bg-deep-green-light active:scale-[0.98] shadow-sm',
  secondary:
    'bg-sand text-charcoal hover:bg-mist active:scale-[0.98]',
  ghost:
    'bg-transparent text-charcoal hover:bg-sand active:scale-[0.98]',
  coral:
    'bg-coral text-coconut hover:bg-coral-light active:scale-[0.98] shadow-sm',
  outline:
    'bg-transparent text-deep-green border border-deep-green hover:bg-sand active:scale-[0.98]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-12 px-6 text-base rounded-xl',
  lg: 'h-14 px-8 text-lg rounded-2xl',
  icon: 'h-10 w-10 rounded-full',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          'focus-visible:ring-2 focus-visible:ring-deep-green focus-visible:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
