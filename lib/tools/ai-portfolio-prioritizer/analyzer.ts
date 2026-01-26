/**
 * AI Portfolio Prioritizer - Analysis Engine
 * 
 * Analyzes business problems and ranks them by ROI and feasibility using AI.
 */

import { getLLMProvider } from '@/lib/ai/llm';

export interface BusinessProblem {
  id: string;
  title: string;
  description: string;
  impact?: string; // Optional impact description
  constraints?: string; // Optional constraints
}

export interface ProblemAnalysis {
  problemId: string;
  roiScore: number; // 0-100
  feasibilityScore: number; // 0-100
  priorityScore: number; // 0-100, weighted combination
  roiBreakdown: {
    potentialRevenue: number; // Estimated revenue impact (0-100)
    costSavings: number; // Estimated cost savings (0-100)
    strategicValue: number; // Strategic/competitive value (0-100)
    timeToValue: number; // Months to realize value (lower is better, converted to score)
  };
  feasibilityBreakdown: {
    technicalComplexity: number; // 0-100, lower is better (converted to score)
    resourceRequirements: number; // 0-100, lower is better (converted to score)
    riskLevel: number; // 0-100, lower is better (converted to score)
    dependencies: number; // 0-100, lower is better (converted to score)
  };
  reasoning: string; // AI-generated reasoning
  estimatedTimeline: string; // e.g., "3-6 months"
  estimatedCost: string; // e.g., "$50K-$100K" or "Low/Medium/High"
  keyRisks: string[]; // List of key risks
  recommendations: string[]; // List of recommendations
}

export interface PrioritizationResult {
  problems: ProblemAnalysis[];
  summary: {
    totalProblems: number;
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
    averageROI: number;
    averageFeasibility: number;
  };
  insights: string[]; // AI-generated insights about the portfolio
}

/**
 * Analyze a single business problem using AI
 */
async function analyzeProblem(problem: BusinessProblem): Promise<ProblemAnalysis> {
  const llm = getLLMProvider();
  
  const prompt = `You are an expert business analyst specializing in project portfolio prioritization. Analyze the following business problem and provide a comprehensive assessment.

Business Problem:
Title: ${problem.title}
Description: ${problem.description}
${problem.impact ? `Impact: ${problem.impact}` : ''}
${problem.constraints ? `Constraints: ${problem.constraints}` : ''}

Provide a detailed analysis in JSON format with the following structure:
{
  "roiScore": <number 0-100>,
  "feasibilityScore": <number 0-100>,
  "roiBreakdown": {
    "potentialRevenue": <number 0-100>,
    "costSavings": <number 0-100>,
    "strategicValue": <number 0-100>,
    "timeToValue": <number of months>
  },
  "feasibilityBreakdown": {
    "technicalComplexity": <number 0-100, where 0=simple, 100=very complex>,
    "resourceRequirements": <number 0-100, where 0=minimal, 100=extensive>,
    "riskLevel": <number 0-100, where 0=low risk, 100=high risk>,
    "dependencies": <number 0-100, where 0=none, 100=many dependencies>
  },
  "reasoning": "<detailed explanation of the analysis>",
  "estimatedTimeline": "<e.g., '3-6 months' or '6-12 months'>",
  "estimatedCost": "<e.g., '$50K-$100K' or 'Low/Medium/High'>",
  "keyRisks": ["<risk 1>", "<risk 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}

Be thorough and realistic in your assessment. Consider:
- Market conditions and competitive landscape
- Technical feasibility given typical resources
- Resource availability and team capabilities
- Strategic alignment with business goals
- Risk factors and mitigation strategies

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await llm.generate(
      [
        {
          role: 'system',
          content: 'You are an expert business analyst. Always respond with valid JSON only, no markdown formatting or additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    // Parse JSON response
    let analysis: any;
    try {
      // Remove markdown code blocks if present
      const cleaned = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.content);
      // Return default analysis on parse error
      return createDefaultAnalysis(problem);
    }

    // Convert timeToValue to score (lower months = higher score)
    const timeToValueScore = Math.max(0, 100 - (analysis.roiBreakdown.timeToValue || 12) * 5);
    
    // Convert feasibility metrics to scores (lower complexity/requirements/risk = higher score)
    const technicalComplexityScore = 100 - (analysis.feasibilityBreakdown.technicalComplexity || 50);
    const resourceRequirementsScore = 100 - (analysis.feasibilityBreakdown.resourceRequirements || 50);
    const riskLevelScore = 100 - (analysis.feasibilityBreakdown.riskLevel || 50);
    const dependenciesScore = 100 - (analysis.feasibilityBreakdown.dependencies || 50);

    // Calculate priority score (weighted: 60% ROI, 40% Feasibility)
    const priorityScore = (analysis.roiScore * 0.6) + (analysis.feasibilityScore * 0.4);

    return {
      problemId: problem.id,
      roiScore: Math.max(0, Math.min(100, analysis.roiScore || 50)),
      feasibilityScore: Math.max(0, Math.min(100, analysis.feasibilityScore || 50)),
      priorityScore: Math.max(0, Math.min(100, priorityScore)),
      roiBreakdown: {
        potentialRevenue: Math.max(0, Math.min(100, analysis.roiBreakdown?.potentialRevenue || 50)),
        costSavings: Math.max(0, Math.min(100, analysis.roiBreakdown?.costSavings || 50)),
        strategicValue: Math.max(0, Math.min(100, analysis.roiBreakdown?.strategicValue || 50)),
        timeToValue: analysis.roiBreakdown?.timeToValue || 12,
      },
      feasibilityBreakdown: {
        technicalComplexity: analysis.feasibilityBreakdown?.technicalComplexity || 50,
        resourceRequirements: analysis.feasibilityBreakdown?.resourceRequirements || 50,
        riskLevel: analysis.feasibilityBreakdown?.riskLevel || 50,
        dependencies: analysis.feasibilityBreakdown?.dependencies || 50,
      },
      reasoning: analysis.reasoning || 'Analysis completed',
      estimatedTimeline: analysis.estimatedTimeline || 'TBD',
      estimatedCost: analysis.estimatedCost || 'TBD',
      keyRisks: Array.isArray(analysis.keyRisks) ? analysis.keyRisks : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
    };
  } catch (error) {
    console.error('Error analyzing problem:', error);
    return createDefaultAnalysis(problem);
  }
}

/**
 * Create default analysis when AI analysis fails
 */
function createDefaultAnalysis(problem: BusinessProblem): ProblemAnalysis {
  return {
    problemId: problem.id,
    roiScore: 50,
    feasibilityScore: 50,
    priorityScore: 50,
    roiBreakdown: {
      potentialRevenue: 50,
      costSavings: 50,
      strategicValue: 50,
      timeToValue: 12,
    },
    feasibilityBreakdown: {
      technicalComplexity: 50,
      resourceRequirements: 50,
      riskLevel: 50,
      dependencies: 50,
    },
    reasoning: 'Default analysis - AI analysis unavailable',
    estimatedTimeline: 'TBD',
    estimatedCost: 'TBD',
    keyRisks: [],
    recommendations: [],
  };
}

/**
 * Generate portfolio-level insights
 */
async function generatePortfolioInsights(analyses: ProblemAnalysis[], problems: BusinessProblem[]): Promise<string[]> {
  const llm = getLLMProvider();
  
  const problemSummaries = problems.map((p, idx) => 
    `${idx + 1}. ${p.title}: ROI ${analyses[idx].roiScore}/100, Feasibility ${analyses[idx].feasibilityScore}/100`
  ).join('\n');

  const prompt = `You are a strategic business advisor. Analyze this portfolio of business problems and provide 3-5 key insights.

Problem Portfolio:
${problemSummaries}

Provide insights in JSON format:
{
  "insights": ["<insight 1>", "<insight 2>", "<insight 3>", ...]
}

Focus on:
- Patterns across the portfolio
- Strategic recommendations
- Resource allocation suggestions
- Risk considerations
- Quick wins vs long-term plays

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await llm.generate(
      [
        {
          role: 'system',
          content: 'You are a strategic business advisor. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.8,
        maxTokens: 1000,
      }
    );

    const cleaned = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    return Array.isArray(parsed.insights) ? parsed.insights : [];
  } catch (error) {
    console.error('Error generating insights:', error);
    return [
      'Portfolio analysis completed. Review individual problem analyses for detailed insights.',
    ];
  }
}

/**
 * Analyze and prioritize a list of business problems
 */
export async function analyzePortfolio(problems: BusinessProblem[]): Promise<PrioritizationResult> {
  if (problems.length === 0) {
    return {
      problems: [],
      summary: {
        totalProblems: 0,
        highPriorityCount: 0,
        mediumPriorityCount: 0,
        lowPriorityCount: 0,
        averageROI: 0,
        averageFeasibility: 0,
      },
      insights: [],
    };
  }

  // Analyze all problems (can be parallelized in production)
  const analyses: ProblemAnalysis[] = [];
  for (const problem of problems) {
    const analysis = await analyzeProblem(problem);
    analyses.push(analysis);
  }

  // Sort by priority score (highest first)
  analyses.sort((a, b) => b.priorityScore - a.priorityScore);

  // Calculate summary statistics
  const highPriority = analyses.filter(a => a.priorityScore >= 70).length;
  const mediumPriority = analyses.filter(a => a.priorityScore >= 40 && a.priorityScore < 70).length;
  const lowPriority = analyses.filter(a => a.priorityScore < 40).length;
  const averageROI = analyses.reduce((sum, a) => sum + a.roiScore, 0) / analyses.length;
  const averageFeasibility = analyses.reduce((sum, a) => sum + a.feasibilityScore, 0) / analyses.length;

  // Generate portfolio insights
  const insights = await generatePortfolioInsights(analyses, problems);

  return {
    problems: analyses,
    summary: {
      totalProblems: problems.length,
      highPriorityCount: highPriority,
      mediumPriorityCount: mediumPriority,
      lowPriorityCount: lowPriority,
      averageROI: Math.round(averageROI * 10) / 10,
      averageFeasibility: Math.round(averageFeasibility * 10) / 10,
    },
    insights,
  };
}
