import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch job details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch job (jobs are public, but we check auth for consistency)
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      jobType: job.job_type,
      experienceLevel: job.experience_level,
      location: job.location,
      isRemote: job.is_remote,
      salaryRange: job.salary_range,
      status: job.status,
      matchingScore: job.matching_score,
      skills: job.skills || [],
      skillsMissing: job.skills_missing || [],
      recommendedForCourses: job.recommended_for_courses || [],
      externalUrl: job.external_url,
      applicationDeadline: job.application_deadline,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}
