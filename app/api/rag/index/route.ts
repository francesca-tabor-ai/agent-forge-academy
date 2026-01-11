/**
 * API endpoint to trigger lesson indexing
 * This should be called manually or via a cron job to index lessons
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { indexAllLessons, indexCourse, indexLesson } from '@/lib/rag/indexLessons';
import { loadAllLessons, loadLessonBySlug } from '@/lib/lessons';

export async function POST(request: NextRequest) {
  try {
    // Check authentication (should be admin or service role)
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // For now, allow any authenticated user (in production, check for admin role)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, courseSlug, lessonSlug, options } = body;

    switch (action) {
      case 'index_all':
        // Index all lessons across all courses
        const allResults = await indexAllLessons(options || {});
        return NextResponse.json({
          success: true,
          results: allResults,
          totalCourses: allResults.length,
          totalChunks: allResults.reduce((sum, r) => sum + r.totalChunks, 0),
        });

      case 'index_course':
        // Index all lessons in a specific course
        if (!courseSlug) {
          return NextResponse.json({ error: 'courseSlug is required' }, { status: 400 });
        }
        const courseResults = await indexCourse(courseSlug, options || {});
        return NextResponse.json({
          success: true,
          courseSlug,
          results: courseResults,
          totalLessons: courseResults.length,
          totalChunks: courseResults.reduce((sum, r) => sum + r.chunkCount, 0),
        });

      case 'index_lesson':
        // Index a single lesson
        if (!courseSlug || !lessonSlug) {
          return NextResponse.json(
            { error: 'courseSlug and lessonSlug are required' },
            { status: 400 }
          );
        }
        const lesson = loadLessonBySlug(lessonSlug, undefined, courseSlug);
        if (!lesson) {
          return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }
        const chunkCount = await indexLesson(lesson, options || {});
        return NextResponse.json({
          success: true,
          courseSlug,
          lessonSlug,
          chunkCount,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error indexing lessons:', error);
    return NextResponse.json(
      { error: 'Failed to index lessons', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
