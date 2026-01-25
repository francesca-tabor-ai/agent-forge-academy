import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getLLMProvider } from '@/lib/ai/llm';

interface GenerateRequest {
  businessContext: {
    targetAudience: string;
    budget?: string;
    timeline?: string;
    companyStage?: string;
    teamSize?: string;
  };
  toolStack?: {
    category: string;
    tools: string[];
  }[];
  integrations?: {
    from: string;
    to: string;
    type: string;
  }[];
  frictionPoints?: string[];
}

interface SystemDesignOutput {
  systemMap: {
    nodes: Array<{
      id: string;
      label: string;
      category: string;
      description: string;
    }>;
    edges: Array<{
      from: string;
      to: string;
      type: string;
      description: string;
    }>;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  architecture: {
    overview: string;
    components: Array<{
      name: string;
      description: string;
      technologies: string[];
    }>;
    dataFlow: string;
    aiOpportunities: string[];
  };
  nextSteps: string[];
}

/**
 * POST /api/tools/gtm-system-designer/generate
 * 
 * Generates a GTM system design based on user inputs
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { businessContext, toolStack, integrations, frictionPoints } = body;

    if (!businessContext?.targetAudience) {
      return NextResponse.json(
        { error: 'targetAudience is required' },
        { status: 400 }
      );
    }

    // Generate system design using LLM
    const llm = getLLMProvider();
    
    const prompt = buildSystemDesignPrompt(
      businessContext,
      toolStack,
      integrations,
      frictionPoints
    );

    const response = await llm.generate(
      [
        {
          role: 'system',
          content: `You are an expert GTM Engineer specializing in designing AI-native go-to-market systems. 
You help companies architect scalable GTM systems that integrate data, automation, AI, and analytics.

Your responses should be structured, actionable, and focused on practical implementation.
Always consider:
- Event-driven vs stage-driven approaches
- Data quality and validation
- Automation opportunities
- AI-native workflows
- Integration patterns
- Scalability and maintainability`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 4000,
      }
    );

    // Parse the LLM response into structured output
    const designOutput = parseSystemDesignResponse(response.content);

    return NextResponse.json({
      success: true,
      design: designOutput,
    });
  } catch (error) {
    console.error('Error generating GTM system design:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate system design',
      },
      { status: 500 }
    );
  }
}

function buildSystemDesignPrompt(
  businessContext: GenerateRequest['businessContext'],
  toolStack?: GenerateRequest['toolStack'],
  integrations?: GenerateRequest['integrations'],
  frictionPoints?: GenerateRequest['frictionPoints']
): string {
  let prompt = `Design a comprehensive GTM system for the following business context:\n\n`;

  prompt += `**Business Context:**\n`;
  prompt += `- Target Audience: ${businessContext.targetAudience}\n`;
  if (businessContext.budget) {
    prompt += `- Budget: ${businessContext.budget}\n`;
  }
  if (businessContext.timeline) {
    prompt += `- Timeline: ${businessContext.timeline}\n`;
  }
  if (businessContext.companyStage) {
    prompt += `- Company Stage: ${businessContext.companyStage}\n`;
  }
  if (businessContext.teamSize) {
    prompt += `- Team Size: ${businessContext.teamSize}\n`;
  }

  if (toolStack && toolStack.length > 0) {
    prompt += `\n**Current Tool Stack:**\n`;
    toolStack.forEach((category) => {
      prompt += `- ${category.category}: ${category.tools.join(', ')}\n`;
    });
  }

  if (integrations && integrations.length > 0) {
    prompt += `\n**Existing Integrations:**\n`;
    integrations.forEach((integration) => {
      prompt += `- ${integration.from} → ${integration.to} (${integration.type})\n`;
    });
  }

  if (frictionPoints && frictionPoints.length > 0) {
    prompt += `\n**Friction Points:**\n`;
    frictionPoints.forEach((point, idx) => {
      prompt += `${idx + 1}. ${point}\n`;
    });
  }

  prompt += `\n**Please provide:**\n`;
  prompt += `1. A system map with nodes (tools/components) and edges (data flows/integrations)\n`;
  prompt += `2. Prioritized recommendations for improvements, automations, and AI-native approaches\n`;
  prompt += `3. System architecture overview with components, data flow, and AI opportunities\n`;
  prompt += `4. Next steps for implementation\n\n`;
  prompt += `Format your response as JSON with the following structure:\n`;
  prompt += `{\n`;
  prompt += `  "systemMap": {\n`;
  prompt += `    "nodes": [{"id": "string", "label": "string", "category": "string", "description": "string"}],\n`;
  prompt += `    "edges": [{"from": "string", "to": "string", "type": "string", "description": "string"}]\n`;
  prompt += `  },\n`;
  prompt += `  "recommendations": [{"priority": "high|medium|low", "category": "string", "title": "string", "description": "string", "impact": "string", "effort": "low|medium|high"}],\n`;
  prompt += `  "architecture": {\n`;
  prompt += `    "overview": "string",\n`;
  prompt += `    "components": [{"name": "string", "description": "string", "technologies": ["string"]}],\n`;
  prompt += `    "dataFlow": "string",\n`;
  prompt += `    "aiOpportunities": ["string"]\n`;
  prompt += `  },\n`;
  prompt += `  "nextSteps": ["string"]\n`;
  prompt += `}\n`;

  return prompt;
}

function parseSystemDesignResponse(content: string): SystemDesignOutput {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return validateAndNormalizeDesign(parsed);
    }

    // Fallback: create a basic structure if JSON parsing fails
    return createFallbackDesign(content);
  } catch (error) {
    console.error('Error parsing system design response:', error);
    return createFallbackDesign(content);
  }
}

function validateAndNormalizeDesign(parsed: any): SystemDesignOutput {
  return {
    systemMap: {
      nodes: Array.isArray(parsed.systemMap?.nodes)
        ? parsed.systemMap.nodes
        : [],
      edges: Array.isArray(parsed.systemMap?.edges)
        ? parsed.systemMap.edges
        : [],
    },
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [],
    architecture: {
      overview: parsed.architecture?.overview || 'System architecture overview',
      components: Array.isArray(parsed.architecture?.components)
        ? parsed.architecture.components
        : [],
      dataFlow: parsed.architecture?.dataFlow || 'Data flow description',
      aiOpportunities: Array.isArray(parsed.architecture?.aiOpportunities)
        ? parsed.architecture.aiOpportunities
        : [],
    },
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
  };
}

function createFallbackDesign(content: string): SystemDesignOutput {
  return {
    systemMap: {
      nodes: [
        {
          id: 'crm',
          label: 'CRM',
          category: 'CRM & Pipeline',
          description: 'Customer relationship management system',
        },
        {
          id: 'enrichment',
          label: 'Data Enrichment',
          category: 'Data & Enrichment',
          description: 'Automated data enrichment and validation',
        },
        {
          id: 'routing',
          label: 'Lead Routing',
          category: 'Automation',
          description: 'Automated lead routing and prioritization',
        },
      ],
      edges: [
        {
          from: 'crm',
          to: 'enrichment',
          type: 'data',
          description: 'Lead data flows to enrichment',
        },
        {
          from: 'enrichment',
          to: 'routing',
          type: 'data',
          description: 'Enriched data flows to routing',
        },
      ],
    },
    recommendations: [
      {
        priority: 'high',
        category: 'Automation',
        title: 'Implement automated data enrichment',
        description: 'Set up automated enrichment workflows to improve data quality',
        impact: 'Reduces manual data entry by 80%',
        effort: 'medium',
      },
    ],
    architecture: {
      overview: 'A modern GTM system architecture designed for scalability and automation.',
      components: [
        {
          name: 'CRM Layer',
          description: 'Core customer relationship management',
          technologies: ['HubSpot', 'Salesforce'],
        },
      ],
      dataFlow: 'Data flows from lead capture through enrichment, routing, and analytics.',
      aiOpportunities: ['AI-powered lead scoring', 'Automated email personalization'],
    },
    nextSteps: [
      'Review the system architecture',
      'Prioritize recommendations',
      'Plan implementation timeline',
    ],
  };
}
