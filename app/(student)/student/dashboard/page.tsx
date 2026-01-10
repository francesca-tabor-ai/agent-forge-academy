import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAllCourseSlugs, loadAllLessons } from '@/lib/lessons';
import { courseMetadata } from '@/lib/course-metadata';
import { CoursesSection } from '@/components/dashboard/CoursesSection';
import { PortfolioSection } from '@/components/dashboard/PortfolioSection';
import { JobOpportunitiesSection } from '@/components/dashboard/JobOpportunitiesSection';
import { AIAdvisorSection } from '@/components/dashboard/AIAdvisorSection';
import { OffersSection } from '@/components/dashboard/OffersSection';
import { SubscriptionSection } from '@/components/dashboard/SubscriptionSection';
import { getUserRole } from '@/lib/supabase/server';

export default async function StudentDashboard() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const role = await getUserRole();

  // Get student profile to check enrollments
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  let studentProfileId: string | null = null;
  if (profile) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();
    studentProfileId = studentProfile?.id || null;
  }

  // Get all published courses from database
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
  }

  // Get enrollments for this student
  let enrollments: Record<string, { progress_percentage: number; enrolled_at: string }> = {};
  if (studentProfileId) {
    const { data: enrollmentData } = await supabase
      .from('course_enrollments')
      .select('course_id, progress_percentage, enrolled_at')
      .eq('student_profile_id', studentProfileId);

    if (enrollmentData) {
      enrollments = enrollmentData.reduce((acc, e) => {
        acc[e.course_id] = {
          progress_percentage: e.progress_percentage,
          enrolled_at: e.enrolled_at,
        };
        return acc;
      }, {} as Record<string, { progress_percentage: number; enrolled_at: string }>);
    }
  }

  // Get course slugs from file system (for courses that might not be in DB yet)
  const courseSlugs = getAllCourseSlugs();
  const courseSlugSet = new Set(courseSlugs);

  // Merge database courses with file system courses
  type CourseWithMetadata = {
    id: string | null;
    slug: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    duration_weeks: number | null;
    difficulty_level: string | null;
    is_published: boolean;
    created_at: string | null;
    updated_at: string | null;
    hasContent: boolean;
    metadata?: typeof courseMetadata[string];
  };

  const allCourses: CourseWithMetadata[] = (courses || []).map((course) => ({
    ...course,
    hasContent: courseSlugSet.has(course.slug),
    metadata: courseMetadata[course.slug],
  }));

  // Also include courses from file system that aren't in database yet
  for (const slug of courseSlugs) {
    if (!allCourses.find((c) => c.slug === slug)) {
      // Try to get lesson count
      const lessons = loadAllLessons(undefined, slug);
      const metadata = courseMetadata[slug];
      allCourses.push({
        id: null, // Not in database yet
        slug,
        title: metadata?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        description: metadata?.outcome || null,
        thumbnail_url: null,
        duration_weeks: null,
        difficulty_level: null,
        is_published: false,
        created_at: null,
        updated_at: null,
        hasContent: lessons.length > 0,
        metadata,
      });
    }
  }

  // Get portfolio data
  let portfolioData = null;
  if (studentProfileId) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, visibility, bio')
      .eq('id', studentProfileId)
      .single();

    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('id, title, description, visibility, created_at')
      .eq('student_profile_id', studentProfileId)
      .order('created_at', { ascending: false });

    portfolioData = {
      profile: studentProfile,
      projects: projects || [],
    };
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* (1) Courses Section - Primary reason users log in */}
      <CoursesSection 
        courses={allCourses}
        enrollments={enrollments}
        studentProfileId={studentProfileId}
      />

      {/* (2) Portfolio Section - Career signal layer */}
      <PortfolioSection portfolioData={portfolioData} />

      {/* (3) Job Opportunities Section - Motivation + outcome alignment */}
      <JobOpportunitiesSection studentProfileId={studentProfileId} />

      {/* (4) AI Advisor Section - Support + momentum recovery */}
      <AIAdvisorSection 
        studentProfileId={studentProfileId}
        activeCourses={allCourses.filter(c => c.id && enrollments[c.id])}
      />

      {/* (5) Offers Section - Tool Discounts (small card, never above learning/career) */}
      <OffersSection />

      {/* (6) Subscription Section - Lowest priority, admin-only */}
      {role === 'admin' && <SubscriptionSection />}
    </div>
  );
}
