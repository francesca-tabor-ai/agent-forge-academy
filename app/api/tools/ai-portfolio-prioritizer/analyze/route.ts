import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { analyzePortfolio, type BusinessProblem } from '@/lib/tools/ai-portfolio-prioritizer/analyzer';

/**
 * POST /api/tools/ai-portfolio-prioritizer/analyze
 * 
 * Analyzes a list of business problems and returns prioritized rankings by ROI and feasibility.
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

    const body = await request.json();
    const { problems }: { problems: BusinessProblem[] } = body;

    if (!problems || !Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json(
        { error: 'At least one business problem is required' },
        { status: 400 }
      );
    }

    // Validate problems structure
    for (const problem of problems) {
      if (!problem.id || !problem.title || !problem.description) {
        return NextResponse.json(
          { error: 'Each problem must have id, title, and description' },
          { status: 400 }
        );
      }
    }

    // Analyze portfolio
    const result = await analyzePortfolio(problems);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to analyze portfolio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
