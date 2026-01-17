export function CourseDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Skeleton */}
      <div className="relative w-full min-h-[180px] sm:min-h-[220px] md:min-h-[260px] rounded-xl overflow-hidden mb-8 -mx-6 bg-gray-200 animate-pulse" />

      {/* Progress Card Skeleton (Mobile) */}
      <div className="lg:hidden bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="h-2.5 bg-gray-200 rounded-full mb-4 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Layout Skeleton */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Modules Skeleton */}
          <div>
            <div className="h-7 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
            <div className="h-2.5 bg-gray-200 rounded-full mb-4 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
