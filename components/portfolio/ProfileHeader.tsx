'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProfileHeaderProps {
  fullName?: string | null;
  headline?: string | null;
  headshotImageUrl?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  email?: string | null;
  visibility?: 'private' | 'recruiters_only' | 'public';
  studentProfileId?: string;
}

// Generate initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function ProfileHeader({
  fullName,
  headline,
  headshotImageUrl,
  location,
  linkedinUrl,
  githubUrl,
  websiteUrl,
  email,
  visibility = 'private',
  studentProfileId,
}: ProfileHeaderProps) {
  const router = useRouter();
  const initials = getInitials(fullName);
  const isDiscoverable = visibility !== 'private';

  const handleMakeDiscoverable = () => {
    router.push('/student/portfolio/profile/edit');
  };

  const handleShare = () => {
    if (studentProfileId && visibility === 'public') {
      const publicUrl = `${window.location.origin}/portfolio/${studentProfileId}`;
      navigator.clipboard.writeText(publicUrl).then(() => {
        alert('Public profile link copied to clipboard!');
      });
    }
  };

  const handlePreview = () => {
    if (studentProfileId) {
      window.open(`/portfolio/${studentProfileId}`, '_blank');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg relative overflow-visible">
      {/* Cover Banner - Fixed height, LinkedIn style */}
      {/* Layer 1: Cover layer (background only) - overflow-hidden only on the gradient, not the wrapper */}
      <div className="relative h-[140px] sm:h-[180px] md:h-[200px] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-t-lg overflow-visible">
        {/* Optional: Add banner image upload in future */}
        {/* Gradient overlay - overflow-hidden only here to clip the gradient to rounded corners */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-500/90 to-indigo-600/90 rounded-t-lg overflow-hidden"></div>
        
        {/* Layer 2: Avatar layer - positioned relative to cover, above all decorative layers */}
        {/* Avatar extends below cover by 50% of its height, guaranteed to be fully visible */}
        <div className="absolute left-6 bottom-0 translate-y-1/2 z-30">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex-shrink-0">
            {headshotImageUrl ? (
              <Image
                src={headshotImageUrl}
                alt={fullName || 'Profile picture'}
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <span className="text-2xl sm:text-4xl font-semibold text-white">{initials}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layer 3: Info layer - Normal flow, below cover with padding to clear avatar */}
      {/* Padding calculation: avatar radius (40px mobile, 56px desktop) + gap (16px mobile, 20px desktop) */}
      {/* pt-14 = 56px (40px + 16px), pt-20 = 80px (56px + 24px) */}
      <div className="px-6 pt-14 sm:pt-20 pb-6 relative z-10 bg-white rounded-b-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left Side - Primary Info */}
          <div className="flex-1 min-w-0">
            {/* Name - Wraps on long names */}
            {fullName ? (
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1 leading-tight break-words">{fullName}</h1>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1 leading-tight break-words">Your Name</h1>
            )}
            
            {/* Headline - Line clamp on small screens */}
            {headline ? (
              <p className="text-base sm:text-lg text-gray-700 mb-2 line-clamp-2 sm:line-clamp-none">{headline}</p>
            ) : (
              <p className="text-base sm:text-lg text-gray-500 mb-2">Add your professional headline</p>
            )}
            
            {/* Location */}
            {location && (
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="break-words">{location}</span>
              </p>
            )}

            {/* Contact Row - Subtle Icons/Links */}
            <div className="flex items-center gap-4 flex-wrap">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs truncate max-w-[200px]">{email}</span>
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">GitHub</span>
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-xs">LinkedIn</span>
                </a>
              )}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="text-xs">Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
            {!isDiscoverable && (
              <button
                onClick={handleMakeDiscoverable}
                className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
              >
                Make discoverable
              </button>
            )}
            {visibility === 'public' && studentProfileId && (
              <>
                <button
                  onClick={handleShare}
                  className="btn-secondary text-sm px-3 py-2 whitespace-nowrap"
                  title="Share public profile"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
                <button
                  onClick={handlePreview}
                  className="btn-secondary text-sm px-3 py-2 whitespace-nowrap"
                  title="Preview public view"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </button>
              </>
            )}
            <Link
              href="/student/portfolio/profile/edit"
              className="btn-secondary text-sm px-3 py-2 whitespace-nowrap"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
