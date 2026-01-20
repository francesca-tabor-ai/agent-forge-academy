'use client';

import { useState } from 'react';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CourseMetadata } from '@/lib/course-metadata';
import { UpgradeModal } from './UpgradeModal';
import { isCourseLocked } from '@/lib/utils/course-access-frontend';
import type { SubscriptionTier } from '@/lib/utils/subscription-types';
import { resolveCourseImageUrl } from '@/lib/utils/course-image-resolver';
import { Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseImagePlaceholder } from './CourseImagePlaceholder';

interface ExpandableSectionProps {
  title: string;
  content: string;
  maxHeight?: string;
}

interface CourseCardProps {
  course: {
    id: string | null;
    slug: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    imageUrl?: string | null;
    duration_weeks: number | null;
    difficulty_level: string | null;
    is_published: boolean;
    hasContent: boolean;
    industries: string[];
    category?: string;
  };
  metadata?: CourseMetadata;
  enrollment?: {
    progress_percentage: number;
    enrolled_at: string;
  } | null;
  subscriptionTier?: SubscriptionTier | null;
  onView?: () => void;
  defaultExpanded?: boolean;
}

// Expandable section component with "Read more" functionality
function ExpandableSection({ title, content, maxHeight = '120px' }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [needsReadMore, setNeedsReadMore] = useState(false);

  React.useEffect(() => {
    if (contentRef.current) {
      // Check if content exceeds max height when collapsed
      const element = contentRef.current;
      const originalHeight = element.style.height;
      element.style.height = 'auto';
      const fullHeight = element.scrollHeight;
      element.style.height = originalHeight;
      
      const maxHeightValue = parseInt(maxHeight);
      setNeedsReadMore(fullHeight > maxHeightValue);
    }
  }, [content, maxHeight]);

  return (
    <div className="mb-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {title}
      </p>
      <motion.div
        ref={contentRef}
        className="text-sm text-gray-700 leading-relaxed overflow-hidden"
        initial={false}
        animate={{
          maxHeight: isExpanded ? 'none' : maxHeight,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {content}
      </motion.div>
      {needsReadMore && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="mt-1 text-xs text-brand-light hover:text-brand-light/80 font-medium transition-colors"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export function CourseCard({ 
  course, 
  metadata, 
  enrollment, 
  subscriptionTier,
  onView,
  defaultExpanded = false 
}: CourseCardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isEnrolled = !!enrollment;
  const isLocked = isCourseLocked(course.slug, subscriptionTier);
  const displayTitle = metadata?.title || course.title;
  // Use description from course if outcome is not available (for dynamic metadata courses like Finance)
  const displayOutcome = metadata?.outcome || course.description || '';
  const displayTime = metadata?.time || (course.duration_weeks ? `${course.duration_weeks} weeks` : '');
  const rawBestFor = metadata?.bestFor;
  const displayBestFor: string = !rawBestFor ? '' : Array.isArray(rawBestFor) ? rawBestFor.join('\n') : rawBestFor;
  const displayBuild = metadata?.build || '';
  // Use course industries if it has values, otherwise fall back to metadata industries
  const displayIndustries = (course.industries && course.industries.length > 0) 
    ? course.industries 
    : (metadata?.industries || []);
  
  // Show expand button if there's any content to expand (outcome/description, build, or bestFor)
  const hasExpandableContent = !!(displayOutcome || displayBuild || displayBestFor);
  
  // Resolve image URL with fallback logic
  // This always returns a valid URL (has fallback to default)
  // Priority: metadata category (source of truth) > database category
  const categoryForImage = metadata?.category || course.category;
  const imageUrl = resolveCourseImageUrl({
    imageUrl: course.imageUrl,
    thumbnail_url: course.thumbnail_url,
    category: categoryForImage,
    track: categoryForImage, // Also set track field for compatibility
    industries: displayIndustries,
    metadata: metadata ? { category: categoryForImage } : metadata,
  });

  // Safety check: ensure imageUrl is never empty or invalid
  // Check if imageUrl is a placeholder or invalid
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on expand button or read more buttons
    const target = e.target as HTMLElement;
    const isButton = target.closest('button');
    const isExpandButton = target.closest('button[aria-label*="details"]');
    const isReadMoreButton = target.closest('button')?.textContent?.includes('Read');
    
    if (isExpandButton || isReadMoreButton) {
      return; // Let the button handle its own click
    }
    
    if (isLocked) {
      e.preventDefault();
      e.stopPropagation();
      setShowUpgradeModal(true);
    } else if (onView) {
      e.preventDefault();
      e.stopPropagation();
      onView();
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card navigation when clicking expand button
    setExpanded(!expanded);
  };

  const cardClassName = `block bg-white border rounded-lg p-6 h-full transition-all duration-300 ${
    isLocked
      ? 'border-gray-300 opacity-75 cursor-not-allowed'
      : 'border-gray-200 hover:border-brand-light cursor-pointer card-interactive hover:shadow-lg hover:-translate-y-1'
  }`;

  const CourseContent = (
    <div className="flex flex-col h-full">
      {/* Locked Badge - Only show if locked */}
      {isLocked && (
        <div className="mb-3 flex items-center gap-2 text-amber-600">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-medium">Professional Access Required</span>
        </div>
      )}

      {/* Hero Image Area */}
      <motion.div 
        className={`relative h-[200px] bg-gray-100 rounded-lg overflow-hidden mb-4 ${
          isLocked ? 'opacity-60' : ''
        }`}
        whileHover={!isLocked ? { scale: 1.02 } : {}}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Show placeholder if image is invalid or failed to load */}
        {shouldShowPlaceholder ? (
          <CourseImagePlaceholder
            title={displayTitle}
            category={course.category || metadata?.category}
            industries={displayIndustries}
            className="rounded-lg"
          />
        ) : (
          <>
            {/* Optimized Background Image */}
            <Image
              src={safeImageUrl}
              alt={displayTitle}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
              loading="lazy"
              onError={() => setImageError(true)}
            />
            {/* Gradient Overlay - transparent at top, darker at bottom (only for real images) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[1]" />
          </>
        )}
        
        {/* Top-right: Expand Icon Button - Large tap target for mobile */}
        {hasExpandableContent && (
          <motion.button
            onClick={handleExpandToggle}
            className="absolute top-3 right-3 min-w-[44px] min-h-[44px] p-3 bg-white/90 hover:bg-white rounded-full transition-colors shadow-sm z-[2] flex items-center justify-center"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-700" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-700" />
              )}
            </motion.div>
          </motion.button>
        )}

        {/* Bottom-left: Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-[2]">
          {/* Track Pill */}
          {metadata?.category && (
            <span className="inline-block px-2.5 py-1 text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full mb-2 border border-white/30">
              {metadata.category}
            </span>
          )}
          
          {/* Course Title - Always visible with strong contrast */}
          <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg leading-tight">
            {displayTitle}
          </h3>
          
          {/* Duration + Difficulty Line */}
          <div className="flex items-center gap-3 text-xs text-white/90">
            {displayTime && (
              <span className="flex items-center gap-1 drop-shadow">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {displayTime}
              </span>
            )}
            {course.difficulty_level && (
              <>
                <span className="text-white/60">•</span>
                <span className="capitalize drop-shadow">
                  {course.difficulty_level}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-[3]">
            <Lock className="w-8 h-8 text-white" />
          </div>
        )}
      </motion.div>

      {/* Expanded Details Accordion - Only render when expanded */}
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            style={{ willChange: 'height' }}
          >
            <div className="space-y-3 mb-4 border-t border-gray-100 pt-4">
              {/* Outcome */}
              {displayOutcome && (
                <ExpandableSection
                  title="Outcome"
                  content={displayOutcome}
                  maxHeight="120px"
                />
              )}

              {/* You'll Build */}
              {displayBuild && (
                <ExpandableSection
                  title="You'll Build"
                  content={displayBuild}
                  maxHeight="120px"
                />
              )}

              {/* Best For */}
              {displayBestFor && (
                <ExpandableSection
                  title="Best For"
                  content={displayBestFor}
                  maxHeight="120px"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Industry Tags - Show up to 2, then "+N" */}
          {displayIndustries.length > 0 && (
            <>
              {displayIndustries.slice(0, 2).map((industry, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full"
                >
                  {industry}
                </span>
              ))}
              {displayIndustries.length > 2 && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full">
                  +{displayIndustries.length - 2}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
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
    </div>
  );

  // Use onView callback if provided, otherwise fall back to Link
  const handleView = onView || (() => {
    // Default navigation behavior if no onView provided
    window.location.href = `/student/courses/${course.slug}`;
  });

  return (
    <>
      {isLocked ? (
        <div className={cardClassName} onClick={handleCardClick}>
          {CourseContent}
        </div>
      ) : onView ? (
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
