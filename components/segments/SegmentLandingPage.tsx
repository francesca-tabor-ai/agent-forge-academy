'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Segment } from '@/lib/types/segment';
import type { CourseMetadata } from '@/lib/course-metadata';

interface SegmentLandingPageProps {
  segment: Segment;
  courses: Array<CourseMetadata & { slug: string }>;
}

export default function SegmentLandingPage({ segment, courses }: SegmentLandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Full-bleed Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center">
        {/* Background Image */}
        <Image
          src={segment.heroImageUrl}
          alt={`${segment.displayName} hero image`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
        
        {/* Hero Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 pt-16 pb-24">
              {/* Segment Type Badge */}
              <div className="inline-block">
                <span className="bg-brand-yellow/90 text-brand-dark text-sm font-semibold px-4 py-2 rounded-full uppercase tracking-wide">
                  {segment.type === 'track' ? 'Track' : segment.type === 'industry' ? 'Industry' : 'Role'}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight font-playfair">
                {segment.displayName}
              </h1>
              
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-100 leading-relaxed max-w-3xl font-light">
                {segment.description}
              </p>
              
              {/* CTA Button */}
              <div className="pt-4">
                <Link
                  href={`/segments/${segment.type}/${segment.key}/subscribe`}
                  className="btn-primary inline-block focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-black focus-visible:outline-none"
                >
                  Subscribe to {segment.displayName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
              Courses in {segment.displayName}
            </h2>
            <p className="text-xl text-gray-700">
              {courses.length} course{courses.length !== 1 ? 's' : ''} available with subscription
            </p>
          </div>

          {/* Course Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.slug}
                href={`/student/courses/${course.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow card-interactive"
              >
                <h3 className="text-xl font-bold text-brand-dark mb-2 font-playfair">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.outcome}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{course.time}</span>
                  <span className="capitalize">{course.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription CTA Section */}
      <section className="bg-brand-dark py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 font-playfair">
            Get access to all {segment.displayName} courses
          </h2>
          <p className="text-xl sm:text-2xl text-gray-200 mb-8 font-light">
            Subscribe to unlock {courses.length} course{courses.length !== 1 ? 's' : ''} and start learning today.
          </p>
          <Link
            href={`/segments/${segment.type}/${segment.key}/subscribe`}
            className="btn-primary inline-block focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-brand-dark focus-visible:outline-none"
          >
            View Subscription Plans
          </Link>
        </div>
      </section>
    </div>
  );
}
