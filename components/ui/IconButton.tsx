'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obligatoire : nom accessible du bouton (il n'a pas de texte visible). */
  label: string
  variant?: 'ghost' | 'surface'
}

/** Bouton icône avec zone cliquable de 44px minimum. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, variant = 'ghost', className, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-deep-green focus-visible:ring-offset-2 disabled:opacity-50',
        variant === 'ghost' ? 'text-charcoal hover:bg-sand' : 'bg-surface text-charcoal shadow-card hover:bg-sand',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
IconButton.displayName = 'IconButton'
