import { cn } from '@/lib/utils'

type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding
  /** Ajoute une ombre plus marquée au survol (cartes cliquables). */
  interactive?: boolean
  /** Fond sable plutôt que blanc. */
  tone?: 'surface' | 'sand'
}

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6 md:p-8',
}

/** Conteneur standard : fond blanc, bordure mist, rayon `card`, ombre légère. */
export function Card({ padding = 'md', interactive, tone = 'surface', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-mist shadow-card',
        tone === 'surface' ? 'bg-surface' : 'bg-sand',
        PADDING[padding],
        interactive && 'transition-shadow hover:shadow-elevated',
        className
      )}
      {...props}
    />
  )
}
