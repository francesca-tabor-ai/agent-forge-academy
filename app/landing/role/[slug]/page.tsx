import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSegment } from '@/lib/utils/segments';
import { courseMetadata } from '@/lib/course-metadata';
import PublicSegmentLandingPage from '@/components/segments/PublicSegmentLandingPage';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSegmentSubscriptionConfig } from '@/lib/utils/segment-subscriptions';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const segment = getSegment('role', slug);
  
  if (!segment) {
    return {
      title: 'Role Not Found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agentforge.academy';
  const canonicalUrl = `${baseUrl}/landing/role/${slug}`;
  
  return {
    title: `${segment.displayName} - AI Growth Hub`,
    description: segment.description || `Learn ${segment.displayName} with ${segment.includedCourseSlugs.length} live courses. Subscribe to access all courses for this role.`,
    openGraph: {
      title: `${segment.displayName} - AI Growth Hub`,
      description: segment.description || `Learn ${segment.displayName} with ${segment.includedCourseSlugs.length} live courses.`,
      images: [
        {
          url: segment.heroImageUrl,
          width: 1200,
          height: 630,
          alt: `${segment.displayName} hero image`,
        },
      ],
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${segment.displayName} - AI Growth Hub`,
      description: segment.description || `Learn ${segment.displayName} with ${segment.includedCourseSlugs.length} live courses.`,
      images: [segment.heroImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export async function generateStaticParams() {
  const { getSegmentsByType } = await import('@/lib/utils/segments');
  const segments = getSegmentsByType('role');
  
  return segments.map((segment) => ({
    slug: segment.key,
  }));
}

export default async function RoleLandingPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Get segment
  const segment = getSegment('role', slug);
  
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
  
  // Get subscription config server-side
  const config = getSegmentSubscriptionConfig(segment);
  
  return <PublicSegmentLandingPage segment={segment} courses={courses} config={config} />;
}
