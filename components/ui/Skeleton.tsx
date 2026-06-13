import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton rounded-md', className)}
      aria-hidden="true"
    />
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="flex-none w-64 rounded-2xl overflow-hidden bg-surface shadow-card">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </div>
    </div>
  )
}
