import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { loadLessonBySlug, getAllLessonSlugs } from '@/lib/lessons';

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { slug } = await params;
  const lesson = loadLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/student/lessons"
          className="text-sm text-brand-light hover:text-brand-light/90 mb-4 inline-block"
        >
          ← Back to Lessons
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900 mt-4">
          {lesson.frontmatter.title || lesson.slug}
        </h1>
        {lesson.frontmatter.description && (
          <p className="text-gray-600 mt-2">{lesson.frontmatter.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
          {lesson.frontmatter.module && (
            <span>Module: {lesson.frontmatter.module}</span>
          )}
          {lesson.frontmatter.week && <span>Week {lesson.frontmatter.week}</span>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="prose prose-lg max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-900">
            {lesson.content}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all lessons
export async function generateStaticParams() {
  const slugs = getAllLessonSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

