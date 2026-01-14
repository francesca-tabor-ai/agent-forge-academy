'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ProfileHeaderProps {
  fullName?: string | null;
  headline?: string | null;
  headshotImageUrl?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
}

export function ProfileHeader({
  fullName,
  headline,
  headshotImageUrl,
  location,
  linkedinUrl,
  githubUrl,
  websiteUrl,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Banner Section - LinkedIn style */}
      <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
        {/* Optional: Add banner image upload in future */}
      </div>

      {/* Profile Info Section */}
      <div className="px-6 pb-6 -mt-16 relative">
        {/* Headshot */}
        <div className="flex items-end gap-4 mb-4">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
            {headshotImageUrl ? (
              <Image
                src={headshotImageUrl}
                alt={fullName || 'Profile picture'}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-5xl text-gray-400">👤</span>
              </div>
            )}
          </div>
          
          {/* Edit button - positioned like LinkedIn */}
          <div className="ml-auto mb-2">
            <Link
              href="/student/portfolio/profile/edit"
              className="btn-secondary text-sm"
            >
              Edit profile
            </Link>
          </div>
        </div>

        {/* Name and Headline */}
        <div className="mb-4">
          {fullName ? (
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">{fullName}</h1>
          ) : (
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">Your Name</h1>
          )}
          {headline ? (
            <p className="text-lg text-gray-700 mb-2">{headline}</p>
          ) : (
            <p className="text-lg text-gray-500 mb-2">Add your professional headline</p>
          )}
          {location && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <span>📍</span>
              {location}
            </p>
          )}
        </div>

        {/* Social Links */}
        {(linkedinUrl || githubUrl || websiteUrl) && (
          <div className="flex items-center gap-4 flex-wrap">
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-brand-light flex items-center gap-1"
              >
                <span>💼</span>
                LinkedIn
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-brand-light flex items-center gap-1"
              >
                <span>💻</span>
                GitHub
              </a>
            )}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-brand-light flex items-center gap-1"
              >
                <span>🌐</span>
                Website
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
