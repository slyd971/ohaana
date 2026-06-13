import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'green' | 'coral' | 'turquoise' | 'stone'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-sand text-charcoal',
  green: 'bg-deep-green/10 text-deep-green',
  coral: 'bg-coral/10 text-coral',
  turquoise: 'bg-turquoise/10 text-turquoise',
  stone: 'bg-mist text-stone',
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
