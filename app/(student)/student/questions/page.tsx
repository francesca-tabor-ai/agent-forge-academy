import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QuestionsList } from '@/components/questions/QuestionsList';
import Link from 'next/link';

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const contextType = typeof params.context_type === 'string' ? params.context_type : 'all';
  const contextId = typeof params.context_id === 'string' ? params.context_id : '';

  // Build query
  let query = supabase
    .from('questions')
    .select(
      `
      id,
      title,
      body,
      context_type,
      context_id,
      created_at,
      updated_at,
      student_profiles!inner (
        id,
        profiles!inner (
          id,
          user_id
        )
      ),
      answers (
        id,
        body,
        is_accepted,
        created_at,
        profiles (
          id,
          role
        )
      )
    `
    )
    .order('created_at', { ascending: false });

  // Filter by context if provided
  if (contextType !== 'all' && contextId) {
    query = query.eq('context_type', contextType).eq('context_id', contextId);
  }

  const { data: questions, error } = await query;

  if (error) {
    console.error('Error fetching questions:', error);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Questions & Answers</h1>
        <Link
          href="/student/questions/ask"
          className="btn-primary text-sm"
        >
          Ask Question
        </Link>
      </div>

      <QuestionsList
        questions={questions || []}
        initialContextType={contextType}
        initialContextId={contextId}
      />
    </div>
  );
}

