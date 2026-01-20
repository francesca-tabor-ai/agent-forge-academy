'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Rocket, ExternalLink } from 'lucide-react';
import { BookmarkButton } from './BookmarkButton';

interface Founder {
  id: string;
  name: string;
  bio?: string;
}

interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  founder: Founder | null;
  vibeScore: number;
  revenueRange: string;
  technicalDifficulty: string | null;
  status: string;
  logoUrl?: string;
  websiteUrl?: string;
  launchYear?: number;
  pricingModel?: string;
  targetCustomer?: string;
}

interface StartupCardProps {
  startup: Startup;
}

const getVibeScoreColor = (score: number) => {
  if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
  if (score >= 80) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'acquired':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'shut down':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export function StartupCard({ startup }: StartupCardProps) {
  const vibeScoreColor = getVibeScoreColor(startup.vibeScore);
  const statusColor = getStatusColor(startup.status);

  return (
    <Link
      href={`/startups/${startup.id}`}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-brand-light hover:shadow-md transition-all flex flex-col group"
    >
      {/* Thumbnail Image */}
      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {startup.logoUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Image
              src={startup.logoUrl}
              alt={startup.name}
              width={200}
              height={200}
              className="object-contain max-w-full max-h-full"
              unoptimized
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center">
              <Rocket className="w-10 h-10 text-white" />
            </div>
          </div>
        )}
        {/* Bookmark Button */}
        <div className="absolute top-3 right-3 z-10">
          <BookmarkButton startupId={startup.id} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Name and Status */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-xl font-semibold text-gray-900 leading-tight group-hover:text-brand-light transition-colors">
              {startup.name}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${statusColor}`}>
              {startup.status}
            </span>
          </div>
          {startup.tagline && (
            <p className="text-sm text-gray-600 italic line-clamp-2">{startup.tagline}</p>
          )}
        </div>

        {/* Founder */}
        {startup.founder && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-0.5">Founder</p>
            <p className="text-sm font-medium text-gray-900">{startup.founder.name}</p>
          </div>
        )}

        {/* Metrics */}
        <div className="mb-4 space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Vibe Score</span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${vibeScoreColor}`}>
              {startup.vibeScore}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Revenue Range</span>
            <span className="text-sm font-medium text-gray-900">{startup.revenueRange || 'N/A'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
          <span className="flex-1 text-sm font-medium text-brand-light group-hover:underline">
            View Details →
          </span>
          {startup.websiteUrl && (
            <a
              href={startup.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-brand-light hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-2"
              aria-label="Visit website"
            >
              <ExternalLink className="w-4 h-4 text-gray-600" />
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
