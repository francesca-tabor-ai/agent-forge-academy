import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/server';

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
