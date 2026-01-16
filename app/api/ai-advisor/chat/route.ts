import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getLLMProvider, type LLMMessage } from '@/lib/ai/llm';
import { retrieveChunks, formatChunksForContext, generateCitations } from '@/lib/rag/retrieve';
import { classifyIntent, getToolsForIntent, type AdvisorIntent, type IntentClassification } from '@/lib/ai/intent';
import { getTopJobMatches, formatJobMatchesForLLM } from '@/lib/jobs/advisor-tools';
import { generateNextActions, type NextAction } from '@/lib/ai/nextActions';
import { redactPII, safeLogger } from '@/lib/utils/redactPII';
import { logRequest, getUserIdFromRequest, getIpAddress, getUserAgent } from '@/lib/utils/request-logger';

interface ChatRequest {
  message: string;
  context?: {
    course?: { id: string; slug: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  };
  studentProfileId: string | null;
  conversationHistory: Array<{
    id: string;
    role: 'user' | 'assistant' | 'human';
    content: string;
    timestamp: Date;
  }>;
  intent?: string; // For quick actions: 'architecture_review', 'risks_and_improvements', 'rewrite_description', etc.
  conversationId?: string; // For conversation persistence
}

/**
 * Load active context from advisor_context table
 */
async function loadActiveContext(
  supabase: any,
  studentProfileId: string | null
): Promise<{
  activeCourseId: string | null;
  activeProjectId: string | null;
  activeJobId: string | null;
}> {
  if (!studentProfileId) {
    return { activeCourseId: null, activeProjectId: null, activeJobId: null };
  }

  const { data: context } = await supabase
    .from('advisor_context')
    .select('active_course_id, active_project_id, active_job_id')
    .eq('student_profile_id', studentProfileId)
    .single();

  if (!context) {
    return { activeCourseId: null, activeProjectId: null, activeJobId: null };
  }

  return {
    activeCourseId: context.active_course_id,
    activeProjectId: context.active_project_id,
    activeJobId: context.active_job_id,
  };
}

// Fetch real data for context
async function fetchContextData(
  context: ChatRequest['context'],
  supabase: any,
  studentProfileId: string | null,
  activeContext?: { activeCourseId: string | null; activeProjectId: string | null; activeJobId: string | null }
): Promise<{
  courseData: any;
  projectData: any;
  jobData: any;
  userProfile: any;
  activeContextIds: { courseId: string | null; projectId: string | null; jobId: string | null };
}> {
  // Use active context from database if available, otherwise use request context
  const courseId = activeContext?.activeCourseId || context?.course?.id;
  const projectId = activeContext?.activeProjectId || context?.project?.id;
  const jobId = activeContext?.activeJobId || context?.job?.id;

  // Fetch course data
  let courseData = null;
  if (courseId) {
    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    if (course) {
      courseData = {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        durationWeeks: course.duration_weeks,
        difficultyLevel: course.difficulty_level,
      };
    }
  }

  // Fetch project data
  let projectData = null;
  if (projectId && studentProfileId) {
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('id', projectId)
      .eq('student_profile_id', studentProfileId)
      .single();
    if (project) {
      projectData = {
        id: project.id,
        title: project.title,
        description: project.description,
        githubUrl: project.github_url,
        demoUrl: project.demo_url,
        visibility: project.visibility,
        coverImageUrl: project.cover_image_url,
        images: project.images || [],
        techStack: project.tech_stack || [],
      };
    }
  }

  // Fetch job data
  let jobData = null;
  if (jobId) {
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('is_active', true)
      .single();
    if (job) {
      jobData = {
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
      };
    }
  }

  // Get user profile summary
  let userProfile = null;
  if (studentProfileId) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('headline, bio, skills')
      .eq('id', studentProfileId)
      .single();
    
    if (studentProfile) {
      const { count: projectCount } = await supabase
        .from('portfolio_projects')
        .select('*', { count: 'exact', head: true })
        .eq('student_profile_id', studentProfileId)
        .eq('visibility', 'public');
      
      userProfile = {
        headline: studentProfile.headline,
        hasBio: !!studentProfile.bio,
        skills: studentProfile.skills || [],
        publicProjectsCount: projectCount || 0,
      };
    }
  }

  return {
    courseData,
    projectData,
    jobData,
    userProfile,
    activeContextIds: {
      courseId: courseId || null,
      projectId: projectId || null,
      jobId: jobId || null,
    },
  };
}

/**
 * Build system prompt with context information and intent-specific guidance
 */
function buildSystemPrompt(
  context: ChatRequest['context'],
  contextData?: { courseData: any; projectData: any; jobData: any; userProfile: any },
  intent?: AdvisorIntent,
  tools?: { useRAG: boolean; useJobsMatching: boolean; usePortfolioFetch: boolean; useCourseContext: boolean }
): string {
  let systemPrompt = `You are an AI advisor for an online learning platform focused on AI, multi-agent systems, and software engineering. Your role is to help students with:

1. **Course Learning**: Explain concepts, provide practice tasks, quiz students, and guide them through lessons
2. **Project Guidance**: Review architecture, suggest improvements, help write project descriptions, and provide technical feedback
3. **Career Support**: Help tailor CVs/resumes, write cover letters, prepare for interviews, and provide job application advice

**Guidelines:**
- Be helpful, encouraging, and clear
- Use markdown formatting for better readability
- Provide actionable next steps when appropriate
- If a student is stuck after multiple attempts, suggest connecting with a human advisor
- Never share sensitive information (passwords, API keys, etc.) - warn students if they try to share these
- Be context-aware and reference the student's current course, project, or job when relevant
`;

  // Add intent-specific guidance
  if (intent) {
    switch (intent) {
      case 'learning_help':
        systemPrompt += `\n\n**Current Intent: Learning Help**\n`;
        systemPrompt += `- Focus on explaining course concepts clearly\n`;
        systemPrompt += `- Use course content to provide accurate information\n`;
        systemPrompt += `- Provide examples and practice suggestions when helpful\n`;
        break;

      case 'project_review':
        systemPrompt += `\n\n**Current Intent: Project Review**\n`;
        systemPrompt += `- Review the project architecture and implementation\n`;
        systemPrompt += `- Provide constructive feedback and improvement suggestions\n`;
        systemPrompt += `- Help with project descriptions and documentation\n`;
        break;

      case 'job_matching':
        systemPrompt += `\n\n**Current Intent: Job Matching**\n`;
        systemPrompt += `- Help identify suitable job opportunities\n`;
        systemPrompt += `- Match student skills and experience to job requirements\n`;
        systemPrompt += `- Suggest relevant courses or skills to develop\n`;
        break;

      case 'application_help':
        systemPrompt += `\n\n**Current Intent: Application Help**\n`;
        systemPrompt += `- Help tailor CV/resume to specific job requirements\n`;
        systemPrompt += `- Assist with cover letter writing\n`;
        systemPrompt += `- Provide interview preparation guidance\n`;
        break;

      case 'general_career':
        systemPrompt += `\n\n**Current Intent: General Career Advice**\n`;
        systemPrompt += `- Provide career path guidance\n`;
        systemPrompt += `- Suggest skill development opportunities\n`;
        systemPrompt += `- Help with career planning and next steps\n`;
        break;
    }
  }

  // Add context-specific information
  if (context?.course && contextData?.courseData) {
    const course = contextData.courseData;
    systemPrompt += `\n**Current Course Context:**\n`;
    systemPrompt += `- Course: ${course.title}\n`;
    systemPrompt += `- Slug: ${course.slug}\n`;
    if (course.description) {
      systemPrompt += `- Description: ${course.description}\n`;
    }
    if (course.difficultyLevel) {
      systemPrompt += `- Difficulty: ${course.difficultyLevel}\n`;
    }
    if (course.durationWeeks) {
      systemPrompt += `- Duration: ${course.durationWeeks} weeks\n`;
    }
  }

  if (context?.project && contextData?.projectData) {
    const project = contextData.projectData;
    systemPrompt += `\n**Current Project Context:**\n`;
    systemPrompt += `- Project: ${project.title}\n`;
    if (project.description) {
      systemPrompt += `- Description: ${project.description.substring(0, 300)}${project.description.length > 300 ? '...' : ''}\n`;
    }
    if (project.techStack && project.techStack.length > 0) {
      systemPrompt += `- Tech Stack: ${project.techStack.join(', ')}\n`;
    }
    systemPrompt += `- GitHub: ${project.githubUrl || 'Not linked'}\n`;
    systemPrompt += `- Demo: ${project.demoUrl || 'Not linked'}\n`;
  }

  if (context?.job && contextData?.jobData) {
    const job = contextData.jobData;
    systemPrompt += `\n**Current Job Context:**\n`;
    systemPrompt += `- Position: ${job.title} at ${job.company}\n`;
    if (job.description) {
      systemPrompt += `- Description: ${job.description.substring(0, 300)}${job.description.length > 300 ? '...' : ''}\n`;
    }
    if (job.skills && job.skills.length > 0) {
      systemPrompt += `- Required Skills: ${job.skills.join(', ')}\n`;
    }
    if (job.skillsMissing && job.skillsMissing.length > 0) {
      systemPrompt += `- Missing Skills: ${job.skillsMissing.join(', ')}\n`;
    }
    if (job.matchingScore !== undefined) {
      systemPrompt += `- Match Score: ${job.matchingScore}%\n`;
    }
  }

  if (contextData?.userProfile) {
    const profile = contextData.userProfile;
    systemPrompt += `\n**Student Profile:**\n`;
    if (profile.headline) {
      systemPrompt += `- Headline: ${profile.headline}\n`;
    }
    if (profile.skills && profile.skills.length > 0) {
      systemPrompt += `- Skills: ${profile.skills.join(', ')}\n`;
    }
    if (profile.publicProjectsCount) {
      systemPrompt += `- Public Projects: ${profile.publicProjectsCount}\n`;
    }
  }

  systemPrompt += `\n**Important:** Always be helpful, specific, and actionable. Use the context provided to give personalized advice.`;

  return systemPrompt;
}

/**
 * Job with matching score for sorting
 */
interface JobWithScore {
  id: string;
  title: string;
  company: string;
  matchingScore: number;
  status: string;
  skills: string[];
  skillsMissing: string[];
}

/**
 * Fetch top matching jobs for student
 */
async function fetchMatchingJobs(
  supabase: any,
  studentProfileId: string | null,
  limit: number = 5
): Promise<JobWithScore[]> {
  if (!studentProfileId) return [];

  try {
    // Get student profile directly by ID
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, skills')
      .eq('id', studentProfileId)
      .single();

    if (!studentProfile) return [];

    // Get enrolled courses and portfolio projects
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id, progress_percentage, completed_at')
      .eq('student_profile_id', studentProfile.id);

    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('id, tech_stack, title, description')
      .eq('student_profile_id', studentProfile.id);

    // Fetch jobs and calculate matches
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .limit(50);

    if (!jobs || jobs.length === 0) return [];

    // Import matching function
    const { calculateJobMatch } = await import('@/lib/jobs/matching');

    const studentProfileData = {
      id: studentProfile.id,
      skills: (studentProfile.skills as string[]) || [],
    };

    const portfolioProjectsData = (projects || []).map((p: any) => ({
      id: p.id,
      tech_stack: (p.tech_stack as string[]) || [],
      title: p.title,
      description: p.description,
    }));

    const enrolledCoursesData = (enrollments || []).map((e: any) => ({
      course_id: e.course_id,
      progress_percentage: e.progress_percentage,
      completed_at: e.completed_at,
    }));

    // Calculate matches
    const jobsWithScores: JobWithScore[] = jobs.map((job: any) => {
      const matchResult = calculateJobMatch(
        {
          id: job.id,
          skills: job.skills || [],
          recommended_for_courses: job.recommended_for_courses || [],
          experience_level: job.experience_level,
        },
        studentProfileData,
        enrolledCoursesData,
        portfolioProjectsData
      );

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        matchingScore: matchResult.score0to100,
        status: matchResult.status,
        skills: job.skills || [],
        skillsMissing: matchResult.missingSkills,
      };
    });

    // Sort and return top matches
    return jobsWithScores
      .sort((a: JobWithScore, b: JobWithScore) => b.matchingScore - a.matchingScore)
      .slice(0, limit);
  } catch (error) {
    safeLogger.error('Error fetching matching jobs', error);
    return [];
  }
}

/**
 * Fetch portfolio projects for student
 */
async function fetchPortfolioProjects(
  supabase: any,
  studentProfileId: string | null,
  limit: number = 5
): Promise<any[]> {
  if (!studentProfileId) return [];

  try {
    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('id, title, description, tech_stack, github_url, demo_url, visibility')
      .eq('student_profile_id', studentProfileId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return projects || [];
  } catch (error) {
    safeLogger.error('Error fetching portfolio projects', error);
    return [];
  }
}

/**
 * Build conversation messages for LLM with RAG context
 * Returns messages and retrieved chunks metadata
 */
async function buildLLMMessages(
  message: string,
  context: ChatRequest['context'],
  conversationHistory: ChatRequest['conversationHistory'],
  contextData?: {
    courseData: any;
    projectData: any;
    jobData: any;
    userProfile: any;
    activeContextIds: { courseId: string | null; projectId: string | null; jobId: string | null };
  },
  intent?: AdvisorIntent,
  tools?: { useRAG: boolean; useJobsMatching: boolean; usePortfolioFetch: boolean; useCourseContext: boolean },
  supabase?: any,
  studentProfileId?: string | null
): Promise<{
  messages: LLMMessage[];
  retrievedChunks: Array<{ courseSlug: string; lessonSlug: string; chunkIndex: number; score?: number }>;
}> {
  let systemPrompt = buildSystemPrompt(context, contextData, intent, tools);
  const retrievedChunks: Array<{ courseSlug: string; lessonSlug: string; chunkIndex: number; score?: number }> = [];

  // Retrieve relevant course chunks using RAG based on intent and tools
  const activeCourseId = contextData?.activeContextIds?.courseId || context?.course?.id;
  const courseSlug = context?.course?.slug || contextData?.courseData?.slug;

  // Use RAG if tools indicate it should be used
  const shouldRetrieveChunks = tools?.useRAG && (
    activeCourseId ||
    courseSlug ||
    message.toLowerCase().includes('course') ||
    message.toLowerCase().includes('lesson') ||
    message.toLowerCase().includes('module') ||
    message.toLowerCase().includes('explain') ||
    message.toLowerCase().includes('how') ||
    message.toLowerCase().includes('what') ||
    message.toLowerCase().includes('understand')
  );

  if (shouldRetrieveChunks) {
    try {
      const chunks = await retrieveChunks(message, {
        limit: 5,
        courseSlug: courseSlug || undefined,
        minScore: 0.5,
      });

      if (chunks.length > 0) {
        const ragContext = formatChunksForContext(chunks);
        systemPrompt += `\n\n**Relevant Course Content (use this to answer questions accurately):**${ragContext}`;
        systemPrompt += `\n**Instructions:** 
- Use the relevant course content above to provide accurate, specific answers
- When referencing content, cite the source using [ref:N] format where N is the chunk number
- Reference specific modules, lessons, or concepts when relevant
- If the content doesn't fully answer the question, say so and provide what you can based on the content
- Always include citations in your response when using information from the course content`;

        // Store chunk metadata for later
        retrievedChunks.push(
          ...chunks.map((chunk) => ({
            courseSlug: chunk.courseSlug,
            lessonSlug: chunk.lessonSlug,
            chunkIndex: chunk.chunkIndex,
            score: chunk.score,
          }))
        );
      }
    } catch (error) {
      safeLogger.warn('RAG retrieval failed, continuing without course content', error);
      // Continue without RAG context if retrieval fails
    }
  }

  // Fetch matching jobs if intent requires it (use new tool function)
  if (tools?.useJobsMatching && supabase && studentProfileId) {
    try {
      // Use the new getTopJobMatches tool function which includes explanations
      const matchingJobs = await getTopJobMatches(supabase, studentProfileId, 5);
      if (matchingJobs.length > 0) {
        const jobsContext = formatJobMatchesForLLM(matchingJobs);

        systemPrompt += `\n\n**Top Matching Job Opportunities:**\n${jobsContext}\n\n`;
        
        // Add specific instructions based on intent
        if (intent === 'job_matching') {
          systemPrompt += `**Instructions for Job Matching:**
- Summarize the top ${matchingJobs.length} job opportunities that best match the student's profile
- Highlight why each role is a good fit based on the match explanation
- Mention any missing skills that could improve their match score
- Suggest specific courses or projects that could help them qualify for these roles
- Be encouraging and actionable in your recommendations
- Format your response clearly with job titles, companies, and key details`;
        } else {
          systemPrompt += `**Instructions:** Use this job matching information to provide relevant job recommendations and career guidance when appropriate.`;
        }
      }
    } catch (error) {
      safeLogger.warn('Jobs matching fetch failed', error);
    }
  }

  // Fetch portfolio projects if intent requires it
  if (tools?.usePortfolioFetch && supabase && studentProfileId) {
    try {
      const portfolioProjects = await fetchPortfolioProjects(supabase, studentProfileId, 5);
      if (portfolioProjects.length > 0) {
        const portfolioContext = portfolioProjects
          .map((project, idx) => {
            return `[${idx + 1}] ${project.title}
${project.description ? `- Description: ${project.description.substring(0, 200)}${project.description.length > 200 ? '...' : ''}` : ''}
${project.tech_stack && project.tech_stack.length > 0 ? `- Tech Stack: ${project.tech_stack.join(', ')}` : ''}
${project.github_url ? `- GitHub: ${project.github_url}` : ''}
${project.demo_url ? `- Demo: ${project.demo_url}` : ''}`;
          })
          .join('\n\n');

        systemPrompt += `\n\n**Student Portfolio Projects:**\n${portfolioContext}\n\n`;
        systemPrompt += `**Instructions:** Use this portfolio information to provide project-specific feedback, CV/resume content, or job application guidance.`;
      }
    } catch (error) {
      safeLogger.warn('Portfolio fetch failed', error);
    }
  }

  const messages: LLMMessage[] = [{ role: 'system', content: systemPrompt }];

  // Add conversation history (last 10 messages)
  for (const msg of conversationHistory.slice(-10)) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }
  }

  // Add current message
  messages.push({ role: 'user', content: message });

  return { messages, retrievedChunks };
}

// Check for sensitive information
function containsSensitiveInfo(message: string): boolean {
  const sensitivePatterns = [
    /password\s*[:=]\s*\S+/i,
    /api[_-]?key\s*[:=]\s*\S+/i,
    /secret\s*[:=]\s*\S+/i,
    /token\s*[:=]\s*\S+/i,
    /credential\s*[:=]\s*\S+/i,
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(message));
}

/**
 * Get mock chat response for UAT testing
 * Returns deterministic responses based on message content and context
 */
function getMockChatResponse(
  message: string,
  context?: ChatRequest['context'],
  intent?: string
): string {
  const lowerMessage = message.toLowerCase();
  
  // Context-aware responses
  if (context?.course) {
    return `I can help you with **${context.course.title}**. Based on your question "${message}", here's a helpful response:\n\nThis is a mock response for UAT testing. In production, I would provide detailed course-specific guidance about ${context.course.title}.`;
  }
  
  if (context?.project) {
    return `I can help you with your project **${context.project.title}**. Based on your question "${message}", here's a helpful response:\n\nThis is a mock response for UAT testing. In production, I would provide detailed project-specific feedback about ${context.project.title}.`;
  }
  
  if (context?.job) {
    return `I can help you with the job application for **${context.job.title} at ${context.job.company}**. Based on your question "${message}", here's a helpful response:\n\nThis is a mock response for UAT testing. In production, I would provide detailed job application guidance.`;
  }
  
  // Intent-based responses
  if (intent === 'learning_help' || lowerMessage.includes('explain') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
    return `This is a mock learning help response for UAT testing. In production, I would provide detailed explanations and learning guidance based on your question: "${message}".`;
  }
  
  if (intent === 'project_review' || lowerMessage.includes('project') || lowerMessage.includes('review')) {
    return `This is a mock project review response for UAT testing. In production, I would provide detailed project feedback and suggestions based on your question: "${message}".`;
  }
  
  if (intent === 'job_matching' || lowerMessage.includes('job') || lowerMessage.includes('career')) {
    return `This is a mock job matching response for UAT testing. In production, I would provide detailed job recommendations and career guidance based on your question: "${message}".`;
  }
  
  // Default mock response
  return `This is a mock AI advisor response for UAT testing. Your message was: "${message}". In production, I would provide a helpful, context-aware response based on your question and current context.`;
}

export async function POST(request: NextRequest) {
  // Generate requestId for observability
  // In mock mode, use deterministic request ID for testing
  const isMockMode = process.env.UAT_MOCK_AI === '1';
  const requestId = isMockMode 
    ? 'mock-req-chat-12345' 
    : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Structured logging: unauthorized request
      safeLogger.warn('[ChatAPI] Unauthorized request', { 
        requestId, 
        userId: null,
        statusCode: 401,
        errorCode: 'UNAUTHORIZED',
        path: '/api/ai-advisor/chat',
        method: 'POST',
      });
      return NextResponse.json(
        { 
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Session expired — please sign in again.', requestId } 
        },
        { status: 401 }
      );
    }

    const body: ChatRequest = await request.json();
    let { message, context, studentProfileId, conversationHistory, intent, conversationId } = body;

    if (!message || !message.trim()) {
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/ai-advisor/chat',
        method: 'POST',
        status: 400,
        duration,
        errorMessage: 'Message is required',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { 
          ok: false,
          error: { code: 'BAD_REQUEST', message: 'Message is required', requestId } 
        },
        { status: 400 }
      );
    }

    // Log request details
      // Structured logging: request received
      safeLogger.info('[ChatAPI] Request received', {
        requestId,
        userId: user.id,
        path: '/api/ai-advisor/chat',
        method: 'POST',
        hasContext: !!context,
        hasConversationHistory: conversationHistory?.length > 0,
        intent: intent || 'general',
        messageLength: message.length,
        activeCourseId: context?.course?.id || null,
        activeProjectId: context?.project?.id || null,
        activeJobId: context?.job?.id || null,
      });

    // Check for sensitive information
    if (containsSensitiveInfo(message)) {
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/ai-advisor/chat',
        method: 'POST',
        status: 200,
        duration,
        errorMessage: 'Sensitive information detected',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json({
        ok: true,
        response: `⚠️ **Security Warning:** I noticed you may have shared sensitive information (like passwords or API keys). Please redact any secrets before continuing. I can still help you, but make sure to remove any credentials from your message.\n\n**Next Steps:**\n1. Remove any passwords, API keys, or secrets from your question\n2. Rephrase your question without sensitive data\n3. If you need help with authentication, describe the problem without sharing actual credentials`,
        requestId,
      });
    }

    // UAT Mock Mode: Return deterministic canned responses for testing
    if (isMockMode) {
      const mockResponse = getMockChatResponse(message, context, intent);
      const stream = request.headers.get('accept')?.includes('text/event-stream') || 
                     new URL(request.url).searchParams.get('stream') === 'true';
      
      if (stream) {
        // Return streaming mock response
        return new Response(
          new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              // Simulate streaming by sending chunks
              const words = mockResponse.split(' ');
              let index = 0;
              
              const sendChunk = () => {
                if (index < words.length) {
                  const chunk = words[index] + (index < words.length - 1 ? ' ' : '');
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`)
                  );
                  index++;
                  setTimeout(sendChunk, 50); // Simulate streaming delay
                } else {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ 
                      content: '', 
                      done: true, 
                      conversationId: conversationId || 'mock-conv-123',
                      requestId 
                    })}\n\n`)
                  );
                  controller.close();
                }
              };
              
              sendChunk();
            },
          }),
          {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
              'X-Request-ID': requestId,
            },
          }
        );
      } else {
        // Return non-streaming mock response
        return NextResponse.json({
          ok: true,
          response: mockResponse,
          conversationId: conversationId || 'mock-conv-123',
          requestId,
        });
      }
    }

    // Check if streaming is requested
    const stream = request.headers.get('accept')?.includes('text/event-stream') || 
                   new URL(request.url).searchParams.get('stream') === 'true';

    // Load active context from database (needed for intent classification and later)
    // Make this non-blocking - if it fails, continue with null context
    let activeContext: { activeCourseId: string | null; activeProjectId: string | null; activeJobId: string | null } = {
      activeCourseId: null,
      activeProjectId: null,
      activeJobId: null,
    };
    try {
      activeContext = await loadActiveContext(supabase, studentProfileId);
    } catch (error) {
      safeLogger.warn('AI Advisor: Failed to load active context, continuing without it', { requestId, error });
    }

    // Fetch context data (needed for intent classification and later)
    // Make this non-blocking - if it fails, continue with minimal context
    let contextData: {
      courseData: any;
      projectData: any;
      jobData: any;
      userProfile: any;
      activeContextIds: { courseId: string | null; projectId: string | null; jobId: string | null };
    } = {
      courseData: null,
      projectData: null,
      jobData: null,
      userProfile: null,
      activeContextIds: {
        courseId: context?.course?.id || null,
        projectId: context?.project?.id || null,
        jobId: context?.job?.id || null,
      },
    };
    try {
      contextData = await fetchContextData(context, supabase, studentProfileId, activeContext);
    } catch (error) {
      safeLogger.warn('AI Advisor: Failed to fetch context data, continuing with minimal context', { requestId, error });
      // Use fallback context from request
      contextData.activeContextIds = {
        courseId: context?.course?.id || null,
        projectId: context?.project?.id || null,
        jobId: context?.job?.id || null,
      };
    }

    // Classify intent if not provided
    // Make this non-blocking - if it fails, use 'general' intent
    let inferredIntent: AdvisorIntent | undefined = intent as AdvisorIntent | undefined;
    let intentClassification: IntentClassification | undefined;
    
    if (!inferredIntent) {
      try {
        // Build context for intent classification
        const intentContext = {
          course: contextData.courseData ? {
            id: contextData.courseData.id,
            slug: contextData.courseData.slug,
            title: contextData.courseData.title,
          } : undefined,
          project: contextData.projectData ? {
            id: contextData.projectData.id,
            title: contextData.projectData.title,
          } : undefined,
          job: contextData.jobData ? {
            id: contextData.jobData.id,
            title: contextData.jobData.title,
            company: contextData.jobData.company,
          } : undefined,
        };

        intentClassification = await classifyIntent(message, intentContext);
        inferredIntent = intentClassification.intent;
      } catch (error) {
        safeLogger.warn('AI Advisor: Intent classification failed, using general intent', { requestId, error });
        inferredIntent = 'general';
        intentClassification = { intent: 'general', confidence: 0.5 };
      }
    }

    // Get tools to use based on inferred intent
    const tools = getToolsForIntent(inferredIntent || 'general');

    // Generate UUID if not provided
      let convId = conversationId;
      if (!convId) {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        convId = uuid;
      }
      
    // Store user message in database with inferred intent
    if (studentProfileId) {
      await supabase.from('advisor_conversations').insert({
        student_profile_id: studentProfileId,
        conversation_id: convId,
        active_course_id: contextData.activeContextIds.courseId,
        active_project_id: contextData.activeContextIds.projectId,
        active_job_id: contextData.activeContextIds.jobId,
        role: 'user',
        content: message,
        metadata: {
          intent: inferredIntent,
          intentConfidence: intentClassification?.confidence,
          intentReasoning: intentClassification?.reasoning,
          tools: tools,
        },
      });
    }

    // Build LLM messages (with RAG context if applicable, based on intent)
    const { messages: llmMessages, retrievedChunks } = await buildLLMMessages(
      message,
      context,
      conversationHistory,
      contextData,
      inferredIntent,
      tools,
      supabase,
      studentProfileId
    );

    // Handle streaming response
    if (stream) {
      return new Response(
        new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            let fullResponse = '';
            const STREAM_TIMEOUT_MS = 60000; // 60 seconds
            let streamTimeout: NodeJS.Timeout | null = null;
            let streamCompleted = false;

            // Set timeout to prevent hanging
            const timeoutPromise = new Promise<void>((resolve) => {
              streamTimeout = setTimeout(() => {
                if (!streamCompleted) {
                  safeLogger.error('AI Advisor: Stream timeout', { requestId, elapsed: Date.now() - startTime });
                  try {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ 
                        ok: false,
                        error: { 
                          code: 'TIMEOUT', 
                          message: 'Response took too long. Please try again.',
                          requestId 
                        },
                        done: true 
                      })}\n\n`)
                    );
                    controller.close();
                  } catch (e) {
                    // Stream may already be closed
                  }
                  streamCompleted = true;
                  resolve();
                }
              }, STREAM_TIMEOUT_MS);
            });

            try {
              // Check if LLM provider is configured
              let llm;
              try {
                llm = getLLMProvider();
              } catch (llmError: any) {
                const errorMessage = llmError.message || 'LLM provider not configured';
                
                // Determine appropriate error code
                let errorCode = 'UPSTREAM_ERROR';
                if (errorMessage.includes('LLM_API_KEY') || errorMessage.includes('required')) {
                  errorCode = 'SERVICE_UNAVAILABLE';
                } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                  errorCode = 'UNAUTHORIZED';
                } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
                  errorCode = 'RATE_LIMIT_EXCEEDED';
                }
                
                safeLogger.error('AI Advisor: LLM provider error', { 
                  requestId,
                  userId: user.id,
                  route: '/api/ai-advisor/chat',
                  model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                  error: errorMessage,
                  stack: llmError.stack,
                });
                
                // Send error to client
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ 
                    ok: false,
                    error: { 
                      code: errorCode, 
                      message: process.env.NODE_ENV === 'development'
                        ? errorMessage
                        : (errorMessage.includes('LLM_API_KEY') 
                            ? 'AI service is not configured. Please contact support.'
                            : 'AI service error. Please try again.'),
                      requestId 
                    },
                    done: true 
                  })}\n\n`)
                );
                controller.close();
                if (streamTimeout) clearTimeout(streamTimeout);
                return;
              }
              
              const llmStartTime = Date.now();
              
              // Stream response chunks with timeout
              const streamPromise = (async () => {
                for await (const chunk of llm.generateStream(llmMessages, {
                  temperature: 0.7,
                  maxTokens: 2000,
                })) {
                  if (streamCompleted) break;
                  
                  if (chunk.content) {
                    fullResponse += chunk.content;
                    // Send chunk to client
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content: chunk.content, done: false })}\n\n`)
                    );
                  }

                  if (chunk.done) {
                    const llmLatency = Date.now() - llmStartTime;
                    safeLogger.info('AI Advisor: Stream completed', { 
                      requestId, 
                      llmLatency,
                      responseLength: fullResponse.length 
                    });

                    // Guard: Ensure response is not empty
                    if (!fullResponse || !fullResponse.trim()) {
                      safeLogger.error('AI Advisor: Empty completion from LLM', { requestId });
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ 
                          ok: false,
                          error: { 
                            code: 'EMPTY_COMPLETION', 
                            message: 'AI returned an empty response. Please try again.',
                            requestId 
                          },
                          done: true 
                        })}\n\n`)
                      );
                      controller.close();
                      streamCompleted = true;
                      if (streamTimeout) clearTimeout(streamTimeout);
                      return;
                    }

                    // Add citations to response if chunks were retrieved and not already present
                    let finalResponse = fullResponse;
                    if (retrievedChunks.length > 0) {
                      if (!finalResponse.includes('## Citations') && !finalResponse.includes('**Citations**')) {
                        const citations = retrievedChunks.map((c, idx) => ({
                          ref: idx + 1,
                          courseSlug: c.courseSlug,
                          lessonSlug: c.lessonSlug,
                          chunkIndex: c.chunkIndex,
                          score: c.score,
                        }));

                        const citationsText = citations
                          .map((c) => `[${c.ref}] ${c.courseSlug}/${c.lessonSlug}`)
                          .join('\n');
                        finalResponse += `\n\n---\n\n**Citations:**\n${citationsText}`;

                        // Send citations as final chunk
                        controller.enqueue(
                          encoder.encode(`data: ${JSON.stringify({ content: `\n\n---\n\n**Citations:**\n${citationsText}`, done: false })}\n\n`)
                        );
                      }
                    }

                    // Generate next actions based on intent and context
                    let nextActions: NextAction[] = [];
                    try {
                      // Get job data if available for unlock plan generation
                      let jobDataForUnlockPlan: { id: string; skills_missing?: string[]; recommended_for_courses?: string[] } | undefined;
                      if (contextData.jobData) {
                        jobDataForUnlockPlan = {
                          id: contextData.jobData.id,
                          skills_missing: contextData.jobData.skillsMissing,
                          recommended_for_courses: contextData.jobData.recommendedForCourses,
                        };
                      }

                      nextActions = await generateNextActions(
                        inferredIntent,
                        context,
                        finalResponse,
                        jobDataForUnlockPlan
                      );
                    } catch (error) {
                      safeLogger.warn('AI Advisor: Error generating next actions', { requestId, error });
                      // Continue without next actions if generation fails
                    }

                    // Store complete response in database with RAG metadata and next actions
                    if (studentProfileId) {
                      try {
                        // Generate citations for chunks
                        const citations = retrievedChunks.map((c, idx) => ({
                          ref: idx + 1,
                          courseSlug: c.courseSlug,
                          lessonSlug: c.lessonSlug,
                          chunkIndex: c.chunkIndex,
                          score: c.score,
                        }));

                        await supabase.from('advisor_conversations').insert({
                          student_profile_id: studentProfileId,
                          conversation_id: convId,
                          active_course_id: contextData.activeContextIds.courseId,
                          active_project_id: contextData.activeContextIds.projectId,
                          active_job_id: contextData.activeContextIds.jobId,
                          role: 'assistant',
                          content: finalResponse,
                          metadata: {
                            intent: inferredIntent,
                            intentConfidence: intentClassification?.confidence,
                            intentReasoning: intentClassification?.reasoning,
                            tools: tools,
                            ragChunks: retrievedChunks.length > 0 ? retrievedChunks : undefined,
                            citations: citations.length > 0 ? citations : undefined,
                            next_actions: nextActions.length > 0 ? nextActions : undefined,
                            requestId,
                          },
                        });
                      } catch (dbError) {
                        safeLogger.warn('AI Advisor: Failed to store response in database', { requestId, error: dbError });
                        // Continue even if DB write fails
                      }
                    }

                    // Send final chunk with next actions
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ 
                        content: '', 
                        done: true, 
                        conversationId: convId, 
                        nextActions: nextActions.length > 0 ? nextActions : undefined,
                        requestId 
                      })}\n\n`)
                    );
                    controller.close();
                    streamCompleted = true;
                    if (streamTimeout) clearTimeout(streamTimeout);
                  }
                }
              })();

              // Race between stream and timeout
              await Promise.race([streamPromise, timeoutPromise]);
            } catch (error: any) {
              const elapsed = Date.now() - startTime;
              const errorMessage = error?.message || String(error);
              
              // Determine appropriate error code
              let errorCode = 'UPSTREAM_ERROR';
              if (errorMessage.includes('API key') || errorMessage.includes('LLM_API_KEY') || errorMessage.includes('required')) {
                errorCode = 'SERVICE_UNAVAILABLE';
              } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                errorCode = 'UNAUTHORIZED';
              } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
                errorCode = 'RATE_LIMIT_EXCEEDED';
              } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
                errorCode = 'TIMEOUT';
              }
              
              // Extract upstream status if available
              const upstreamStatusMatch = errorMessage.match(/(\d{3})/);
              const upstreamStatus = upstreamStatusMatch ? parseInt(upstreamStatusMatch[1]) : null;
              
              safeLogger.error('AI Advisor: Error in streaming LLM response', { 
                requestId,
                userId: user.id,
                route: '/api/ai-advisor/chat',
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                upstreamStatus,
                error: errorMessage,
                stack: error?.stack,
                elapsed 
              });
              
              try {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ 
                    ok: false,
                    error: { 
                      code: errorCode, 
                      message: process.env.NODE_ENV === 'development'
                        ? errorMessage
                        : (errorMessage.includes('API key') || errorMessage.includes('LLM_API_KEY')
                            ? 'AI service is not configured. Please contact support.'
                            : 'Failed to generate response. Please try again.'),
                      requestId 
                    },
                    done: true 
                  })}\n\n`)
                );
                controller.close();
              } catch (e) {
                // Stream may already be closed
              }
              streamCompleted = true;
              if (streamTimeout) clearTimeout(streamTimeout);
            }
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-Request-ID': requestId,
          },
        }
      );
    }

    // Non-streaming response
    try {
      let llm;
      try {
        llm = getLLMProvider();
      } catch (llmError: any) {
        const errorMessage = llmError.message || 'LLM provider not configured';
        safeLogger.error('AI Advisor: LLM provider error', { 
          requestId, 
          userId: user.id,
          error: llmError.message,
          stack: llmError.stack,
          route: '/api/ai-advisor/chat',
          model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        });
        
        // Determine appropriate status code
        let statusCode = 500;
        let errorCode = 'UPSTREAM_ERROR';
        
        if (errorMessage.includes('LLM_API_KEY') || errorMessage.includes('required')) {
          statusCode = 503; // Service Unavailable
          errorCode = 'SERVICE_UNAVAILABLE';
        } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          statusCode = 401;
          errorCode = 'UNAUTHORIZED';
        } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
          statusCode = 429;
          errorCode = 'RATE_LIMIT_EXCEEDED';
        } else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
          statusCode = 400;
          errorCode = 'BAD_REQUEST';
        }
        
        return NextResponse.json(
          { 
            ok: false,
            error: { 
              code: errorCode, 
              message: process.env.NODE_ENV === 'development' 
                ? errorMessage
                : (errorMessage.includes('LLM_API_KEY') 
                    ? 'AI service is not configured. Please contact support.'
                    : 'AI service error. Please try again.'),
              requestId 
            } 
          },
          { status: statusCode }
        );
      }

      const llmStartTime = Date.now();
      const llmResponse = await llm.generate(llmMessages, {
        temperature: 0.7,
        maxTokens: 2000,
      });
      const llmLatency = Date.now() - llmStartTime;

      safeLogger.info('AI Advisor: Response generated', { 
        requestId, 
        llmLatency,
        responseLength: llmResponse.content.length 
      });

      // Guard: Ensure response is not empty
      if (!llmResponse.content || !llmResponse.content.trim()) {
        safeLogger.error('AI Advisor: Empty completion from LLM', { requestId });
        return NextResponse.json(
          { 
            ok: false,
            error: { 
              code: 'EMPTY_COMPLETION', 
              message: 'AI returned an empty response. Please try again.',
              requestId 
            } 
          },
          { status: 500 }
        );
      }

      // Add citations to response if chunks were retrieved
      let responseContent = llmResponse.content;
      if (retrievedChunks.length > 0) {
        // Generate citation references
        const citations = retrievedChunks.map((c, idx) => ({
          ref: idx + 1,
          courseSlug: c.courseSlug,
          lessonSlug: c.lessonSlug,
          title: undefined, // Title not available in this context
        }));

        // Append citations section if not already present
        if (!responseContent.includes('## Citations') && !responseContent.includes('**Citations**')) {
          const citationsText = citations
            .map((c) => `[${c.ref}] ${c.courseSlug}/${c.lessonSlug}${c.title ? ` - ${c.title}` : ''}`)
            .join('\n');
          responseContent += `\n\n---\n\n**Citations:**\n${citationsText}`;
        }
      }

      // Generate next actions based on intent and context
      let nextActions: NextAction[] = [];
      try {
        // Get job data if available for unlock plan generation
        let jobDataForUnlockPlan: { id: string; skills_missing?: string[]; recommended_for_courses?: string[] } | undefined;
        if (contextData.jobData) {
          jobDataForUnlockPlan = {
            id: contextData.jobData.id,
            skills_missing: contextData.jobData.skillsMissing,
            recommended_for_courses: contextData.jobData.recommendedForCourses,
          };
        }

        nextActions = await generateNextActions(
          inferredIntent,
          context,
          responseContent,
          jobDataForUnlockPlan
        );
      } catch (error) {
        safeLogger.warn('AI Advisor: Error generating next actions', { requestId, error });
        // Continue without next actions if generation fails
      }

      // Store assistant response in database with RAG metadata and next actions
      if (studentProfileId) {
        try {
          const citations = retrievedChunks.map((c, idx) => ({
            ref: idx + 1,
            courseSlug: c.courseSlug,
            lessonSlug: c.lessonSlug,
            chunkIndex: c.chunkIndex,
            score: c.score,
          }));

          await supabase.from('advisor_conversations').insert({
            student_profile_id: studentProfileId,
            conversation_id: convId,
            active_course_id: contextData.activeContextIds.courseId,
            active_project_id: contextData.activeContextIds.projectId,
            active_job_id: contextData.activeContextIds.jobId,
            role: 'assistant',
            content: responseContent,
            metadata: {
              intent: inferredIntent,
              intentConfidence: intentClassification?.confidence,
              intentReasoning: intentClassification?.reasoning,
              tools: tools,
              ragChunks: retrievedChunks.length > 0 ? retrievedChunks : undefined,
              citations: citations.length > 0 ? citations : undefined,
              next_actions: nextActions.length > 0 ? nextActions : undefined,
              requestId,
            },
          });
        } catch (dbError) {
          safeLogger.warn('AI Advisor: Failed to store response in database', { requestId, error: dbError });
          // Continue even if DB write fails
        }
      }

      const totalLatency = Date.now() - startTime;
      // Structured logging: request completed successfully
      safeLogger.info('[ChatAPI] Request completed', { 
        requestId, 
        userId: user.id,
        statusCode: 200,
        totalLatency,
        path: '/api/ai-advisor/chat',
        method: 'POST',
        conversationId: convId,
      });

      // Log successful request
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/ai-advisor/chat',
        method: 'POST',
        status: 200,
        duration: totalLatency,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });

      return NextResponse.json({
        ok: true,
        response: responseContent,
        conversationId: convId,
        nextActions: nextActions.length > 0 ? nextActions : undefined,
        requestId,
      });
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      const errorMessage = error?.message || String(error);
      
      // Determine appropriate status code and error code
      let statusCode = 500;
      let errorCode = 'UPSTREAM_ERROR';
      
      if (errorMessage.includes('API key') || errorMessage.includes('LLM_API_KEY') || errorMessage.includes('required')) {
        statusCode = 503; // Service Unavailable
        errorCode = 'SERVICE_UNAVAILABLE';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        statusCode = 401;
        errorCode = 'UNAUTHORIZED';
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        statusCode = 429;
        errorCode = 'RATE_LIMIT_EXCEEDED';
      } else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        statusCode = 400;
        errorCode = 'BAD_REQUEST';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
        statusCode = 504; // Gateway Timeout
        errorCode = 'TIMEOUT';
      }
      
      // Extract upstream status if available
      const upstreamStatusMatch = errorMessage.match(/(\d{3})/);
      const upstreamStatus = upstreamStatusMatch ? parseInt(upstreamStatusMatch[1]) : null;
      
      // Structured logging: error with status code and error reason
      safeLogger.error('[ChatAPI] Error generating LLM response', { 
        requestId,
        userId: user.id,
        statusCode,
        errorCode,
        path: '/api/ai-advisor/chat',
        method: 'POST',
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        upstreamStatus,
        errorMessage: errorMessage, // Error reason without leaking keys
        elapsed,
        // Don't log stack in production to avoid leaking sensitive info
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
      
      // Log error request
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/ai-advisor/chat',
        method: 'POST',
        status: statusCode,
        duration: elapsed,
        errorStack: error?.stack || null,
        errorMessage: errorMessage,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: errorCode, 
            message: process.env.NODE_ENV === 'development'
              ? errorMessage
              : (errorMessage.includes('API key') || errorMessage.includes('LLM_API_KEY')
                  ? 'AI service is not configured. Please contact support.'
                  : 'Failed to generate response. Please try again.'),
            requestId 
          } 
        },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    // Structured logging: top-level error handler
    safeLogger.error('[ChatAPI] Error in chat handler', { 
      requestId, 
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      path: '/api/ai-advisor/chat',
      method: 'POST',
      errorMessage: error?.message || String(error),
      elapsed,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });

    // Log error request
    await logRequest({
      requestId,
      userId: await getUserIdFromRequest(request),
      path: '/api/ai-advisor/chat',
      method: 'POST',
      status: 500,
      duration: elapsed,
      errorStack: error?.stack || null,
      errorMessage: error?.message || 'Failed to process request',
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(
      { 
        ok: false,
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to process request. Please try again.',
          requestId 
        } 
      },
      { status: 500 }
    );
  }
}
