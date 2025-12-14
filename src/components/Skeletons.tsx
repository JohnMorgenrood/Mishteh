'use client';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100 animate-pulse">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-skeleton" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded animate-skeleton mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-skeleton" />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-5 pb-3 flex gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-skeleton" />
        <div className="h-6 w-16 bg-gray-200 rounded-full animate-skeleton" />
      </div>

      {/* Content */}
      <div className="px-5">
        <div className="h-5 w-3/4 bg-gray-200 rounded animate-skeleton mb-2" />
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-gray-200 rounded animate-skeleton" />
          <div className="h-3 w-full bg-gray-200 rounded animate-skeleton" />
          <div className="h-3 w-2/3 bg-gray-200 rounded animate-skeleton" />
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4">
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex justify-between mb-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-skeleton" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-skeleton" />
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full animate-skeleton" />
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
        <div className="h-10 w-20 bg-gray-200 rounded-full animate-skeleton" />
        <div className="h-10 w-20 bg-gray-200 rounded-full animate-skeleton" />
        <div className="flex-1" />
        <div className="h-10 w-20 bg-gray-200 rounded-full animate-skeleton" />
      </div>

      {/* Button */}
      <div className="px-5 pb-5">
        <div className="h-12 w-full bg-gray-200 rounded-xl animate-skeleton" />
      </div>
    </div>
  );
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="h-5 w-40 bg-gray-200 rounded animate-skeleton" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-3 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-skeleton" />
            <div className="flex-1">
              <div className="h-3 w-3/4 bg-gray-200 rounded animate-skeleton mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 animate-skeleton" />
        <div className="flex-1">
          <div className="h-6 w-40 bg-gray-200 rounded animate-skeleton mb-2" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-skeleton" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-200 rounded animate-skeleton" />
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-skeleton" />
      </div>
    </div>
  );
}
