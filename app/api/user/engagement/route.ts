import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route uses cookies for authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Ensure it won't be cached as static
export const fetchCache = 'force-no-store'; // Prevent fetch caching

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

    // Get bookmarks
    const { data: bookmarks } = await supabase
      .from('startup_bookmarks')
      .select(`
        id,
        startup_id,
        created_at,
        startups (
          id,
          name,
          tagline,
          logo_url,
          vibe_score
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Get course progress
    const { data: courseProgress } = await supabase
      .from('startup_progress_tracking')
      .select(`
        id,
        course_id,
        progress_percent,
        started_at,
        updated_at,
        startup_courses (
          id,
          title,
          level,
          price,
          startups (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    // Get AI ideation sessions
    const { data: aiSessions } = await supabase
      .from('ai_sessions')
      .select(`
        id,
        startup_id,
        created_at,
        startups (
          id,
          name,
          tagline,
          logo_url
        ),
        ai_ideas (
          id,
          niche,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      bookmarks: bookmarks || [],
      courseProgress: courseProgress || [],
      aiSessions: (aiSessions || []).map((session: any) => ({
        id: session.id,
        startupId: session.startup_id,
        createdAt: session.created_at,
        startup: session.startups,
        ideaCount: session.ai_ideas?.length || 0,
        latestIdea: session.ai_ideas?.[0] || null,
      })),
    });
  } catch (error) {
    console.error('Error in GET /api/user/engagement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
