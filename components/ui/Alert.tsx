import { cn } from '@/lib/utils'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const TONES: Record<AlertTone, string> = {
  info: 'border-deep-green/20 bg-deep-green/5 text-deep-green',
  success: 'border-turquoise/30 bg-turquoise/10 text-turquoise-text',
  warning: 'border-star/40 bg-star/10 text-[#8A5A00]',
  danger: 'border-danger/30 bg-danger/5 text-danger',
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone
}

/** Message d'état (erreur, confirmation, avertissement). `role="alert"` pour danger, `status` sinon. */
export function Alert({ tone = 'info', className, role, ...props }: AlertProps) {
  return (
    <div
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      className={cn('rounded-control border px-4 py-3 text-sm leading-relaxed', TONES[tone], className)}
      {...props}
    />
  )
}
