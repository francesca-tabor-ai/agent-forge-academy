import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  try {
    const { ideaId } = await params;
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

    // Get the idea to find the startup_id
    const { data: idea, error: ideaError } = await supabase
      .from('ai_ideas')
      .select(`
        id,
        ai_sessions!inner (
          startup_id,
          user_id
        )
      `)
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Verify user owns this idea
    const session = (idea as any).ai_sessions;
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if already bookmarked
    const { data: existingBookmark } = await supabase
      .from('startup_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('startup_id', session.startup_id)
      .single();

    if (existingBookmark) {
      // Already bookmarked
      return NextResponse.json({ success: true, bookmarked: true });
    }

    // Create bookmark
    const { error: bookmarkError } = await supabase
      .from('startup_bookmarks')
      .insert({
        user_id: user.id,
        startup_id: session.startup_id,
      });

    if (bookmarkError) {
      console.error('Error creating bookmark:', bookmarkError);
      return NextResponse.json(
        { error: 'Failed to bookmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookmarked: true });
  } catch (error) {
    console.error('Error in POST /api/startups/ideas/[ideaId]/bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  try {
    const { ideaId } = await params;
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

    // Get the idea to find the startup_id
    const { data: idea, error: ideaError } = await supabase
      .from('ai_ideas')
      .select(`
        id,
        ai_sessions!inner (
          startup_id,
          user_id
        )
      `)
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Verify user owns this idea
    const session = (idea as any).ai_sessions;
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Remove bookmark
    const { error: bookmarkError } = await supabase
      .from('startup_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('startup_id', session.startup_id);

    if (bookmarkError) {
      console.error('Error removing bookmark:', bookmarkError);
      return NextResponse.json(
        { error: 'Failed to remove bookmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookmarked: false });
  } catch (error) {
    console.error('Error in DELETE /api/startups/ideas/[ideaId]/bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
