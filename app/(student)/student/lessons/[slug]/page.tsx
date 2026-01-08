import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { loadLessonBySlug, getAllLessonSlugs } from '@/lib/lessons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        <div className="prose prose-lg prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-brand-light prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-brand-light prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {lesson.content}
          </ReactMarkdown>
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
