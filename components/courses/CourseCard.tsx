'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CourseMetadata } from '@/lib/course-metadata';
import { UpgradeModal } from './UpgradeModal';
import { isCourseLocked } from '@/lib/utils/course-access-frontend';
import type { SubscriptionTier } from '@/lib/utils/subscription-types';
import { Lock } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string | null;
    slug: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    duration_weeks: number | null;
    difficulty_level: string | null;
    is_published: boolean;
    hasContent: boolean;
  };
  metadata?: CourseMetadata;
  enrollment?: {
    progress_percentage: number;
    enrolled_at: string;
  } | null;
  subscriptionTier?: SubscriptionTier | null;
}

export function CourseCard({ course, metadata, enrollment, subscriptionTier }: CourseCardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isEnrolled = !!enrollment;
  const isLocked = isCourseLocked(course.slug, subscriptionTier);
  const displayTitle = metadata?.title || course.title;
  const displayOutcome = metadata?.outcome || course.description || '';
  const displayTime = metadata?.time || (course.duration_weeks ? `${course.duration_weeks} weeks` : '');
  const displayBestFor = metadata?.bestFor || '';
  const displayBuild = metadata?.build || '';

  const handleCardClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      e.stopPropagation();
      setShowUpgradeModal(true);
    }
  };

  const cardClassName = `block bg-white border rounded-lg p-6 transition-all h-full ${
    isLocked
      ? 'border-gray-300 opacity-75 cursor-not-allowed'
      : 'border-gray-200 hover:border-brand-light hover:shadow-lg cursor-pointer'
  }`;

  const CourseContent = (
    <div className="flex flex-col h-full">
      {/* Category Badge */}
      {metadata?.category && (
        <div className="mb-3">
          <span className="inline-block px-2.5 py-1 text-xs font-medium text-brand-light bg-brand-light/10 rounded-full">
            {metadata.category}
          </span>
        </div>
      )}

      {/* Locked Badge */}
      {isLocked && (
        <div className="mb-3 flex items-center gap-2 text-amber-600">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-medium">Professional Access Required</span>
        </div>
      )}

      {/* Thumbnail */}
      {course.thumbnail_url && (
        <div className={`mb-4 aspect-video bg-gray-100 rounded overflow-hidden relative ${
          isLocked ? 'opacity-60' : ''
        }`}>
          <img
            src={course.thumbnail_url}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
          {isLocked && (
            <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {displayTitle}
      </h3>

      {/* Outcome */}
      {displayOutcome && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Outcome
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {displayOutcome}
          </p>
        </div>
      )}

      {/* You'll Build */}
      {displayBuild && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            You'll Build
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {displayBuild}
          </p>
        </div>
      )}

      {/* Best For */}
      {displayBestFor && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Best For
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {displayBestFor}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {displayTime && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {displayTime}
            </span>
          )}
          <span className="capitalize px-2 py-0.5 bg-gray-100 rounded">
            {course.difficulty_level || 'Not specified'}
          </span>
        </div>

        {isLocked ? (
          <div className="flex items-center gap-2 text-amber-600">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-medium">Upgrade to Unlock</span>
          </div>
        ) : isEnrolled ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-light font-medium">
              {enrollment.progress_percentage}% Complete
            </span>
            <span className="text-brand-light">→</span>
          </div>
        ) : (
          <span className="text-brand-light text-sm font-medium">View →</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isLocked ? (
        <div className={cardClassName} onClick={handleCardClick}>
          {CourseContent}
        </div>
      ) : (
        <Link href={`/student/courses/${course.slug}`} className={cardClassName}>
          {CourseContent}
        </Link>
      )}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        courseTitle={displayTitle}
        currentTier={subscriptionTier === 'essential' ? 'essential' : null}
      />
    </>
  );
}
