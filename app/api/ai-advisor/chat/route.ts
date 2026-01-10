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
}

// Mock AI advisor response generator
// In production, this would call an actual LLM API (OpenAI, Anthropic, etc.)
function generateAIResponse(
  message: string,
  context: ChatRequest['context'],
  conversationHistory: ChatRequest['conversationHistory']
): string {
  const lowerMessage = message.toLowerCase();
  
  // Context-aware responses
  let response = '';
  let nextSteps: string[] = [];

  // Course-related queries
  if (context?.course || lowerMessage.includes('course') || lowerMessage.includes('lesson') || lowerMessage.includes('module')) {
    const courseName = context?.course?.title || 'the course';
    response = `I can help you with ${courseName}. `;
    
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
    response = `Let me help you with ${projectName}. `;
    
    if (lowerMessage.includes('review') || lowerMessage.includes('architecture')) {
      response += `Here's my review of your approach: `;
      nextSteps = [
        'Consider the feedback I provide',
        'Refactor based on best practices',
        'Test your changes thoroughly',
      ];
    } else if (lowerMessage.includes('improve') || lowerMessage.includes('risk')) {
      response += `Here are some improvements and potential risks to consider: `;
      nextSteps = [
        'Prioritize the most critical improvements',
        'Address potential risks early',
        'Document your decisions',
      ];
    } else if (lowerMessage.includes('description') || lowerMessage.includes('write')) {
      response += `Here's a compelling project description: `;
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
