/**
 * Loading skeleton for course detail page
 * Shows while the page is being server-rendered
 */

export default function CourseDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Back link skeleton */}
      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />

      {/* Banner skeleton */}
      <div className="relative w-full h-40 sm:h-52 md:h-[220px] rounded-xl overflow-hidden -mx-6 bg-gray-200 animate-pulse" />

      {/* Progress Card skeleton (mobile) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:hidden">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="space-y-4">
          <div className="h-2.5 w-full bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Content grid skeleton */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left column skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Overview skeleton */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="h-7 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Lessons skeleton */}
          <div>
            <div className="h-7 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column skeleton (desktop) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-8">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="space-y-4">
              <div className="h-2.5 w-full bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
