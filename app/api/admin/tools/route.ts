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

    const { data: tool, error } = await supabase
      .from('vibe_tools')
      .insert({
        name: body.name,
        category: body.category,
        cost_model: body.costModel,
        description: body.description,
        website_url: body.websiteUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tool:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ tool });
  } catch (error) {
    console.error('Error in POST /api/admin/tools:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
