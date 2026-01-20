import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

export async function POST(
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

    // Check if already bookmarked
    const { data: existingBookmark } = await supabase
      .from('startup_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('startup_id', startupId)
      .single();

    if (existingBookmark) {
      return NextResponse.json({ success: true, bookmarked: true });
    }

    // Create bookmark
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('startup_bookmarks')
      .insert({
        user_id: user.id,
        startup_id: startupId,
      })
      .select()
      .single();

    if (bookmarkError) {
      console.error('Error creating bookmark:', bookmarkError);
      return NextResponse.json(
        { error: 'Failed to bookmark startup' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookmarked: true, bookmark });
  } catch (error) {
    console.error('Error in POST /api/startups/[id]/bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Remove bookmark
    const { error: bookmarkError } = await supabase
      .from('startup_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('startup_id', startupId);

    if (bookmarkError) {
      console.error('Error removing bookmark:', bookmarkError);
      return NextResponse.json(
        { error: 'Failed to remove bookmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookmarked: false });
  } catch (error) {
    console.error('Error in DELETE /api/startups/[id]/bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
