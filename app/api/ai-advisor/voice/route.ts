import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getLLMProvider, type LLMMessage } from '@/lib/ai/llm';
import { retrieveChunks, formatChunksForContext, generateCitations } from '@/lib/rag/retrieve';
import { classifyIntent, getToolsForIntent, type AdvisorIntent } from '@/lib/ai/intent';
import { safeLogger } from '@/lib/utils/redactPII';

// Feature flag check
function isVoiceAPIEnabled(): boolean {
  return process.env.ENABLE_VOICE_API === 'true';
}

interface VoiceRequest {
  audio: File;
  context?: {
    course?: { id: string; slug: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  };
  studentProfileId: string | null;
  conversationHistory?: Array<{
    id: string;
    role: 'user' | 'assistant' | 'human';
    content: string;
    timestamp: Date;
  }>;
  intent?: string;
  conversationId?: string;
  generateAudio?: boolean; // Whether to generate TTS audio response
}

/**
 * Transcribe audio to text using OpenAI Whisper API
 */
async function transcribeAudio(audioBlob: Blob): Promise<{ transcript: string; confidence?: number; duration?: number }> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Convert blob to File-like object for FormData
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Transcription failed: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Calculate duration if possible (approximate based on audio size)
  // Note: This is a rough estimate. For accurate duration, you'd need to decode the audio
  const duration = audioBlob.size > 0 ? Math.ceil(audioBlob.size / 16000) : undefined; // Rough estimate: ~16KB per second for webm

  return {
    transcript: data.text,
    confidence: undefined, // Whisper API doesn't return confidence scores
    duration,
  };
}

/**
 * Generate audio from text using OpenAI TTS API
 */
async function generateAudio(text: string): Promise<{ audio: Buffer; format: string } | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return null;
  }

  // Clean text for TTS (remove markdown, etc.)
  const cleanText = text
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
    .replace(/`([^`]+)`/g, '$1') // Remove code blocks
    .replace(/\n+/g, '. ') // Replace newlines with pauses
    .trim();

  if (!cleanText) {
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: cleanText,
        voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      safeLogger.error('TTS generation failed', error);
      return null;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    return {
      audio: audioBuffer,
      format: 'mp3',
    };
  } catch (error) {
    safeLogger.error('Error generating audio', error);
    return null;
  }
}

// Reuse functions from chat route
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

async function fetchContextData(
  context: VoiceRequest['context'],
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
  const courseId = activeContext?.activeCourseId || context?.course?.id;
  const projectId = activeContext?.activeProjectId || context?.project?.id;
  const jobId = activeContext?.activeJobId || context?.job?.id;

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
      };
    }
  }

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

function buildSystemPrompt(
  context: VoiceRequest['context'],
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

  if (context?.course && contextData?.courseData) {
    const course = contextData.courseData;
    systemPrompt += `\n**Current Course Context:**\n`;
    systemPrompt += `- Course: ${course.title}\n`;
    systemPrompt += `- Slug: ${course.slug}\n`;
    if (course.description) {
      systemPrompt += `- Description: ${course.description}\n`;
    }
  }

  if (context?.project && contextData?.projectData) {
    const project = contextData.projectData;
    systemPrompt += `\n**Current Project Context:**\n`;
    systemPrompt += `- Project: ${project.title}\n`;
    if (project.description) {
      systemPrompt += `- Description: ${project.description.substring(0, 300)}${project.description.length > 300 ? '...' : ''}\n`;
    }
  }

  if (context?.job && contextData?.jobData) {
    const job = contextData.jobData;
    systemPrompt += `\n**Current Job Context:**\n`;
    systemPrompt += `- Position: ${job.title} at ${job.company}\n`;
    if (job.description) {
      systemPrompt += `- Description: ${job.description.substring(0, 300)}${job.description.length > 300 ? '...' : ''}\n`;
    }
  }

  systemPrompt += `\n**Important:** Always be helpful, specific, and actionable. Use the context provided to give personalized advice.`;

  return systemPrompt;
}

async function buildLLMMessages(
  message: string,
  context: VoiceRequest['context'],
  conversationHistory: VoiceRequest['conversationHistory'] = [],
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

  const activeCourseId = contextData?.activeContextIds?.courseId || context?.course?.id;
  const courseSlug = context?.course?.slug || contextData?.courseData?.slug;

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
    }
  }

  const messages: LLMMessage[] = [{ role: 'system', content: systemPrompt }];

  for (const msg of conversationHistory.slice(-10)) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }
  }

  messages.push({ role: 'user', content: message });

  return { messages, retrievedChunks };
}

export async function POST(request: NextRequest) {
  // Check feature flag
  if (!isVoiceAPIEnabled()) {
    return NextResponse.json(
      { error: 'Voice API is not enabled' },
      { status: 403 }
    );
  }

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse FormData
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const studentProfileId = formData.get('studentProfileId') as string | null;
    const conversationId = formData.get('conversationId') as string | undefined;
    const shouldGenerateAudio = formData.get('generateAudio') === 'true';
    const intent = formData.get('intent') as string | undefined;

    // Parse context JSON if provided
    let context: VoiceRequest['context'] | undefined;
    const contextStr = formData.get('context') as string | null;
    if (contextStr) {
      try {
        context = JSON.parse(contextStr);
      } catch (e) {
        safeLogger.warn('Failed to parse context JSON', e);
      }
    }

    // Parse conversation history JSON if provided
    let conversationHistory: VoiceRequest['conversationHistory'] = [];
    const historyStr = formData.get('conversationHistory') as string | null;
    if (historyStr) {
      try {
        conversationHistory = JSON.parse(historyStr);
      } catch (e) {
        safeLogger.warn('Failed to parse conversation history JSON', e);
      }
    }

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Validate audio file
    const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Invalid audio format. Supported: webm, mp3, wav, m4a, ogg' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (audioFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Audio file size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Transcribe audio to text
    const audioBlob = await audioFile.arrayBuffer();
    const transcription = await transcribeAudio(new Blob([audioBlob], { type: audioFile.type }));

    if (!transcription.transcript || !transcription.transcript.trim()) {
      return NextResponse.json(
        { error: 'No speech detected in audio' },
        { status: 400 }
      );
    }

    // Load active context and fetch context data
    const activeContext = await loadActiveContext(supabase, studentProfileId);
    const contextData = await fetchContextData(context, supabase, studentProfileId, activeContext);

    // Classify intent if not provided
    let inferredIntent: AdvisorIntent | undefined = intent as AdvisorIntent | undefined;
    let intentClassification;
    
    if (!inferredIntent) {
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

      intentClassification = await classifyIntent(transcription.transcript, intentContext);
      inferredIntent = intentClassification.intent;
    }

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

    // Store user message with voice metadata
    if (studentProfileId) {
      await supabase.from('advisor_conversations').insert({
        student_profile_id: studentProfileId,
        conversation_id: convId,
        active_course_id: contextData.activeContextIds.courseId,
        active_project_id: contextData.activeContextIds.projectId,
        active_job_id: contextData.activeContextIds.jobId,
        role: 'user',
        content: transcription.transcript,
        metadata: {
          intent: inferredIntent,
          intentConfidence: intentClassification?.confidence,
          intentReasoning: intentClassification?.reasoning,
          tools: tools,
          voice: {
            duration: transcription.duration,
            provider: 'openai-whisper',
            confidence: transcription.confidence,
            audioFormat: audioFile.type,
            audioSize: audioFile.size,
          },
        },
      });
    }

    // Build LLM messages
    const { messages: llmMessages, retrievedChunks } = await buildLLMMessages(
      transcription.transcript,
      context,
      conversationHistory,
      contextData,
      inferredIntent,
      tools,
      supabase,
      studentProfileId
    );

    // Generate LLM response
    const llm = getLLMProvider();
    const llmResponse = await llm.generate(llmMessages, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    let responseContent = llmResponse.content;

    // Add citations if chunks were retrieved
    if (retrievedChunks.length > 0) {
      const citations = retrievedChunks.map((c, idx) => ({
        ref: idx + 1,
        courseSlug: c.courseSlug,
        lessonSlug: c.lessonSlug,
        chunkIndex: c.chunkIndex,
        score: c.score,
      }));

      if (!responseContent.includes('## Citations') && !responseContent.includes('**Citations**')) {
        const citationsText = citations
          .map((c) => `[${c.ref}] ${c.courseSlug}/${c.lessonSlug}`)
          .join('\n');
        responseContent += `\n\n---\n\n**Citations:**\n${citationsText}`;
      }
    }

    // Store assistant response
    if (studentProfileId) {
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
        },
      });
    }

    // Generate audio response if requested
    let responseAudio: string | undefined = undefined;
    if (shouldGenerateAudio) {
      const audioResult = await generateAudio(responseContent);
      if (audioResult) {
        // Convert buffer to base64 for JSON response
        // Format: data:audio/mp3;base64,<base64-encoded-audio>
        responseAudio = `data:audio/${audioResult.format};base64,${audioResult.audio.toString('base64')}`;
      }
    }

    return NextResponse.json({
      transcript: transcription.transcript,
      responseText: responseContent,
      ...(responseAudio && { responseAudio }), // Only include if generated
      conversationId: convId,
    });
  } catch (error) {
    // Note: transcription.transcript is never logged - it contains PII
    safeLogger.error('Error in voice API', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process voice request' },
      { status: 500 }
    );
  }
}
