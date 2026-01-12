import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/lessons/[lessonId]/complete
 * Mark a lesson as completed for the current user
 * 
 * Idempotent: Safe to call multiple times - will not create duplicates
 * 
 * Params:
 *   lessonId: string (lesson slug)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = params;

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Missing lessonId parameter' },
        { status: 400 }
      );
    }

    // Check if completion already exists
    const { data: existingCompletion } = await supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    if (existingCompletion) {
      // Already completed - return existing record (idempotent)
      return NextResponse.json({
        completed: true,
        completedAt: existingCompletion.completed_at,
      });
    }

    // Create new completion record
    const { data: newCompletion, error: insertError } = await supabase
      .from('lesson_completions')
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // If it's a unique constraint violation, the completion already exists
      if (insertError.code === '23505') {
        // Fetch the existing record
        const { data: existing } = await supabase
          .from('lesson_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single();

        if (existing) {
          return NextResponse.json({
            completed: true,
            completedAt: existing.completed_at,
          });
        }
      }

      console.error('Error creating lesson completion:', insertError);
      return NextResponse.json(
        { error: 'Failed to mark lesson as completed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      completed: true,
      completedAt: newCompletion.completed_at,
    });
  } catch (error) {
    console.error('Error in lesson completion API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lessons/[lessonId]/complete
 * Check if a lesson is completed for the current user
 * 
 * Params:
 *   lessonId: string (lesson slug)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = params;

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Missing lessonId parameter' },
        { status: 400 }
      );
    }

    // Check if completion exists
    const { data: completion, error } = await supabase
      .from('lesson_completions')
      .select('completed_at')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No completion found
        return NextResponse.json({ completed: false });
      }
      console.error('Error fetching lesson completion:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lesson completion status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      completed: true,
      completedAt: completion.completed_at,
    });
  } catch (error) {
    console.error('Error in lesson completion API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
