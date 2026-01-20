import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
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

    // Get unique niches (from target_customer field)
    const { data: startups } = await supabase
      .from('startups')
      .select('target_customer')
      .not('target_customer', 'is', null);

    const niches = new Set<string>();
    (startups || []).forEach((startup: any) => {
      if (startup.target_customer) {
        // Split by common delimiters and add each unique value
        const parts = startup.target_customer
          .split(/[,;|]/)
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0);
        parts.forEach((part: string) => niches.add(part));
      }
    });

    // Get unique vibe scores
    const { data: vibeScores } = await supabase
      .from('startups')
      .select('vibe_score')
      .not('vibe_score', 'is', null)
      .order('vibe_score', { ascending: false });

    const uniqueVibeScores = Array.from(
      new Set((vibeScores || []).map((s: any) => s.vibe_score))
    ).sort((a, b) => b - a);

    return NextResponse.json({
      niches: Array.from(niches).sort(),
      vibeScores: uniqueVibeScores,
    });
  } catch (error) {
    console.error('Error in GET /api/startups/filters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
