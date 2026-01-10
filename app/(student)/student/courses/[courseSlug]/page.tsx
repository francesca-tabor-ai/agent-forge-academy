import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { loadAllLessons } from '@/lib/lessons';

interface CoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { courseSlug } = await params;

  // Get course from database
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', courseSlug)
    .single();

  if (error || !course) {
    // Course might not be in database yet, check if it exists in file system
    const lessons = loadAllLessons(undefined, courseSlug);
    if (lessons.length === 0) {
      notFound();
    }

    // Course exists in file system but not in database
    // Show it anyway (for backward compatibility)
  }

  // Get student profile to check enrollment
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  let enrollment = null;
  if (profile && course?.id) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (studentProfile) {
      const { data: enrollmentData } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', course.id)
        .eq('student_profile_id', studentProfile.id)
        .single();

      enrollment = enrollmentData;
    }
  }

  // Load lessons for this course
  const lessons = loadAllLessons(undefined, courseSlug);

  const courseTitle = course?.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const courseDescription = course?.description || null;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/student/courses"
          className="text-sm text-brand-light hover:text-brand-light/90 mb-6 inline-block"
        >
          ← Back to Courses
        </Link>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{courseTitle}</h1>
        
        {courseDescription && (
          <p className="text-sm text-gray-600 mb-4">{courseDescription}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
          {course?.duration_weeks && <span>{course.duration_weeks} weeks</span>}
          {course?.difficulty_level && (
            <span className="capitalize">{course.difficulty_level}</span>
          )}
          {enrollment && (
            <span className="text-brand-light font-medium">
              {enrollment.progress_percentage}% Complete
            </span>
          )}
        </div>

        {!enrollment && course?.id && (
          <form action={`/api/courses/enroll?course_id=${course.id}`} method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors"
            >
              Enroll in Course
            </button>
          </form>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Lessons</h2>
        
        {lessons.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No lessons available for this course yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link
                key={lesson.slug}
                href={`/student/courses/${courseSlug}/lessons/${lesson.slug}`}
                className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-light hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {lesson.frontmatter.title || lesson.slug}
                    </h3>
                    {lesson.frontmatter.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {lesson.frontmatter.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {lesson.frontmatter.module && (
                        <span>Module {lesson.frontmatter.module}</span>
                      )}
                      {lesson.frontmatter.week && (
                        <span>Week {lesson.frontmatter.week}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="text-brand-light">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
