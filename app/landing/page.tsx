import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getSegmentsByType } from '@/lib/utils/segments';
import type { SegmentType } from '@/lib/types/segment';

export const metadata: Metadata = {
  title: 'Browse All Subscriptions - AI Growth Hub',
  description: 'Browse all subscription options by track, industry, or role. Find the perfect learning path for your needs.',
  openGraph: {
    title: 'Browse All Subscriptions - AI Growth Hub',
    description: 'Browse all subscription options by track, industry, or role. Find the perfect learning path for your needs.',
    type: 'website',
  },
};

export default async function LandingIndexPage() {
  const tracks = getSegmentsByType('track');
  const industries = getSegmentsByType('industry');
  const roles = getSegmentsByType('role');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-brand-dark py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 font-playfair">
              Browse All Subscriptions
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 font-light max-w-3xl mx-auto">
              Find the perfect learning path for your needs. Choose from tracks, industries, or roles.
            </p>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
              Tracks
            </h2>
            <p className="text-xl text-gray-700">
              Learn by technology track or domain expertise
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <Link
                key={track.key}
                href={`/landing/track/${track.key}`}
                className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all card-interactive"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={track.heroImageUrl}
                    alt={track.displayName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1 font-playfair">
                      {track.displayName}
                    </h3>
                    <p className="text-sm text-white/90">
                      {track.includedCourseSlugs.length} course{track.includedCourseSlugs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {track.description}
                  </p>
                  <div className="mt-4 text-brand-light font-medium text-sm">
                    View Track →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
              Industries
            </h2>
            <p className="text-xl text-gray-700">
              Learn industry-specific AI applications and best practices
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <Link
                key={industry.key}
                href={`/landing/industry/${industry.key}`}
                className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all card-interactive"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={industry.heroImageUrl}
                    alt={industry.displayName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1 font-playfair">
                      {industry.displayName}
                    </h3>
                    <p className="text-sm text-white/90">
                      {industry.includedCourseSlugs.length} course{industry.includedCourseSlugs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {industry.description}
                  </p>
                  <div className="mt-4 text-brand-light font-medium text-sm">
                    View Industry →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
              Roles
            </h2>
            <p className="text-xl text-gray-700">
              Learn skills tailored to your job role
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Link
                key={role.key}
                href={`/landing/role/${role.key}`}
                className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all card-interactive"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={role.heroImageUrl}
                    alt={role.displayName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1 font-playfair">
                      {role.displayName}
                    </h3>
                    <p className="text-sm text-white/90">
                      {role.includedCourseSlugs.length} course{role.includedCourseSlugs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {role.description}
                  </p>
                  <div className="mt-4 text-brand-light font-medium text-sm">
                    View Role →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
