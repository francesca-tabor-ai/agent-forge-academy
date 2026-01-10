import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createUserSupabaseClient();
    
    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch active jobs, ordered by matching score and status
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('matching_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    // Transform jobs to match component interface
    const transformedJobs = (jobs || []).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      matchingScore: job.matching_score || 0,
      status: job.status,
      skills: job.skills || [],
      skillsMissing: job.skills_missing || [],
      isLocked: job.status === 'locked',
      isStretch: job.status === 'stretch',
    }));

    return NextResponse.json({ jobs: transformedJobs });
  } catch (error) {
    console.error('Error in jobs API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
