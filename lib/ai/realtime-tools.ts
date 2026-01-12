/**
 * Tool schemas and utilities for OpenAI Realtime API
 * 
 * Defines tool schemas that can be called by the Realtime model
 * and provides utilities to format context and tools for the Realtime API
 */

export interface RealtimeTool {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Tool schemas for OpenAI Realtime API
 */
export const REALTIME_TOOLS: RealtimeTool[] = [
  {
    type: 'function',
    name: 'getLesson',
    description: 'Get lesson content from a course. Use this to fetch detailed lesson information when the user asks about course content.',
    parameters: {
      type: 'object',
      properties: {
        courseSlug: {
          type: 'string',
          description: 'The course slug (e.g., "multi-agent-systems")',
        },
        lessonSlug: {
          type: 'string',
          description: 'The lesson slug or identifier',
        },
      },
      required: ['courseSlug', 'lessonSlug'],
    },
  },
  {
    type: 'function',
    name: 'getProject',
    description: 'Get portfolio project details. Use this to fetch project information when the user asks about their projects.',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The project ID',
        },
      },
      required: ['projectId'],
    },
  },
  {
    type: 'function',
    name: 'getJobMatch',
    description: 'Get job matching information. Use this to find jobs that match the student\'s skills and provide match scores.',
    parameters: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The job ID to get match information for',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of job matches to return (default: 5)',
        },
      },
      required: ['jobId'],
    },
  },
  {
    type: 'function',
    name: 'searchLessons',
    description: 'Search for lessons by topic or keyword. Use this when the user asks about course content but doesn\'t specify a particular lesson.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query or topic',
        },
        courseSlug: {
          type: 'string',
          description: 'Optional: Limit search to a specific course',
        },
      },
      required: ['query'],
    },
  },
];

/**
 * Format context for Realtime API system/config event
 * Keep context minimal: IDs + short summaries
 */
export function formatContextForRealtime(context: {
  course?: { id: string; slug: string; title: string };
  project?: { id: string; title: string };
  job?: { id: string; title: string; company: string };
}): {
  course?: { id: string; slug: string; title: string; summary: string };
  project?: { id: string; title: string; summary: string };
  job?: { id: string; title: string; company: string; summary: string };
} {
  const formatted: any = {};

  if (context.course) {
    formatted.course = {
      id: context.course.id,
      slug: context.course.slug,
      title: context.course.title,
      summary: `Active course: ${context.course.title}`,
    };
  }

  if (context.project) {
    formatted.project = {
      id: context.project.id,
      title: context.project.title,
      summary: `Active project: ${context.project.title}`,
    };
  }

  if (context.job) {
    formatted.job = {
      id: context.job.id,
      title: context.job.title,
      company: context.job.company,
      summary: `Active job: ${context.job.title} at ${context.job.company}`,
    };
  }

  return formatted;
}

/**
 * Create system/config event for Realtime API
 */
export function createSystemConfigEvent(
  context: {
    course?: { id: string; slug: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  },
  tools: RealtimeTool[] = REALTIME_TOOLS
): any {
  const formattedContext = formatContextForRealtime(context);

  // OpenAI Realtime API session.update event format
  // Note: The actual format may vary - this is based on OpenAI's Realtime API patterns
  return {
    type: 'session.update',
    session: {
      modalities: ['text', 'audio'],
      instructions: `You are an AI advisor for an online learning platform. Help students with course explanations, project guidance, and job application support. Use the available tools to fetch detailed information when needed.

Current Context:
${formattedContext.course ? `- Course: ${formattedContext.course.title} (${formattedContext.course.slug})` : ''}
${formattedContext.project ? `- Project: ${formattedContext.project.title}` : ''}
${formattedContext.job ? `- Job: ${formattedContext.job.title} at ${formattedContext.job.company}` : ''}

Keep context minimal - use tools to fetch large content when needed.`,
      voice: 'alloy',
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription: {
        model: 'whisper-1',
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      tools: tools.map((tool) => ({
        type: tool.type,
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      })),
      tool_choice: 'auto',
      temperature: 0.7,
      max_response_output_tokens: 4096,
    },
  };
}
