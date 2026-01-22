'use client';

import { useState } from 'react';
import Image from 'next/image';
import { resolveCourseImageUrl } from '@/lib/utils/course-image-resolver';
import type { CourseMetadata } from '@/lib/course-metadata';
import { CourseImagePlaceholder } from '@/components/courses/CourseImagePlaceholder';

interface LandingCourseCardProps {
  course: CourseMetadata & { slug: string; difficulty?: string | null };
}

export function LandingCourseCard({ course }: LandingCourseCardProps) {
  // Resolve image URL with fallback logic
  // Match banner logic: track || category || metadata.category
  // In CourseMetadata, category represents the track, so pass it as track
  const imageUrl = resolveCourseImageUrl({
    imageUrl: course.imageUrl,
    thumbnailUrl: course.thumbnailUrl,
    track: course.category, // Match banner logic: category is the track in CourseMetadata
    category: course.category, // Also pass as category for fallback
    industries: course.industries,
    metadata: course,
  });

  // Safety check: ensure imageUrl is never empty or invalid
  const isValidImageUrl = imageUrl && 
    imageUrl.trim() && 
    imageUrl !== 'image' && 
    imageUrl !== 'placeholder' &&
    !imageUrl.startsWith('http://placeholder');
  
  const safeImageUrl = isValidImageUrl ? imageUrl : null;
  
  // Track if image fails to load
  const [imageError, setImageError] = useState(false);
  
  // Determine if we should show placeholder
  const shouldShowPlaceholder = !safeImageUrl || imageError;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow card-interactive">
      {/* Course Image */}
      <div className="relative h-48 bg-gray-100">
        {shouldShowPlaceholder ? (
          <CourseImagePlaceholder
            title={course.title}
            category={course.category}
            industries={course.industries}
            className="rounded-none"
          />
        ) : (
          <>
            <Image
              src={safeImageUrl}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        )}
        
        {/* Included Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-block bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
            Included with subscription
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-brand-dark mb-3 font-playfair line-clamp-2">
          {course.title}
        </h3>

        {/* Duration and Difficulty */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
          {course.time && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {course.time}
            </span>
          )}
          {course.difficulty && (
            <>
              <span className="text-gray-400">•</span>
              <span className="capitalize">{course.difficulty}</span>
            </>
          )}
        </div>

        {/* Industry Chips */}
        {course.industries && course.industries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {course.industries.map((industry, idx) => (
              <span
                key={idx}
                className="inline-block px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full"
              >
                {industry}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
