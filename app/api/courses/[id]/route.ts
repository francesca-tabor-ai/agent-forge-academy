import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch course details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch course
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get course metadata from course-metadata.ts if available
    // For now, return basic course data
    return NextResponse.json({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnail_url,
      durationWeeks: course.duration_weeks,
      difficultyLevel: course.difficulty_level,
      isPublished: course.is_published,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      // Note: Modules/lessons would be loaded from markdown files
      // "You'll build" and other metadata would come from course-metadata.ts
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
