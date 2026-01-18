'use client';

import React from 'react';

interface CourseImagePlaceholderProps {
  title: string;
  category?: string | null;
  industries?: string[];
  className?: string;
}

/**
 * Color gradients mapped to industries and tracks
 * Each entry defines a gradient from one color to another
 */
const GRADIENT_MAP: Record<string, { from: string; to: string }> = {
  // Priority Industries
  'Finance': { from: 'from-blue-600', to: 'to-blue-800' },
  'Healthcare': { from: 'from-green-600', to: 'to-green-800' },
  
  // Tracks
  'Agentic Systems': { from: 'from-purple-600', to: 'to-purple-800' },
  'AI Search & Visibility': { from: 'from-indigo-600', to: 'to-indigo-800' },
  'Shopping & E-Commerce': { from: 'from-pink-600', to: 'to-pink-800' },
  'Media & Content Ops': { from: 'from-orange-600', to: 'to-orange-800' },
  'Trust & Regulation': { from: 'from-gray-700', to: 'to-gray-900' },
  'ML Engineering': { from: 'from-cyan-600', to: 'to-cyan-800' },
  'Vibe Engineering': { from: 'from-amber-600', to: 'to-amber-800' },
  'Platform Engineering': { from: 'from-teal-600', to: 'to-teal-800' },
  'GTM & Revenue Operations': { from: 'from-red-600', to: 'to-red-800' },
  'Creative AI': { from: 'from-violet-600', to: 'to-violet-800' },
  'Audio & Voice': { from: 'from-rose-600', to: 'to-rose-800' },
  
  // Standard Industries
  'E-commerce': { from: 'from-pink-500', to: 'to-pink-700' },
  'SaaS': { from: 'from-blue-500', to: 'to-blue-700' },
  'Trust & Regulation': { from: 'from-gray-600', to: 'to-gray-800' },
  'Media & Content': { from: 'from-orange-500', to: 'to-orange-700' },
  'Legal & Compliance': { from: 'from-slate-600', to: 'to-slate-800' },
  'B2B Sales / RevOps': { from: 'from-red-500', to: 'to-red-700' },
  'DevTools': { from: 'from-indigo-500', to: 'to-indigo-700' },
  'Retail / CPG': { from: 'from-pink-500', to: 'to-pink-700' },
  'Marketplaces': { from: 'from-purple-500', to: 'to-purple-700' },
  'Media & Publishing': { from: 'from-orange-500', to: 'to-orange-700' },
};

/**
 * Default gradient when no match is found
 */
const DEFAULT_GRADIENT = { from: 'from-brand-dark', to: 'to-brand-dark/80' };

/**
 * Get gradient colors based on category/industry
 */
function getGradient(category?: string | null, industries?: string[]): { from: string; to: string } {
  // Priority 1: Check category/track
  if (category && GRADIENT_MAP[category]) {
    return GRADIENT_MAP[category];
  }
  
  // Priority 2: Check priority industries (Finance, Healthcare)
  if (industries && industries.length > 0) {
    const priorityIndustries = ['Finance', 'Healthcare'];
    const priorityIndustry = industries.find(ind => priorityIndustries.includes(ind));
    if (priorityIndustry && GRADIENT_MAP[priorityIndustry]) {
      return GRADIENT_MAP[priorityIndustry];
    }
    
    // Priority 3: Check first industry
    const firstIndustry = industries[0];
    if (firstIndustry && GRADIENT_MAP[firstIndustry]) {
      return GRADIENT_MAP[firstIndustry];
    }
  }
  
  return DEFAULT_GRADIENT;
}

/**
 * Get initials from course title
 * Returns first letter of each word, up to 2 letters
 */
function getInitials(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length === 0) return '?';
  
  if (words.length === 1) {
    // Single word: return first 2 letters if available
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple words: return first letter of first 2 words
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Course Image Placeholder Component
 * 
 * Displays a gradient background with course initials when an image
 * is unavailable or fails to load. Provides a consistent, branded
 * fallback that matches the course's industry or track.
 */
export function CourseImagePlaceholder({
  title,
  category,
  industries,
  className = '',
}: CourseImagePlaceholderProps) {
  const gradient = getGradient(category, industries);
  const initials = getInitials(title);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      aria-label={`Course image placeholder for ${title}`}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.to}`}
      />
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />
      </div>
      
      {/* Initials */}
      <div className="relative z-10">
        <div className="flex items-center justify-center">
          <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {initials}
          </span>
        </div>
      </div>
      
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
