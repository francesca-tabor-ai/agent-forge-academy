'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseCard } from './CourseCard';
import { CourseFilters } from './CourseFilters';
import { CourseMetadata } from '@/lib/course-metadata';
import type { SubscriptionTier } from '@/lib/utils/subscription-types';

interface Course {
  id: string | null;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl?: string | null; // camelCase (preferred)
  thumbnail_url?: string | null; // snake_case (for backward compatibility with DB queries)
  imageUrl?: string | null;
  duration_weeks: number | null;
  difficulty_level: string | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  hasContent: boolean;
  industries: string[];
  category?: string;
  metadata?: CourseMetadata;
}

interface Enrollment {
  progress_percentage: number;
  enrolled_at: string;
}

interface CoursesPageClientProps {
  courses: Course[];
  enrollments: Record<string, Enrollment>;
  subscriptionTier?: SubscriptionTier | null;
}

export function CoursesPageClient({ courses, enrollments, subscriptionTier }: CoursesPageClientProps) {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);
  const router = useRouter();

  const handleViewCourse = (courseSlug: string) => {
    router.push(`/student/courses/${courseSlug}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
        <p className="text-sm text-gray-600 mt-2">
          Browse and enroll in available courses
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No courses available at this time.</p>
        </div>
      ) : (
        <>
          {/* Sticky Search/Sort/Filters Bar */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm -mx-6 px-6 py-4">
            <CourseFilters courses={courses} onFilteredCoursesChange={setFilteredCourses} />
          </div>
          
          {/* Responsive Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
          <div className="mt-8">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const enrollment = course.id ? enrollments[course.id] : null;
                  return (
                    <CourseCard
                      key={course.slug}
                      course={course}
                      metadata={course.metadata}
                      enrollment={enrollment || null}
                      subscriptionTier={subscriptionTier}
                      onView={() => handleViewCourse(course.slug)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No courses match your filters.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
