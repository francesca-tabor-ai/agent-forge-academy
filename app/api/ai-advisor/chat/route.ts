import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

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

// Fetch real data for context
async function fetchContextData(
  context: ChatRequest['context'],
  supabase: any
): Promise<{
  courseData: any;
  projectData: any;
  jobData: any;
  userProfile: any;
}> {
  const courseData = context?.course?.id
    ? await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/courses/${context.course.id}`)
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null)
    : null;

  const projectData = context?.project?.id
    ? await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects/${context.project.id}`)
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null)
    : null;

  const jobData = context?.job?.id
    ? await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/jobs/${context.job.id}`)
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null)
    : null;

  // Get user profile summary
  let userProfile = null;
  if (context?.project?.id) {
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('student_profile_id')
      .eq('id', context.project.id)
      .single();
    
    if (project) {
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('headline, bio, skills')
        .eq('id', project.student_profile_id)
        .single();
      
      if (studentProfile) {
        const { count: projectCount } = await supabase
          .from('portfolio_projects')
          .select('*', { count: 'exact', head: true })
          .eq('student_profile_id', project.student_profile_id)
          .eq('visibility', 'public');
        
        userProfile = {
          headline: studentProfile.headline,
          hasBio: !!studentProfile.bio,
          skills: studentProfile.skills || [],
          publicProjectsCount: projectCount || 0,
        };
      }
    }
  }

  return { courseData, projectData, jobData, userProfile };
}

// Mock AI advisor response generator
// In production, this would call an actual LLM API (OpenAI, Anthropic, etc.)
async function generateAIResponse(
  message: string,
  context: ChatRequest['context'],
  conversationHistory: ChatRequest['conversationHistory'],
  intent?: string,
  contextData?: { courseData: any; projectData: any; jobData: any; userProfile: any }
): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // Context-aware responses with real data
  let response = '';
  let nextSteps: string[] = [];

  // Handle structured intents from quick actions
  if (intent === 'architecture_review' && contextData?.projectData) {
    const project = contextData.projectData;
    response = `## Architecture Review: ${project.title}\n\n`;
    response += `### Strengths\n`;
    response += `- Your project uses a solid tech stack: ${(project.techStack || []).join(', ') || 'modern technologies'}\n`;
    if (project.githubUrl) {
      response += `- Good practice: GitHub repository is available\n`;
    }
    if (project.demoUrl) {
      response += `- Excellent: Live demo available for recruiters\n`;
    }
    response += `\n### Risks & Missing Pieces\n`;
    if (!project.githubUrl) {
      response += `- ⚠️ **Missing GitHub URL**: Recruiters expect to see your code\n`;
    }
    if (!project.demoUrl) {
      response += `- ⚠️ **Missing Demo URL**: A live demo significantly increases visibility\n`;
    }
    if (!project.description || project.description.length < 100) {
      response += `- ⚠️ **Description too brief**: Expand to explain architecture, challenges, and outcomes\n`;
    }
    response += `- Consider adding: Security considerations, observability/monitoring, testing strategy\n`;
    response += `\n### Next Steps Checklist\n`;
    response += `1. Add comprehensive project description\n`;
    if (!project.githubUrl) response += `2. Link your GitHub repository\n`;
    if (!project.demoUrl) response += `3. Deploy and link a live demo\n`;
    response += `4. Document your architecture decisions\n`;
    response += `5. Add screenshots/images to showcase the project\n`;
    return response;
  }

  if (intent === 'risks_and_improvements' && contextData?.projectData) {
    const project = contextData.projectData;
    response = `## Risks & Improvements: ${project.title}\n\n`;
    response += `### Top 5 Risks\n\n`;
    response += `1. **Low Visibility** (High)\n`;
    response += `   - Missing GitHub/demo links reduce recruiter engagement\n`;
    response += `   - Mitigation: Add both links and ensure they're working\n\n`;
    response += `2. **Incomplete Description** (Medium)\n`;
    response += `   - Brief descriptions don't showcase your skills\n`;
    response += `   - Mitigation: Expand to 200+ words with technical details\n\n`;
    response += `3. **No Visual Proof** (Medium)\n`;
    response += `   - Missing images make it hard to understand the project\n`;
    response += `   - Mitigation: Add cover image and project screenshots\n\n`;
    response += `4. **Tech Stack Not Highlighted** (Low)\n`;
    response += `   - Skills aren't clearly visible\n`;
    response += `   - Mitigation: List technologies used in description\n\n`;
    response += `5. **No Metrics/Outcomes** (Low)\n`;
    response += `   - Missing quantifiable results\n`;
    response += `   - Mitigation: Add performance metrics, user stats, etc.\n\n`;
    response += `### Suggested Refactors\n`;
    response += `- Rewrite description to lead with impact\n`;
    response += `- Add a "What I Learned" section\n`;
    response += `- Include challenges faced and how you solved them\n`;
    return response;
  }

  if (intent === 'rewrite_description' && contextData?.projectData) {
    const project = contextData.projectData;
    response = `## Project Description: ${project.title}\n\n`;
    response += `### Recruiter-Optimized Description\n\n`;
    response += `**${project.title}** is a ${project.techStack?.length ? project.techStack.join(', ') : 'modern'} application that ${project.description ? project.description.substring(0, 100) + '...' : 'demonstrates technical skills and problem-solving abilities'}.\n\n`;
    response += `**Key Features:**\n`;
    response += `- Built with ${(project.techStack || ['modern technologies']).join(', ')}\n`;
    if (project.githubUrl) {
      response += `- Source code available on [GitHub](${project.githubUrl})\n`;
    }
    if (project.demoUrl) {
      response += `- Live demo: [View Project](${project.demoUrl})\n`;
    }
    response += `\n**Technical Highlights:**\n`;
    response += `- Clean architecture and best practices\n`;
    response += `- Responsive design and user experience focus\n`;
    response += `- Performance optimization and scalability considerations\n\n`;
    response += `### Technical Description (Optional)\n\n`;
    response += `${project.description || 'Add detailed technical implementation details here, including architecture decisions, data flow, and key technical challenges overcome.'}\n\n`;
    response += `### TL;DR\n`;
    response += `${project.title}: A ${project.techStack?.length ? project.techStack[0] : 'full-stack'} project showcasing ${project.description ? 'real-world application' : 'technical skills'}. ${project.githubUrl ? 'Code available on GitHub.' : ''} ${project.demoUrl ? 'Live demo available.' : ''}\n`;
    return response;
  }

  // Course-related queries
  if (context?.course || lowerMessage.includes('course') || lowerMessage.includes('lesson') || lowerMessage.includes('module')) {
    const courseName = context?.course?.title || 'the course';
    const courseInfo = contextData?.courseData;
    response = `I can help you with **${courseName}**. `;
    if (courseInfo) {
      response += `This is a ${courseInfo.difficultyLevel || 'intermediate'}-level course`;
      if (courseInfo.durationWeeks) {
        response += ` spanning ${courseInfo.durationWeeks} weeks`;
      }
      response += `. `;
    }
    
    if (lowerMessage.includes('explain') || lowerMessage.includes('understand')) {
      response += `Let me break this down in simpler terms. `;
      nextSteps = [
        `Review the relevant module in ${courseName}`,
        'Try the practice exercises',
        'Ask a follow-up question if anything is unclear',
      ];
    } else if (lowerMessage.includes('quiz') || lowerMessage.includes('test')) {
      response += `Here are some key concepts to test your understanding: `;
      nextSteps = [
        'Answer the questions I provide',
        'Review the course material for any you miss',
        'Practice with real-world examples',
      ];
    } else if (lowerMessage.includes('practice') || lowerMessage.includes('task')) {
      response += `Here's a practical task to reinforce your learning: `;
      nextSteps = [
        'Complete the practice task',
        'Share your approach or results',
        'Ask for feedback on your solution',
      ];
    } else {
      response += `Based on your question, here's what I recommend: `;
      nextSteps = [
        `Focus on the core concepts in ${courseName}`,
        'Work through the examples step by step',
        'Apply what you learn to a small project',
      ];
    }
  }
  // Project-related queries
  else if (context?.project || lowerMessage.includes('project') || lowerMessage.includes('architecture') || lowerMessage.includes('code')) {
    const projectName = context?.project?.title || 'your project';
    const project = contextData?.projectData;
    response = `Let me help you with **${projectName}**. `;
    
    if (project) {
      if (project.description) {
        response += `I can see your current description: "${project.description.substring(0, 150)}${project.description.length > 150 ? '...' : ''}"\n\n`;
      }
      if (!project.githubUrl) {
        response += `⚠️ **Note**: Your project doesn't have a GitHub URL linked. Adding one will significantly improve recruiter engagement.\n\n`;
      }
      if (!project.demoUrl) {
        response += `⚠️ **Note**: Consider adding a live demo URL to showcase your work.\n\n`;
      }
    }
    
    if (lowerMessage.includes('review') || lowerMessage.includes('architecture')) {
      response += `Here's my review of your approach: `;
      if (project) {
        response += `\n\n**Current Status:**\n`;
        response += `- Title: ${project.title}\n`;
        response += `- Tech Stack: ${(project.techStack || []).join(', ') || 'Not specified'}\n`;
        response += `- GitHub: ${project.githubUrl ? '✅ Linked' : '❌ Missing'}\n`;
        response += `- Demo: ${project.demoUrl ? '✅ Linked' : '❌ Missing'}\n`;
      }
      nextSteps = [
        'Consider the feedback I provide',
        'Refactor based on best practices',
        'Test your changes thoroughly',
      ];
    } else if (lowerMessage.includes('improve') || lowerMessage.includes('risk')) {
      response += `Here are some improvements and potential risks to consider: `;
      if (project) {
        response += `\n\n**For ${project.title}:**\n`;
        if (!project.description || project.description.length < 100) {
          response += `- Expand your description to at least 200 words\n`;
        }
        if (!project.githubUrl) {
          response += `- Add your GitHub repository link\n`;
        }
        if (!project.demoUrl) {
          response += `- Deploy and link a live demo\n`;
        }
      }
      nextSteps = [
        'Prioritize the most critical improvements',
        'Address potential risks early',
        'Document your decisions',
      ];
    } else if (lowerMessage.includes('description') || lowerMessage.includes('write')) {
      response += `Here's a compelling project description: `;
      if (project && project.description) {
        response += `\n\n**Current Description:**\n${project.description}\n\n`;
        response += `**Suggested Improvement:**\n`;
      }
      nextSteps = [
        'Review and customize the description',
        'Add specific technical details',
        'Update your portfolio with this description',
      ];
    } else {
      response += `For ${projectName}, here's my guidance: `;
      nextSteps = [
        'Break down the problem into smaller parts',
        'Research best practices for similar projects',
        'Iterate and get feedback',
      ];
    }
  }
  // Career-related queries
  else if (context?.job || lowerMessage.includes('cv') || lowerMessage.includes('resume') || lowerMessage.includes('cover letter') || lowerMessage.includes('interview') || lowerMessage.includes('job')) {
    const jobTitle = context?.job?.title || 'this role';
    const company = context?.job?.company || 'the company';
    response = `I can help you with your application for ${jobTitle} at ${company}. `;
    
    if (lowerMessage.includes('cv') || lowerMessage.includes('resume') || lowerMessage.includes('tailor')) {
      response += `Here's how to tailor your CV: `;
      nextSteps = [
        'Highlight relevant skills and projects',
        'Quantify your achievements',
        'Match keywords from the job description',
      ];
    } else if (lowerMessage.includes('cover letter')) {
      response += `Here's a strong cover letter structure: `;
      nextSteps = [
        'Customize the opening to show genuine interest',
        'Connect your experience to their needs',
        'Proofread and keep it concise',
      ];
    } else if (lowerMessage.includes('interview') || lowerMessage.includes('mock')) {
      response += `Here are some mock interview questions: `;
      nextSteps = [
        'Practice answering out loud',
        'Prepare specific examples (STAR method)',
        'Research the company and role',
      ];
    } else {
      response += `For your job application, here's my advice: `;
      nextSteps = [
        'Tailor your application to the specific role',
        'Showcase relevant projects and skills',
        'Follow up professionally after applying',
      ];
    }
  }
  // General queries
  else {
    response = `I'm here to help! `;
    nextSteps = [
      'Be specific about what you need help with',
      'Share relevant context (course, project, or job)',
      'Ask follow-up questions if needed',
    ];
  }

  // Add a helpful response based on the message
  if (lowerMessage.includes('stuck') || lowerMessage.includes('help')) {
    response += `Don't worry, let's work through this together. `;
  }

  // Always end with next steps
  response += `\n\n**Next Steps:**\n${nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;

  // Add a note about escalation if needed
  if (conversationHistory.length >= 3) {
    response += `\n\n*If you're still stuck after trying these steps, I can connect you with a human advisor who can provide more personalized help.*`;
  }

  return response;
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

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, context, studentProfileId, conversationHistory } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check for sensitive information
    if (containsSensitiveInfo(message)) {
      return NextResponse.json({
        response: `⚠️ **Security Warning:** I noticed you may have shared sensitive information (like passwords or API keys). Please redact any secrets before continuing. I can still help you, but make sure to remove any credentials from your message.\n\n**Next Steps:**\n1. Remove any passwords, API keys, or secrets from your question\n2. Rephrase your question without sensitive data\n3. If you need help with authentication, describe the problem without sharing actual credentials`,
      });
    }

    // Generate AI response
    const response = generateAIResponse(message, context, conversationHistory);

    // TODO: In production, you would:
    // 1. Call an actual LLM API (OpenAI, Anthropic, etc.)
    // 2. Include conversation history for context
    // 3. Use RAG to pull in relevant course content
    // 4. Store conversation history in database
    // 5. Track metrics (response time, helpfulness, etc.)

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in AI advisor chat:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
