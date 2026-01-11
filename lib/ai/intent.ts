/**
 * Intent classification for AI advisor
 * Routes requests to appropriate tools and context
 */

export type AdvisorIntent =
  | 'learning_help' // Course/lesson questions, explanations, quizzes
  | 'project_review' // Portfolio project feedback, architecture review
  | 'job_matching' // Job recommendations, matching
  | 'application_help' // CV/resume, cover letter, interview prep
  | 'general_career' // General career advice, path guidance
  | 'general'; // Fallback for unclear intent

export interface IntentClassification {
  intent: AdvisorIntent;
  confidence: number; // 0-1
  reasoning?: string; // Optional explanation
}

/**
 * Rule-based intent classifier (fast, deterministic)
 * Falls back to LLM-based classification for ambiguous cases
 */
export function classifyIntentRules(message: string, context?: {
  course?: { id: string; slug: string; title: string };
  project?: { id: string; title: string };
  job?: { id: string; title: string; company: string };
}): IntentClassification {
  const lowerMessage = message.toLowerCase().trim();

  // Context-based routing (strong signal)
  if (context?.course) {
    // Course context + learning keywords = learning_help
    if (
      lowerMessage.includes('explain') ||
      lowerMessage.includes('understand') ||
      lowerMessage.includes('how does') ||
      lowerMessage.includes('what is') ||
      lowerMessage.includes('quiz') ||
      lowerMessage.includes('practice') ||
      lowerMessage.includes('lesson') ||
      lowerMessage.includes('module')
    ) {
      return { intent: 'learning_help', confidence: 0.9 };
    }
  }

  if (context?.project) {
    // Project context + review keywords = project_review
    if (
      lowerMessage.includes('review') ||
      lowerMessage.includes('feedback') ||
      lowerMessage.includes('improve') ||
      lowerMessage.includes('architecture') ||
      lowerMessage.includes('risks') ||
      lowerMessage.includes('description') ||
      lowerMessage.includes('write')
    ) {
      return { intent: 'project_review', confidence: 0.9 };
    }
  }

  if (context?.job) {
    // Job context + application keywords = application_help
    if (
      lowerMessage.includes('cv') ||
      lowerMessage.includes('resume') ||
      lowerMessage.includes('cover letter') ||
      lowerMessage.includes('tailor') ||
      lowerMessage.includes('application') ||
      lowerMessage.includes('interview')
    ) {
      return { intent: 'application_help', confidence: 0.9 };
    }
    // Job context + matching keywords = job_matching
    if (
      lowerMessage.includes('match') ||
      lowerMessage.includes('recommend') ||
      lowerMessage.includes('suitable') ||
      lowerMessage.includes('fit')
    ) {
      return { intent: 'job_matching', confidence: 0.85 };
    }
  }

  // Keyword-based classification (no context)
  const learningKeywords = [
    'course', 'lesson', 'module', 'explain', 'understand', 'how does', 'what is',
    'quiz', 'test', 'practice', 'learn', 'teaching', 'concept', 'topic',
    'tutorial', 'guide', 'help me learn', 'study', 'homework'
  ];
  const learningScore = learningKeywords.filter(kw => lowerMessage.includes(kw)).length;

  const projectKeywords = [
    'project', 'portfolio', 'review', 'feedback', 'improve', 'architecture',
    'code review', 'risks', 'description', 'github', 'demo', 'tech stack'
  ];
  const projectScore = projectKeywords.filter(kw => lowerMessage.includes(kw)).length;

  const jobMatchingKeywords = [
    'job', 'position', 'role', 'match', 'recommend', 'suitable', 'fit',
    'opportunities', 'openings', 'career', 'hiring'
  ];
  const jobMatchingScore = jobMatchingKeywords.filter(kw => lowerMessage.includes(kw)).length;

  const applicationKeywords = [
    'cv', 'resume', 'cover letter', 'application', 'apply', 'tailor',
    'interview', 'prep', 'prepare', 'ats', 'recruiter'
  ];
  const applicationScore = applicationKeywords.filter(kw => lowerMessage.includes(kw)).length;

  const careerKeywords = [
    'career', 'path', 'advice', 'guidance', 'direction', 'future',
    'growth', 'development', 'skills', 'next steps'
  ];
  const careerScore = careerKeywords.filter(kw => lowerMessage.includes(kw)).length;

  // Score-based classification
  const scores = [
    { intent: 'learning_help' as AdvisorIntent, score: learningScore },
    { intent: 'project_review' as AdvisorIntent, score: projectScore },
    { intent: 'job_matching' as AdvisorIntent, score: jobMatchingScore },
    { intent: 'application_help' as AdvisorIntent, score: applicationScore },
    { intent: 'general_career' as AdvisorIntent, score: careerScore },
  ];

  const maxScore = Math.max(...scores.map(s => s.score));
  const topIntent = scores.find(s => s.score === maxScore);

  if (maxScore === 0) {
    return { intent: 'general', confidence: 0.5 };
  }

  // Calculate confidence based on score dominance
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const confidence = totalScore > 0 ? Math.min(0.5 + (maxScore / totalScore) * 0.4, 0.9) : 0.5;

  return {
    intent: topIntent!.intent,
    confidence,
  };
}

/**
 * LLM-based intent classifier (more accurate, slower)
 * Use when rule-based classification has low confidence
 */
export async function classifyIntentLLM(
  message: string,
  context?: {
    course?: { id: string; slug: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  }
): Promise<IntentClassification> {
  const { getLLMProvider } = await import('./llm');

  const contextDescription = [];
  if (context?.course) {
    contextDescription.push(`Active course: ${context.course.title}`);
  }
  if (context?.project) {
    contextDescription.push(`Active project: ${context.project.title}`);
  }
  if (context?.job) {
    contextDescription.push(`Active job: ${context.job.title} at ${context.job.company}`);
  }

  const systemPrompt = `You are an intent classifier for an AI learning advisor. Classify the user's message into one of these intents:

1. **learning_help**: Questions about courses, lessons, concepts, explanations, quizzes, practice tasks
2. **project_review**: Feedback on portfolio projects, architecture reviews, improvements, descriptions
3. **job_matching**: Job recommendations, finding suitable roles, matching skills to jobs
4. **application_help**: CV/resume help, cover letters, interview preparation, application tailoring
5. **general_career**: General career advice, path guidance, skill development, growth

${contextDescription.length > 0 ? `\nCurrent context:\n${contextDescription.join('\n')}` : ''}

Respond with ONLY a JSON object: {"intent": "intent_name", "confidence": 0.0-1.0, "reasoning": "brief explanation"}`;

  try {
    const llm = getLLMProvider();
    const response = await llm.generate(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      {
        temperature: 0.1, // Low temperature for classification
        maxTokens: 200,
      }
    );

    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        intent: parsed.intent as AdvisorIntent,
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning,
      };
    }

    // Fallback if JSON parsing fails
    return { intent: 'general', confidence: 0.5 };
  } catch (error) {
    console.error('LLM intent classification failed:', error);
    // Fallback to rule-based
    return classifyIntentRules(message, context);
  }
}

/**
 * Main intent classification function
 * Uses rule-based first, falls back to LLM if confidence is low
 */
export async function classifyIntent(
  message: string,
  context?: {
    course?: { id: string; slug: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  },
  options: {
    useLLM?: boolean; // Force LLM classification
    minConfidence?: number; // Minimum confidence threshold for rule-based (default: 0.7)
  } = {}
): Promise<IntentClassification> {
  const { useLLM = false, minConfidence = 0.7 } = options;

  // Use LLM if explicitly requested
  if (useLLM) {
    return classifyIntentLLM(message, context);
  }

  // Try rule-based first
  const ruleResult = classifyIntentRules(message, context);

  // If confidence is high enough, return rule-based result
  if (ruleResult.confidence >= minConfidence) {
    return ruleResult;
  }

  // Otherwise, use LLM for better accuracy
  return classifyIntentLLM(message, context);
}

/**
 * Get tools/context to use based on intent
 */
export function getToolsForIntent(intent: AdvisorIntent): {
  useRAG: boolean;
  useJobsMatching: boolean;
  usePortfolioFetch: boolean;
  useCourseContext: boolean;
} {
  switch (intent) {
    case 'learning_help':
      return {
        useRAG: true,
        useJobsMatching: false,
        usePortfolioFetch: false,
        useCourseContext: true,
      };

    case 'project_review':
      return {
        useRAG: false, // Could enable for relevant course content
        useJobsMatching: false,
        usePortfolioFetch: true,
        useCourseContext: false,
      };

    case 'job_matching':
      return {
        useRAG: false,
        useJobsMatching: true,
        usePortfolioFetch: true, // Need portfolio for matching
        useCourseContext: false,
      };

    case 'application_help':
      return {
        useRAG: false,
        useJobsMatching: false,
        usePortfolioFetch: true, // Need portfolio for CV/cover letter
        useCourseContext: false,
      };

    case 'general_career':
      return {
        useRAG: false,
        useJobsMatching: true, // Could suggest relevant jobs
        usePortfolioFetch: true, // Need portfolio for career advice
        useCourseContext: false,
      };

    default:
      return {
        useRAG: false,
        useJobsMatching: false,
        usePortfolioFetch: false,
        useCourseContext: false,
      };
  }
}
