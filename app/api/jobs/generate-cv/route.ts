import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getLLMProvider } from '@/lib/ai/llm';
import { getStudentDataForMatching } from '@/lib/jobs/student-data-cache';
import { safeLogger } from '@/lib/utils/redactPII';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const requestId = `cv-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
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
    const { jobId, useExistingCV } = body;

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

    // Fetch student data
    const studentData = await getStudentDataForMatching(supabase, studentProfile.id);

    // Fetch full student profile for CV generation
    const { data: fullStudentProfile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', studentProfile.id)
      .single();

    // Fetch portfolio projects
    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: false });

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
      .eq('student_profile_id', studentProfile.id);

    // Get existing CV text if useExistingCV is true
    let existingCVText = '';
    if (useExistingCV && fullStudentProfile?.cv_text) {
      existingCVText = fullStudentProfile.cv_text;
    }

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
LinkedIn: ${fullStudentProfile?.linkedin_url || 'Not provided'}
GitHub: ${fullStudentProfile?.github_url || 'Not provided'}
Website: ${fullStudentProfile?.website_url || 'Not provided'}
`;

    const projectsContext = projects && projects.length > 0
      ? projects.map((p: any) => `
Project: ${p.title}
Description: ${p.description || 'No description'}
Tech Stack: ${(p.tech_stack as string[] || []).join(', ')}
GitHub: ${p.github_url || 'Not provided'}
Demo: ${p.demo_url || 'Not provided'}
`).join('\n')
      : 'No portfolio projects available';

    const coursesContext = enrollments && enrollments.length > 0
      ? enrollments.map((e: any) => {
          const course = e.courses;
          return `Course: ${course?.title || 'Unknown'} - Progress: ${e.progress_percentage || 0}%${e.completed_at ? ' (Completed)' : ''}`;
        }).join('\n')
      : 'No courses enrolled';

    // Build LLM prompt
    const systemPrompt = `You are an expert CV/resume writer specializing in tailoring CVs for specific job applications. 
Your task is to create a professional, ATS-friendly CV that highlights the candidate's most relevant skills and experiences for the target role.

Guidelines:
- Use a clear, professional format
- Highlight skills and experiences that match the job requirements
- Quantify achievements where possible
- Keep it concise (1-2 pages when formatted)
- Use action verbs and industry-standard terminology
- Include relevant projects and courses that demonstrate required skills
- Format as plain text (no markdown, no special formatting characters)
- Structure: Contact Info, Professional Summary, Skills, Experience/Projects, Education/Courses`;

    const userPrompt = `Generate a tailored CV for this job application:

JOB DETAILS:
${jobDescription}

CANDIDATE PROFILE:
${studentContext}

PORTFOLIO PROJECTS:
${projectsContext}

COURSE ENROLLMENTS:
${coursesContext}

${existingCVText ? `\nEXISTING CV (use as reference but tailor for this job):\n${existingCVText}` : ''}

Generate a professional CV tailored specifically for this ${job.title} role at ${job.company}. 
Focus on matching the required skills: ${(job.skills as string[] || []).join(', ')}.
Make sure to highlight relevant projects and courses that demonstrate these skills.`;

    // Generate CV using LLM
    const llm = getLLMProvider();
    const response = await llm.generate(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    safeLogger.info(`[${requestId}] CV generated successfully`, {
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
    safeLogger.error(`[${requestId}] CV generation failed`, {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Failed to generate CV', details: error.message },
      { status: 500 }
    );
  }
}
