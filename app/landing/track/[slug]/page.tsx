import { notFound } from 'next/navigation';
import { getSegment } from '@/lib/utils/segments';
import { courseMetadata } from '@/lib/course-metadata';
import PublicSegmentLandingPage from '@/components/segments/PublicSegmentLandingPage';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
  const supabase = await createServerSupabaseClient();
  
  // Fetch course data from database to get difficulty_level
  const { data: dbCourses } = await supabase
    .from('courses')
    .select('slug, difficulty_level, is_live')
    .in('slug', segment.includedCourseSlugs);
  
  const dbCoursesMap = new Map(
    (dbCourses || []).map((c) => [c.slug, c])
  );
  
  const courses = segment.includedCourseSlugs
    .map((courseSlug) => {
      const metadata = courseMetadata[courseSlug];
      if (!metadata) return null;
      
      // Filter by isLive - check both metadata and database
      const dbCourse = dbCoursesMap.get(courseSlug);
      const isLive = dbCourse?.is_live !== false && metadata.isLive !== false;
      if (!isLive) return null;
      
      return {
        slug: courseSlug,
        ...metadata,
        difficulty: dbCourse?.difficulty_level || null,
      };
    })
    .filter((course) => course !== null);
  
  return <PublicSegmentLandingPage segment={segment} courses={courses} />;
}
