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

    // Check if startup is bookmarked
    const { data: bookmark } = await supabase
      .from('startup_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('startup_id', startupId)
      .single();

    return NextResponse.json({ bookmarked: !!bookmark });
  } catch (error) {
    console.error('Error in GET /api/startups/[id]/bookmark-status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
