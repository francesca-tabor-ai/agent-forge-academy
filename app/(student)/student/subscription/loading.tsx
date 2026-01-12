/**
 * Loading skeleton for subscription page
 * 
 * Shows while the page is being server-rendered
 */

export default function SubscriptionLoading() {
  return (
    <div className="space-y-8 authenticated-app animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-9 w-48 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded"></div>
      </div>

      {/* Plan Section Skeleton */}
      <div className="space-y-6">
        <div>
          <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            {/* Plan Name & Status */}
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-32 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-64 bg-gray-200 rounded mt-3"></div>
              </div>
            </div>

            {/* Usage Indicators Skeleton */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"></div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Benefits Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Section Skeleton */}
      <div className="space-y-6">
        <div>
          <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Payment Method Skeleton */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Billing Email Skeleton */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-5 w-28 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Next Invoice Skeleton */}
            <div>
              <div className="h-5 w-28 bg-gray-200 rounded mb-2"></div>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Invoices Skeleton */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice History Skeleton */}
        <div>
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
