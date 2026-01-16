import { notFound } from 'next/navigation';
import { getSegment } from '@/lib/utils/segments';
import type { SegmentType } from '@/lib/types/segment';
import SegmentLandingPage from '@/components/segments/SegmentLandingPage';
import { courseMetadata } from '@/lib/course-metadata';

interface PageProps {
  params: Promise<{
    type: string;
    key: string;
  }>;
}

export async function generateStaticParams() {
  // Generate static params for all segments
  const types: SegmentType[] = ['track', 'industry', 'role'];
  const params: Array<{ type: string; key: string }> = [];
  
  for (const type of types) {
    const { getSegmentsByType } = await import('@/lib/utils/segments');
    const segments = getSegmentsByType(type);
    segments.forEach((segment) => {
      params.push({
        type: segment.type,
        key: segment.key,
      });
    });
  }
  
  return params;
}

export default async function SegmentPage({ params }: PageProps) {
  const { type, key } = await params;
  
  // Validate type
  const validTypes: SegmentType[] = ['track', 'industry', 'role'];
  if (!validTypes.includes(type as SegmentType)) {
    notFound();
  }
  
  // Get segment
  const segment = getSegment(type as SegmentType, key);
  
  if (!segment) {
    notFound();
  }
  
  // Get course details for included courses
  const courses = segment.includedCourseSlugs
    .map((slug) => {
      const metadata = courseMetadata[slug];
      if (!metadata) return null;
      return {
        slug,
        ...metadata,
      };
    })
    .filter((course) => course !== null);
  
  return <SegmentLandingPage segment={segment} courses={courses} />;
}
