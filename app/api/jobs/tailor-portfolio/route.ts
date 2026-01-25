import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getLLMProvider } from '@/lib/ai/llm';
import { safeLogger } from '@/lib/utils/redactPII';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const requestId = `portfolio-tailor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
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
    const { jobId } = body;

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

    // Fetch all portfolio projects
    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: false });

    if (!projects || projects.length === 0) {
      return NextResponse.json({
        recommendedProjectIds: [],
        explanation: 'No portfolio projects available to tailor.',
      });
    }

    // Prepare context for LLM
    const jobSkills = (job.skills as string[] || []).map(s => s.toLowerCase());
    const jobDescription = `
Title: ${job.title}
Company: ${job.company}
Description: ${job.description || 'No description provided'}
Required Skills: ${jobSkills.join(', ')}
Experience Level: ${job.experience_level || 'Not specified'}
`;

    const projectsContext = projects.map((p: any, index: number) => `
Project ${index + 1}:
- ID: ${p.id}
- Title: ${p.title}
- Description: ${p.description || 'No description'}
- Tech Stack: ${(p.tech_stack as string[] || []).map((s: string) => s.toLowerCase()).join(', ')}
- GitHub: ${p.github_url || 'Not provided'}
- Demo: ${p.demo_url || 'Not provided'}
`).join('\n');

    // Build LLM prompt
    const systemPrompt = `You are an expert career advisor helping students tailor their portfolio for specific job applications.
Your task is to analyze portfolio projects and recommend which 1-3 projects best showcase the candidate's skills relevant to the job.

Consider:
- Technical skills match (tech stack overlap with job requirements)
- Project complexity and relevance
- Demonstrated experience level
- Diversity of skills shown across projects
- Quality indicators (GitHub activity, demo availability)

Return a JSON object with:
- recommendedProjectIds: array of project IDs (1-3 projects)
- explanation: brief explanation of why these projects were selected`;

    const userPrompt = `Analyze these portfolio projects and recommend which 1-3 projects best match this job:

JOB DETAILS:
${jobDescription}

AVAILABLE PROJECTS:
${projectsContext}

Return a JSON object with recommendedProjectIds (array of project IDs) and explanation (string).
Select 1-3 projects that best demonstrate the required skills: ${jobSkills.join(', ')}.`;

    // Generate recommendations using LLM
    const llm = getLLMProvider();
    const response = await llm.generate(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.7,
        maxTokens: 1000,
      }
    );

    // Parse LLM response (expecting JSON)
    let recommendations;
    try {
      // Try to extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: use simple matching algorithm
        recommendations = fallbackRecommendation(projects, jobSkills);
      }
    } catch (parseError) {
      safeLogger.warn(`[${requestId}] Failed to parse LLM response, using fallback`, {
        error: parseError,
        response: response.content.substring(0, 200),
      });
      recommendations = fallbackRecommendation(projects, jobSkills);
    }

    // Validate recommendations
    const recommendedProjectIds = Array.isArray(recommendations.recommendedProjectIds)
      ? recommendations.recommendedProjectIds.filter((id: string) =>
          projects.some((p: any) => p.id === id)
        ).slice(0, 3) // Max 3 projects
      : [];

    const explanation = recommendations.explanation || 'Selected projects based on skill match.';

    safeLogger.info(`[${requestId}] Portfolio tailored successfully`, {
      jobId,
      studentProfileId: studentProfile.id,
      recommendedCount: recommendedProjectIds.length,
    });

    return NextResponse.json({
      recommendedProjectIds,
      explanation,
      metadata: {
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        tokensUsed: response.usage?.totalTokens || 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    safeLogger.error(`[${requestId}] Portfolio tailoring failed`, {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Failed to tailor portfolio', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Fallback recommendation algorithm when LLM response cannot be parsed
 */
function fallbackRecommendation(projects: any[], jobSkills: string[]): {
  recommendedProjectIds: string[];
  explanation: string;
} {
  // Score each project based on skill overlap
  const scoredProjects = projects.map((project) => {
    const projectSkills = (project.tech_stack as string[] || []).map((s: string) => s.toLowerCase());
    const matchingSkills = projectSkills.filter((skill) =>
      jobSkills.some((jobSkill) => skill.includes(jobSkill) || jobSkill.includes(skill))
    );
    const score = matchingSkills.length / Math.max(jobSkills.length, 1);
    
    return {
      id: project.id,
      score,
      matchingSkills,
    };
  });

  // Sort by score (descending) and take top 3
  const topProjects = scoredProjects
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter((p) => p.score > 0); // Only include projects with some match

  return {
    recommendedProjectIds: topProjects.map((p) => p.id),
    explanation: topProjects.length > 0
      ? `Selected ${topProjects.length} project(s) with the best skill match: ${topProjects.map(p => p.matchingSkills.join(', ')).join('; ')}`
      : 'No projects found with matching skills. Consider adding projects that use the required technologies.',
  };
}
