import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'green' | 'coral' | 'turquoise' | 'stone' | 'warning' | 'danger'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-sand text-charcoal',
  green: 'bg-deep-green/10 text-deep-green',
  coral: 'bg-coral/10 text-coral-text',
  turquoise: 'bg-turquoise/10 text-turquoise-text',
  stone: 'bg-mist text-charcoal-soft',
  warning: 'bg-star/15 text-[#8A5A00]',
  danger: 'bg-danger/10 text-danger',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
