import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getLLMProvider } from '@/lib/ai/llm';
import { getStudentDataForMatching } from '@/lib/jobs/student-data-cache';
import { safeLogger } from '@/lib/utils/redactPII';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const requestId = `cover-letter-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Access denied. Student role required.' },
        { status: 403 }
      );
    }

    // Get student profile ID
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { jobId, selectedProjectIds } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('is_active', true)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Fetch full student profile
    const { data: fullStudentProfile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', studentProfile.id)
      .single();

    // Fetch portfolio projects (filter by selectedProjectIds if provided)
    let projectsQuery = supabase
      .from('portfolio_projects')
      .select('*')
      .eq('student_profile_id', studentProfile.id);

    if (selectedProjectIds && Array.isArray(selectedProjectIds) && selectedProjectIds.length > 0) {
      projectsQuery = projectsQuery.in('id', selectedProjectIds);
    }

    const { data: projects } = await projectsQuery.order('created_at', { ascending: false });

    // Fetch course enrollments with course details
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        courses:course_id (
          id,
          title,
          slug
        )
      `)
      .eq('student_profile_id', studentProfile.id)
      .order('progress_percentage', { ascending: false });

    // Prepare context for LLM
    const jobDescription = `
Title: ${job.title}
Company: ${job.company}
Description: ${job.description || 'No description provided'}
Required Skills: ${(job.skills as string[] || []).join(', ')}
Experience Level: ${job.experience_level || 'Not specified'}
Location: ${job.location || 'Not specified'}
Job Type: ${job.job_type || 'Not specified'}
`;

    const studentContext = `
Name: ${fullStudentProfile?.full_name || 'Not provided'}
Headline: ${fullStudentProfile?.headline || 'Not provided'}
Bio: ${fullStudentProfile?.bio || 'Not provided'}
Skills: ${(fullStudentProfile?.skills as string[] || []).join(', ')}
Location: ${fullStudentProfile?.location || 'Not provided'}
`;

    const projectsContext = projects && projects.length > 0
      ? projects.map((p: any) => `
Project: ${p.title}
Description: ${p.description || 'No description'}
Tech Stack: ${(p.tech_stack as string[] || []).join(', ')}
${p.github_url ? `GitHub: ${p.github_url}` : ''}
${p.demo_url ? `Demo: ${p.demo_url}` : ''}
`).join('\n')
      : 'No portfolio projects available';

    const coursesContext = enrollments && enrollments.length > 0
      ? enrollments
          .filter((e: any) => e.progress_percentage >= 50 || e.completed_at) // Only include substantial progress
          .map((e: any) => {
            const course = e.courses;
            return `Course: ${course?.title || 'Unknown'}${e.completed_at ? ' (Completed)' : ` (${e.progress_percentage}% complete)`}`;
          })
          .join('\n')
      : 'No relevant courses completed';

    // Build LLM prompt
    const systemPrompt = `You are an expert cover letter writer specializing in creating compelling, personalized cover letters for job applications.
Your task is to write a professional cover letter that:
- Demonstrates genuine interest in the role and company
- Highlights the candidate's most relevant skills and experiences
- Connects the candidate's background to the job requirements
- Shows enthusiasm and cultural fit
- Is concise (3-4 paragraphs, ~300-400 words)
- Uses a professional but personable tone
- Includes specific examples from projects or courses when relevant

Format as plain text (no markdown, no special formatting).`;

    const userPrompt = `Write a tailored cover letter for this job application:

JOB DETAILS:
${jobDescription}

CANDIDATE PROFILE:
${studentContext}

RELEVANT PORTFOLIO PROJECTS:
${projectsContext}

RELEVANT COURSE WORK:
${coursesContext}

Write a compelling cover letter for the ${job.title} position at ${job.company}.
Focus on how the candidate's skills (${(fullStudentProfile?.skills as string[] || []).join(', ')}) and experiences align with the job requirements (${(job.skills as string[] || []).join(', ')}).
Mention specific projects or courses that demonstrate relevant skills.
Make it personal, professional, and compelling.`;

    // Generate cover letter using LLM
    const llm = getLLMProvider();
    const response = await llm.generate(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.8,
        maxTokens: 1500,
      }
    );

    safeLogger.info(`[${requestId}] Cover letter generated successfully`, {
      jobId,
      studentProfileId: studentProfile.id,
      tokensUsed: response.usage?.totalTokens,
    });

    return NextResponse.json({
      content: response.content,
      metadata: {
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        tokensUsed: response.usage?.totalTokens || 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    safeLogger.error(`[${requestId}] Cover letter generation failed`, {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Failed to generate cover letter', details: error.message },
      { status: 500 }
    );
  }
}
