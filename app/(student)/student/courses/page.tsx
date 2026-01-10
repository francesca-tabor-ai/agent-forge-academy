import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAllCourseSlugs, loadAllLessons } from '@/lib/lessons';

export default async function CoursesPage() {
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
  const allCourses = (courses || []).map((course) => ({
    ...course,
    hasContent: courseSlugSet.has(course.slug),
  }));

  // Also include courses from file system that aren't in database yet
  for (const slug of courseSlugs) {
    if (!allCourses.find((c) => c.slug === slug)) {
      // Try to get lesson count
      const lessons = loadAllLessons(undefined, slug);
      allCourses.push({
        id: null, // Not in database yet
        slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        description: null,
        thumbnail_url: null,
        duration_weeks: null,
        difficulty_level: null,
        is_published: false,
        created_at: null,
        updated_at: null,
        hasContent: lessons.length > 0,
      });
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
        <p className="text-sm text-gray-600 mt-2">
          Browse and enroll in available courses
        </p>
      </div>

      {allCourses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No courses available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => {
            const enrollment = course.id ? enrollments[course.id] : null;
            const isEnrolled = !!enrollment;

            return (
              <Link
                key={course.slug}
                href={`/student/courses/${course.slug}`}
                className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-light hover:shadow-md transition-all"
              >
                <div className="flex flex-col h-full">
                  {course.thumbnail_url && (
                    <div className="mb-4 aspect-video bg-gray-100 rounded overflow-hidden">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  
                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4 flex-1">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {course.duration_weeks && (
                        <span>{course.duration_weeks} weeks</span>
                      )}
                      {course.difficulty_level && (
                        <span className="capitalize">{course.difficulty_level}</span>
                      )}
                    </div>
                    
                    {isEnrolled ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-light font-medium">
                          {enrollment.progress_percentage}% Complete
                        </span>
                        <span className="text-brand-light">→</span>
                      </div>
                    ) : (
                      <span className="text-brand-light text-sm">View →</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
