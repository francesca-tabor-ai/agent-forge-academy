/**
 * Loading skeleton for course detail page
 * Shows while the page is being server-rendered
 */

import { CourseDetailSkeleton } from '@/components/courses/CourseDetailSkeleton';

export default function CourseDetailLoading() {
  return (
    <div>
      {/* Back link skeleton */}
      <div className="mb-4">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <CourseDetailSkeleton />
    </div>
  );
}
