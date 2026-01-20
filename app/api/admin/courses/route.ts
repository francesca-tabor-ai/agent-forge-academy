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
    const { data: courses, error } = await supabase
      .from('startup_courses')
      .select(`
        id,
        startup_id,
        title,
        level,
        price,
        access_tier,
        description,
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

    return NextResponse.json({ courses: courses || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/courses:', error);
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

    const { data: course, error } = await supabase
      .from('startup_courses')
      .insert({
        startup_id: body.startupId,
        title: body.title,
        level: body.level,
        price: body.price,
        access_tier: body.accessTier,
        description: body.description,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error in POST /api/admin/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
