import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QuestionsList } from '@/components/questions/QuestionsList';

export default async function TutorQuestionsPage({
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

  // Build query - tutors can see all questions
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
    <div className="tutor-questions-page">
      <h1>Student Questions</h1>
      <p>Answer questions and help students learn.</p>
      <QuestionsList
        questions={questions || []}
        initialContextType={contextType}
        initialContextId={contextId}
        showAnswerForm={true}
      />
    </div>
  );
}

