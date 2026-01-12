import Link from 'next/link';
import { Lesson } from '@/lib/lessons';

interface NextLessonNavigationProps {
  nextLesson: Lesson | null;
  isLastLesson: boolean;
  courseSlug?: string;
  variant?: 'top' | 'bottom';
}

export function NextLessonNavigation({
  nextLesson,
  isLastLesson,
  courseSlug,
  variant = 'bottom',
}: NextLessonNavigationProps) {
  // Build the lesson URL
  const getLessonUrl = (lesson: Lesson) => {
    if (lesson.courseSlug || courseSlug) {
      const slug = lesson.courseSlug || courseSlug;
      return `/student/courses/${slug}/lessons/${lesson.slug}`;
    }
    return `/student/lessons/${lesson.slug}`;
  };

  // Top variant: small secondary button aligned right
  if (variant === 'top') {
    if (!nextLesson && isLastLesson) {
      // Last lesson - show module complete or link to course
      if (courseSlug) {
        return (
          <div className="flex justify-end mb-6">
            <Link
              href={`/student/courses/${courseSlug}`}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Module complete →
            </Link>
          </div>
        );
      }
      return null; // No course context, don't show anything
    }

    if (!nextLesson) {
      return null; // No next lesson and not last (edge case)
    }

    return (
      <div className="flex justify-end mb-6">
        <Link
          href={getLessonUrl(nextLesson)}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded border border-gray-300 hover:border-gray-400"
        >
          Next →
        </Link>
      </div>
    );
  }

  // Bottom variant: prominent CTA
  if (isLastLesson) {
    // Last lesson - show module complete or link to course
    if (courseSlug) {
      return (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            href={`/student/courses/${courseSlug}`}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-base font-medium"
          >
            Go to next module →
          </Link>
        </div>
      );
    }
    return (
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">Module complete</p>
        </div>
      </div>
    );
  }

  if (!nextLesson) {
    return null; // No next lesson (edge case)
  }

  const nextLessonTitle = nextLesson.frontmatter.title || nextLesson.slug;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <Link
        href={getLessonUrl(nextLesson)}
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium"
      >
        Next: {nextLessonTitle} →
      </Link>
    </div>
  );
}
