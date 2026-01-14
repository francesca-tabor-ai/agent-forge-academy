'use client';

import { useState } from 'react';
import { CourseCard } from './CourseCard';
import { CourseFilters } from './CourseFilters';
import { CourseMetadata } from '@/lib/course-metadata';
import type { SubscriptionTier } from '@/lib/utils/subscription-types';

interface Course {
  id: string | null;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
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

  // Group filtered courses by category
  const categoryOrder = [
    'Vibe Engineering',
    'Agentic Systems',
    'AI Search & Viability',
    'Shopping & E-Commerce',
    'Media & Content Ops',
    'Trust & Regulation',
  ];

  const groupedCourses = filteredCourses.reduce((acc, course) => {
    const category = course.metadata?.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  // Sort categories by order
  const sortedCategories = Object.keys(groupedCourses).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

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
          <CourseFilters courses={courses} onFilteredCoursesChange={setFilteredCourses} />
          
          <div className="space-y-8 mt-8">
            {sortedCategories.length > 0 ? (
              sortedCategories.map((category) => (
                <div key={category}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedCourses[category].map((course) => {
                      const enrollment = course.id ? enrollments[course.id] : null;
                      return (
                        <CourseCard
                          key={course.slug}
                          course={course}
                          metadata={course.metadata}
                          enrollment={enrollment || null}
                          subscriptionTier={subscriptionTier}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
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
