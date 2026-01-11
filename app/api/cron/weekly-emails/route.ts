import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cron/weekly-emails
 * 
 * Combined weekly emails cron endpoint that runs both learning and jobs emails.
 * Protected by CRON_SECRET header.
 * 
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 * 
 * This endpoint calls both:
 * - /api/cron/weekly-learning-emails
 * - /api/cron/weekly-jobs-emails
 * 
 * Safe deduplication is handled via dedupe_key in each endpoint:
 * - Learning emails: weekly_learning:YYYY-MM-DD:student_profile_id
 * - Jobs emails: weekly_jobs:YYYY-MM-DD:student_profile_id
 * 
 * Both endpoints use upsert with ignoreDuplicates to prevent duplicate sends.
 */
export async function GET(request: NextRequest) {
  try {
    // Check for secret header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error('CRON_SECRET environment variable not set');
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    // Verify authorization header
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const baseUrl = new URL(request.url).origin;

    // Call both endpoints in parallel
    const [learningResponse, jobsResponse] = await Promise.allSettled([
      fetch(`${baseUrl}/api/cron/weekly-learning-emails`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
        },
      }),
      fetch(`${baseUrl}/api/cron/weekly-jobs-emails`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
        },
      }),
    ]);

    // Parse responses
    let learningResult: any = null;
    let jobsResult: any = null;
    let learningError: string | null = null;
    let jobsError: string | null = null;

    if (learningResponse.status === 'fulfilled') {
      try {
        learningResult = await learningResponse.value.json();
        if (!learningResponse.value.ok) {
          learningError = learningResult.error || 'Unknown error';
        }
      } catch (e) {
        learningError = e instanceof Error ? e.message : 'Failed to parse learning emails response';
      }
    } else {
      learningError = learningResponse.reason?.message || 'Failed to call learning emails endpoint';
    }

    if (jobsResponse.status === 'fulfilled') {
      try {
        jobsResult = await jobsResponse.value.json();
        if (!jobsResponse.value.ok) {
          jobsError = jobsResult.error || 'Unknown error';
        }
      } catch (e) {
        jobsError = e instanceof Error ? e.message : 'Failed to parse jobs emails response';
      }
    } else {
      jobsError = jobsResponse.reason?.message || 'Failed to call jobs emails endpoint';
    }

    // Return combined results
    return NextResponse.json({
      message: 'Weekly emails processed',
      learning: learningResult || { error: learningError },
      jobs: jobsResult || { error: jobsError },
      success: !learningError && !jobsError,
      errors: [learningError, jobsError].filter(Boolean),
    });
  } catch (error) {
    console.error('Error in combined weekly emails cron:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
