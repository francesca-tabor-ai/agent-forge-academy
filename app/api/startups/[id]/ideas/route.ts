import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get user's AI session for this startup
    const { data: session } = await supabase
      .from('ai_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!session) {
      return NextResponse.json({ ideas: [] });
    }

    // Get all ideas for this session
    const { data: ideas, error } = await supabase
      .from('ai_ideas')
      .select('*')
      .eq('ai_session_id', session.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ideas:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const transformedIdeas = (ideas || []).map((idea: any) => ({
      id: idea.id,
      niche: idea.niche,
      problemStatement: idea.problem_statement,
      solutionOutline: idea.solution_outline,
      differentiation: idea.differentiation,
      estimatedBuild: {
        timeDaysSolo: idea.estimated_build?.time_days_solo || idea.estimated_build?.time_days || 30,
        timeDaysTeam: idea.estimated_build?.time_days_team || Math.round((idea.estimated_build?.time_days_solo || idea.estimated_build?.time_days || 30) * 0.6),
        costUsd: idea.estimated_build?.cost_usd || 1000,
        costBreakdown: idea.estimated_build?.cost_breakdown || {
          tools: Math.round((idea.estimated_build?.cost_usd || 1000) * 0.3),
          infrastructure: Math.round((idea.estimated_build?.cost_usd || 1000) * 0.5),
        },
        maintenanceMonthly: idea.estimated_build?.maintenance_monthly || Math.round((idea.estimated_build?.cost_usd || 1000) * 0.1),
      },
      estimatedRevenue: idea.estimated_revenue || {
        conservative_mrr: 1000,
        realistic_mrr: 5000,
        breakout_mrr: 20000,
      },
      riskFactors: idea.risk_factors,
      createdAt: idea.created_at,
    }));

    return NextResponse.json({ ideas: transformedIdeas });
  } catch (error) {
    console.error('Error in GET /api/startups/[id]/ideas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
