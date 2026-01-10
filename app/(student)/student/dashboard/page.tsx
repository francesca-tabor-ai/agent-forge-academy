import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAllCourseSlugs, loadAllLessons } from '@/lib/lessons';
import { courseMetadata } from '@/lib/course-metadata';
import { CourseCard } from '@/components/courses/CourseCard';

export default async function StudentDashboard() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

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

  // Sort courses by category for better organization
  const categoryOrder = [
    'Build & Ship (Engineering)',
    'Agents & Retrieval',
    'Growth & Visibility',
    'Commerce & Experiences',
    'Media & Content Ops',
    'Trust & Regulation',
  ];

  allCourses.sort((a, b) => {
    const categoryA = a.metadata?.category || '';
    const categoryB = b.metadata?.category || '';
    const indexA = categoryOrder.indexOf(categoryA);
    const indexB = categoryOrder.indexOf(categoryB);
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return (a.title || '').localeCompare(b.title || '');
  });

  // Get actionable items
  // TODO: Add actual queries for:
  // - Continue lesson
  // - Upcoming session
  // - Pending question
  // - Demo day reminder

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="space-y-8">
        {/* Action items - only show what user should act on */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Next Actions</h2>
          <div className="space-y-3">
            {/* Example: Continue lesson */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Continue Learning</h3>
                  <p className="text-sm text-gray-600 mt-1">Resume where you left off</p>
                </div>
                <Link
                  href="/student/lessons"
                  className="text-sm font-medium text-brand-light hover:text-brand-light/90"
                >
                  View →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* All Courses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">All Courses</h2>
            <Link
              href="/student/courses"
              className="text-sm font-medium text-brand-light hover:text-brand-light/90"
            >
              View All →
            </Link>
          </div>
          
          {allCourses.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No courses available at this time.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Group courses by category */}
              {Object.entries(
                allCourses.reduce((acc, course) => {
                  const category = course.metadata?.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(course);
                  return acc;
                }, {} as Record<string, typeof allCourses>)
              ).map(([category, categoryCourses]) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryCourses.map((course) => {
                      const enrollment = course.id ? enrollments[course.id] : null;
                      return (
                        <CourseCard
                          key={course.slug}
                          course={course}
                          metadata={course.metadata}
                          enrollment={enrollment || null}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

