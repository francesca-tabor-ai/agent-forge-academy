import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { safeLogger } from '@/lib/utils/redactPII';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Delete jobs older than 30 days
const JOB_RETENTION_DAYS = 30;

/**
 * GET /api/cron/cleanup-old-jobs
 * 
 * Cron endpoint to automatically delete jobs older than 30 days.
 * Protected by CRON_SECRET header.
 * 
 * Process:
 * 1. Calculate cutoff date (30 days ago)
 * 2. Delete jobs where created_at < cutoff date
 * 3. Log deletion statistics
 */
export async function GET(request: NextRequest) {
  const runId = `cleanup-old-jobs-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();

  try {
    // Check for secret header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      safeLogger.error(`[${runId}] CRON_SECRET not configured`);
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - JOB_RETENTION_DAYS);
    const cutoffDateISO = cutoffDate.toISOString();

    safeLogger.info(`[${runId}] Starting job cleanup`, {
      cutoffDate: cutoffDateISO,
      retentionDays: JOB_RETENTION_DAYS,
    });

    // Delete jobs older than 30 days
    const { data: deletedJobs, error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .lt('created_at', cutoffDateISO)
      .select('id');

    if (deleteError) {
      safeLogger.error(`[${runId}] Failed to delete old jobs`, {
        error: deleteError.message,
      });
      return NextResponse.json(
        { error: 'Failed to delete jobs', message: deleteError.message },
        { status: 500 }
      );
    }

    const deletedCount = deletedJobs?.length || 0;
    const duration = Date.now() - startTime;

    safeLogger.info(`[${runId}] Job cleanup completed`, {
      duration: `${duration}ms`,
      deletedCount,
      cutoffDate: cutoffDateISO,
    });

    return NextResponse.json({
      success: true,
      message: 'Job cleanup completed',
      stats: {
        deleted: deletedCount,
        cutoffDate: cutoffDateISO,
        retentionDays: JOB_RETENTION_DAYS,
      },
      duration: `${duration}ms`,
    });
  } catch (error: any) {
    safeLogger.error(`[${runId}] Job cleanup failed`, {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
