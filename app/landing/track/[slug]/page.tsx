import { notFound } from 'next/navigation';
import { getSegment } from '@/lib/utils/segments';
import { courseMetadata } from '@/lib/course-metadata';
import PublicSegmentLandingPage from '@/components/segments/PublicSegmentLandingPage';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const { getSegmentsByType } = await import('@/lib/utils/segments');
  const segments = getSegmentsByType('track');
  
  return segments.map((segment) => ({
    slug: segment.key,
  }));
}

export default async function TrackLandingPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Get segment
  const segment = getSegment('track', slug);
  
  if (!segment) {
    notFound();
  }
  
  // Get live course details for included courses
  const courses = segment.includedCourseSlugs
    .map((courseSlug) => {
      const metadata = courseMetadata[courseSlug];
      if (!metadata) return null;
      // Filter by isLive (defaults to true if not specified)
      if (metadata.isLive === false) return null;
      return {
        slug: courseSlug,
        ...metadata,
      };
    })
    .filter((course) => course !== null);
  
  return <PublicSegmentLandingPage segment={segment} courses={courses} />;
}
