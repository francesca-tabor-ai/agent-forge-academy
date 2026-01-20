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
    const { data: prompts, error } = await supabase
      .from('vibe_prompts')
      .select(`
        id,
        startup_id,
        prompt_type,
        prompt_text,
        difficulty,
        startups (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompts: prompts || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/prompts:', error);
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

    const { data: prompt, error } = await supabase
      .from('vibe_prompts')
      .insert({
        startup_id: body.startupId,
        prompt_type: body.promptType,
        prompt_text: body.promptText,
        difficulty: body.difficulty,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating prompt:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Error in POST /api/admin/prompts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
