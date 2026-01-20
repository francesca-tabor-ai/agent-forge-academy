import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getLLMProviderWithFallback, type LLMMessage } from '@/lib/ai/llm';
import { safeLogger } from '@/lib/utils/redactPII';

interface IdeationRequest {
  niche?: string;
  icp?: string;
  location?: string;
  additionalContext?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = `ideate_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    const { id: startupId } = await params;
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

    const body: IdeationRequest = await request.json();
    const { niche, icp, location, additionalContext } = body;

    // Fetch startup details
    const { data: startup, error: startupError } = await supabase
      .from('startups')
      .select(`
        id,
        name,
        tagline,
        description,
        revenue_range,
        pricing_model,
        target_customer,
        vibe_score,
        founders:founder_id (
          name,
          bio
        ),
        business_models (
          revenue_streams,
          pricing_details,
          key_metrics
        ),
        build_estimates (
          technical_difficulty,
          estimated_build_time_days,
          estimated_build_cost_usd
        ),
        revenue_potential (
          conservative_mrr,
          realistic_mrr,
          breakout_mrr
        )
      `)
      .eq('id', startupId)
      .single();

    if (startupError || !startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    // Create or get AI session
    let { data: session } = await supabase
      .from('ai_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!session) {
      const { data: newSession, error: sessionError } = await supabase
        .from('ai_sessions')
        .insert({
          user_id: user.id,
          startup_id: startupId,
        })
        .select('id')
        .single();

      if (sessionError) {
        safeLogger.error('[StartupIdeation] Failed to create session', {
          requestId,
          error: sessionError,
        });
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }
      session = newSession;
    }

    // Prepare context for LLM
    const startupContext = {
      name: startup.name,
      tagline: startup.tagline,
      description: startup.description,
      revenueRange: startup.revenue_range,
      pricingModel: startup.pricing_model,
      targetCustomer: startup.target_customer,
      vibeScore: startup.vibe_score,
      founder: startup.founders?.[0]?.name ?? null,
      revenueStreams: startup.business_models?.revenue_streams,
      buildTime: startup.build_estimates?.[0]?.estimated_build_time_days,
      buildCost: startup.build_estimates?.[0]?.estimated_build_cost_usd,
      technicalDifficulty: startup.build_estimates?.[0]?.technical_difficulty,
      revenuePotential: {
        conservative: startup.revenue_potential?.conservative_mrr,
        realistic: startup.revenue_potential?.realistic_mrr,
        breakout: startup.revenue_potential?.breakout_mrr,
      },
    };

    // Calculate base estimates from startup context
    const baseBuildTime = startupContext.buildTime || 30;
    const baseBuildCost = startupContext.buildCost || 1000;
    const baseTechnicalDifficulty = startupContext.technicalDifficulty || 'medium';
    
    // Adjust estimates based on adaptation complexity
    let complexityMultiplier = 1.0;
    const targetCustomerLower = (startupContext.targetCustomer || '').toLowerCase();
    const nicheLower = (niche || '').toLowerCase();
    
    if (niche && nicheLower !== targetCustomerLower && !targetCustomerLower.includes(nicheLower) && !nicheLower.includes(targetCustomerLower)) {
      complexityMultiplier += 0.2; // New niche adds complexity
    }
    if (location && location.toLowerCase().includes('remote')) {
      complexityMultiplier += 0.1; // Remote-first adds some complexity
    }
    if (additionalContext && additionalContext.length > 50) {
      complexityMultiplier += 0.15; // Additional requirements add complexity
    }
    
    // Ensure multiplier is reasonable
    complexityMultiplier = Math.min(complexityMultiplier, 2.0); // Cap at 2x
    
    // Calculate solo vs team build times
    const soloBuildTime = Math.round(baseBuildTime * complexityMultiplier);
    const teamBuildTime = Math.round(soloBuildTime * 0.6); // Team is ~40% faster
    
    // Calculate build costs
    const toolsCost = Math.round(baseBuildCost * 0.3 * complexityMultiplier);
    const infrastructureCost = Math.round(baseBuildCost * 0.5 * complexityMultiplier);
    const maintenanceMonthly = Math.round((toolsCost + infrastructureCost) * 0.1); // 10% of build cost monthly
    
    // Calculate revenue potential based on original startup's revenue
    const baseConservative = startupContext.revenuePotential?.conservative || 1000;
    const baseRealistic = startupContext.revenuePotential?.realistic || 5000;
    const baseBreakout = startupContext.revenuePotential?.breakout || 20000;
    
    // Adjust revenue based on niche/ICP changes
    let revenueMultiplier = 1.0;
    if (niche) {
      // Different niches have different revenue potential
      const highValueNiches = ['enterprise', 'b2b', 'saas', 'fintech', 'healthcare'];
      const lowValueNiches = ['consumer', 'b2c', 'marketplace'];
      if (highValueNiches.some(n => niche.toLowerCase().includes(n))) {
        revenueMultiplier = 1.3;
      } else if (lowValueNiches.some(n => niche.toLowerCase().includes(n))) {
        revenueMultiplier = 0.8;
      }
    }
    
    const conservativeMrr = Math.round(baseConservative * revenueMultiplier);
    const realisticMrr = Math.round(baseRealistic * revenueMultiplier);
    const breakoutMrr = Math.round(baseBreakout * revenueMultiplier);

    // Build prompt for LLM
    const systemPrompt = `You are an expert startup ideation assistant. Your role is to help users adapt existing successful startups to new niches, ICPs (Ideal Customer Profiles), or geographic markets. 

Generate a comprehensive, structured business idea adaptation that includes:
1. Problem Statement - The specific problem this adapted startup solves
2. Solution Outline - How the solution works, adapted for the new context
3. Differentiation - What makes this adaptation unique vs. the original and competitors
4. Risk Factors - Key risks and mitigation strategies

Be specific, actionable, and realistic. Use the original startup as inspiration but create a genuinely adapted idea.

IMPORTANT: The build time, cost, and revenue estimates will be calculated automatically based on the original startup's metrics and adaptation complexity. Focus on the problem, solution, differentiation, and risks.`;

    const userPrompt = `Adapt the startup "${startupContext.name}" (${startupContext.tagline}) to a new context.

Original Startup Details:
- Description: ${startupContext.description}
- Target Customer: ${startupContext.targetCustomer}
- Revenue Model: ${startupContext.pricingModel}
- Vibe Score: ${startupContext.vibeScore}/10
- Build Time: ${startupContext.buildTime || 'N/A'} days
- Build Cost: $${startupContext.buildCost?.toLocaleString() || 'N/A'}
- Technical Difficulty: ${startupContext.technicalDifficulty || 'N/A'}

Adaptation Requirements:
${niche ? `- New Niche: ${niche}` : ''}
${icp ? `- New ICP: ${icp}` : ''}
${location ? `- Location: ${location}` : ''}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

Generate a structured business idea adaptation. Return your response as a JSON object with the following structure:
{
  "problem_statement": "...",
  "solution_outline": "...",
  "differentiation": "...",
  "risk_factors": "..."
}

Note: Build time, cost, and revenue estimates will be calculated automatically - you don't need to include them in your response.`;

    // Get LLM provider
    const { provider, providerName } = getLLMProviderWithFallback();
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // Generate response
    const llmResponse = await provider.generate(messages, {
      temperature: 0.7,
      maxTokens: 2000,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    });

    // Parse JSON response
    let ideaData;
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonString = llmResponse.content.trim();
      
      // Remove markdown code blocks if present
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      } else {
        // Try to find JSON object in the text
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
      }
      
      ideaData = JSON.parse(jsonString);
      
      // Validate required fields
      if (!ideaData.problem_statement) {
        throw new Error('Missing problem_statement in response');
      }
    } catch (parseError) {
      safeLogger.warn('[StartupIdeation] Failed to parse LLM response as JSON', {
        requestId,
        response: llmResponse.content.substring(0, 500),
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
      
      // Fallback: try to extract structured data from text using regex
      const extractField = (text: string, field: string): string => {
        const regex = new RegExp(`${field}[\\s:]*([^\\n]+)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };
      
      ideaData = {
        problem_statement: extractField(llmResponse.content, 'problem') || extractField(llmResponse.content, 'problem statement') || llmResponse.content.substring(0, 200),
        solution_outline: extractField(llmResponse.content, 'solution') || extractField(llmResponse.content, 'solution outline') || '',
        differentiation: extractField(llmResponse.content, 'differentiation') || extractField(llmResponse.content, 'unique') || '',
        risk_factors: extractField(llmResponse.content, 'risk') || extractField(llmResponse.content, 'risk factors') || '',
      };
    }

    // Add calculated estimates (always use calculated values, not LLM-generated)
    ideaData.estimated_build = {
      time_days_solo: soloBuildTime,
      time_days_team: teamBuildTime,
      cost_usd: toolsCost + infrastructureCost,
      cost_breakdown: {
        tools: toolsCost,
        infrastructure: infrastructureCost,
      },
      maintenance_monthly: maintenanceMonthly,
    };
    
    ideaData.estimated_revenue = {
      conservative_mrr: conservativeMrr,
      realistic_mrr: realisticMrr,
      breakout_mrr: breakoutMrr,
    };

    // Save idea to database
    const { data: idea, error: ideaError } = await supabase
      .from('ai_ideas')
      .insert({
        ai_session_id: session.id,
        niche: niche || null,
        problem_statement: ideaData.problem_statement || '',
        solution_outline: ideaData.solution_outline || '',
        differentiation: ideaData.differentiation || '',
        estimated_build: {
          time_days_solo: ideaData.estimated_build.time_days_solo,
          time_days_team: ideaData.estimated_build.time_days_team,
          cost_usd: ideaData.estimated_build.cost_usd,
          cost_breakdown: ideaData.estimated_build.cost_breakdown,
          maintenance_monthly: ideaData.estimated_build.maintenance_monthly,
        },
        estimated_revenue: ideaData.estimated_revenue,
        risk_factors: ideaData.risk_factors || '',
      })
      .select()
      .single();

    if (ideaError) {
      safeLogger.error('[StartupIdeation] Failed to save idea', {
        requestId,
        error: ideaError,
      });
      // Continue even if save fails
    }

    const responseTime = Date.now() - startTime;
    safeLogger.info('[StartupIdeation] Success', {
      requestId,
      provider: providerName,
      responseTime,
      ideaId: idea?.id,
    });

    return NextResponse.json({
      success: true,
      idea: {
        id: idea?.id,
        niche: niche || null,
        icp: icp || null,
        location: location || null,
        problemStatement: ideaData.problem_statement || '',
        solutionOutline: ideaData.solution_outline || '',
        differentiation: ideaData.differentiation || '',
        estimatedBuild: {
          timeDaysSolo: ideaData.estimated_build.time_days_solo,
          timeDaysTeam: ideaData.estimated_build.time_days_team,
          costUsd: ideaData.estimated_build.cost_usd,
          costBreakdown: ideaData.estimated_build.cost_breakdown,
          maintenanceMonthly: ideaData.estimated_build.maintenance_monthly,
        },
        estimatedRevenue: ideaData.estimated_revenue,
        riskFactors: ideaData.risk_factors || '',
        createdAt: idea?.created_at || new Date().toISOString(),
      },
      sessionId: session.id,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    safeLogger.error('[StartupIdeation] Error', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      responseTime,
    });

    if (error instanceof Error && error.message.includes('LLM_API_KEY')) {
      return NextResponse.json(
        {
          error: 'AI service unavailable',
          code: 'SERVICE_UNAVAILABLE',
          requestId,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate idea',
        requestId,
      },
      { status: 500 }
    );
  }
}
