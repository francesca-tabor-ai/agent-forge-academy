import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const supabase = await createUserSupabaseClient();
    const { data: founders, error } = await supabase
      .from('founders')
      .select('*')
      .order('name');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ founders: founders || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/founders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const body = await request.json();
    const supabase = await createUserSupabaseClient();

    const { data: founder, error } = await supabase
      .from('founders')
      .insert({
        name: body.name,
        bio: body.bio,
        twitter_url: body.twitterUrl,
        youtube_url: body.youtubeUrl,
        website: body.website,
        verified: body.verified || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating founder:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ founder });
  } catch (error) {
    console.error('Error in POST /api/admin/founders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
