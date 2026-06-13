import { Skeleton } from '@/components/ui/Skeleton'

function SearchCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-surface border border-mist shadow-card">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function SearchLoading() {
  return (
    <div className="min-h-dvh bg-coconut">
      {/* Search bar skeleton */}
      <div className="sticky top-0 z-30 bg-coconut/95 backdrop-blur-md border-b border-mist px-4 py-3 space-y-2">
        <Skeleton className="h-11 w-full rounded-2xl" />
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-none" />
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        <Skeleton className="h-4 w-32 mb-5 rounded-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <SearchCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
