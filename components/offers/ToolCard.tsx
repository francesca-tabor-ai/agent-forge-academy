'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ToolCardProps {
  toolName: string;
  description: string;
  categories: string[];
  courseCount: number;
  videoCount: number;
  hasOffers: boolean;
  offersCount: number;
  logoUrl?: string | null;
  toolSlug?: string;
  hasGatedOffer?: boolean;
  enrolledCourseSlugs?: string[]; // Actually completedCourseSlugs when passed from parent
  requiredCourseForOffer?: string | null;
}

const categoryLabels: Record<string, string> = {
  api: 'API',
  hosting: 'Deploy',
  monitoring: 'Monitoring',
  data: 'Data',
  tools: 'Tools',
  services: 'Services',
  database: 'DB & Auth',
  vector_database: 'Vector DB',
  ai_llm: 'LLM APIs',
  observability: 'Observability',
  analytics: 'Analytics',
  ml_tools: 'Experiment Tracking',
};

export function ToolCard({
  toolName,
  description,
  categories,
  courseCount,
  videoCount,
  hasOffers,
  offersCount,
  logoUrl,
  toolSlug,
  hasGatedOffer,
  enrolledCourseSlugs = [],
  requiredCourseForOffer,
}: ToolCardProps) {
  // Generate a slug from tool name if not provided
  const slug = toolSlug || toolName.toLowerCase().replace(/\s+/g, '-');
  
  // Check if user has completed required course for gated offer
  // enrolledCourseSlugs should actually be completedCourseSlugs when passed from parent
  const canUnlockOffer = hasGatedOffer && requiredCourseForOffer
    ? enrolledCourseSlugs.includes(requiredCourseForOffer)
    : true;

  // Get logo URL or use placeholder
  const displayLogoUrl = logoUrl || `https://logo.clearbit.com/${toolName.toLowerCase().replace(/\s+/g, '')}.com`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all">
      {/* Header with Logo and Tool Name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden relative">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={toolName}
              width={48}
              height={48}
              className="object-contain"
              unoptimized
            />
          ) : (
            <img
              src={displayLogoUrl}
              alt={toolName}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to text if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.logo-fallback')) {
                  const fallback = document.createElement('span');
                  fallback.className = 'logo-fallback text-lg font-semibold text-gray-600';
                  fallback.textContent = toolName.charAt(0).toUpperCase();
                  parent.appendChild(fallback);
                }
              }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{toolName}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Categories/Tags */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
            >
              {categoryLabels[category] || category}
            </span>
          ))}
          {categories.length > 3 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              +{categories.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats: Courses and Videos */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        {courseCount > 0 && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{courseCount} course{courseCount !== 1 ? 's' : ''} available</span>
          </div>
        )}
        {videoCount > 0 && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Offers Badge */}
      {hasOffers && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {offersCount} offer{offersCount !== 1 ? 's' : ''} available
          </span>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
        <Link
          href={`/student/tools/${slug}`}
          className="w-full text-center px-4 py-2 bg-brand-light text-white text-sm font-medium rounded-lg hover:bg-brand-light/90 transition-colors"
        >
          View tool
        </Link>
        
        {courseCount > 0 && (
          <Link
            href={`/student/courses?tool=${slug}`}
            className="w-full text-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            View courses
          </Link>
        )}

        {hasGatedOffer && requiredCourseForOffer && (
          <Link
            href={`/student/tools/${slug}?tab=offers`}
            className={`w-full text-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              canUnlockOffer
                ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            {canUnlockOffer ? (
              'Unlock offer'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🔒</span>
                <span>Complete course to unlock</span>
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
