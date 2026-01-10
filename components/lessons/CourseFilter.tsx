'use client';

import { useRouter } from 'next/navigation';

interface Course {
  slug: string;
  title: string;
}

interface CourseFilterProps {
  courses?: Course[];
  courseSlugs: string[];
  currentCourseSlug?: string;
}

export function CourseFilter({ courses, courseSlugs, currentCourseSlug }: CourseFilterProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      router.push(`/student/lessons?course=${value}`);
    } else {
      router.push('/student/lessons');
    }
  };

  if (courseSlugs.length === 0 && (!courses || courses.length === 0)) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center gap-4">
      <label htmlFor="course-filter" className="text-sm text-gray-700">
        Filter by course:
      </label>
      <select
        id="course-filter"
        value={currentCourseSlug || ''}
        onChange={handleChange}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-light"
      >
        <option value="">All Courses</option>
        {courses?.map((course) => (
          <option key={course.slug} value={course.slug}>
            {course.title}
          </option>
        ))}
        {courseSlugs
          .filter((slug) => !courses?.find((c) => c.slug === slug))
          .map((slug) => (
            <option key={slug} value={slug}>
              {slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
      </select>
    </div>
  );
}
