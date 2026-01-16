'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getToolLogoUrl, getToolInitials } from '@/lib/utils/tool-logos';

interface ToolLogoProps {
  toolName: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

/**
 * ToolLogo component
 * Renders tool logo with fallback to initials
 * - Tries provided logoUrl
 * - Falls back to /public/logos/{slug}.png
 * - Falls back to Clearbit API
 * - Falls back to initials
 */
export function ToolLogo({ 
  toolName, 
  logoUrl, 
  size = 48,
  className = '' 
}: ToolLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const displayLogoUrl = getToolLogoUrl(toolName, logoUrl);
  const initials = getToolInitials(toolName);
  const showInitials = imageError || !displayLogoUrl;

  return (
    <div 
      className={`flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {!showInitials && displayLogoUrl ? (
        <>
          {displayLogoUrl.startsWith('/') ? (
            // Local public logo
            <Image
              src={displayLogoUrl}
              alt={toolName}
              width={size}
              height={size}
              className="object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            // External URL (Clearbit or other)
            <img
              src={displayLogoUrl}
              alt={toolName}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          )}
        </>
      ) : (
        // Fallback to initials
        <span 
          className="text-gray-600 font-semibold"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
