import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createUserSupabaseClient();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.twitterUrl !== undefined) updateData.twitter_url = body.twitterUrl;
    if (body.youtubeUrl !== undefined) updateData.youtube_url = body.youtubeUrl;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.verified !== undefined) updateData.verified = body.verified;

    const { data: founder, error } = await supabase
      .from('founders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ founder });
  } catch (error) {
    console.error('Error in PATCH /api/admin/founders/[id]:', error);
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
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const { id } = await params;
    const supabase = await createUserSupabaseClient();

    const { error } = await supabase
      .from('founders')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/founders/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
