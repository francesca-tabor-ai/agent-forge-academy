import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  ROLE_CLUSTERS,
  generateJobFingerprint,
  normalizeString,
  classifyJob,
  shouldSkipNextRun,
  type RoleCluster,
} from '@/lib/jobs/ingestion-utils';
import { safeLogger } from '@/lib/utils/redactPII';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Quota limits (hard limits)
const MAX_MONTHLY_REQUESTS = 45; // Hard stop at 45 (below 50 limit)
const ALERT_THRESHOLD = 36; // Alert at 80% (36/45)

// API configuration
const API_PROVIDER = 'apijobs'; // Using APIJobs API
const JOBS_LIMIT = 100; // Max jobs per request
const POSTED_LAST_HOURS = 72; // Only fetch jobs posted in last 72 hours

/**
 * Interface for API job response
 */
interface ApiJob {
  id?: string;
  job_id?: string;
  title: string;
  company?: string;
  company_name?: string;
  location?: string;
  job_location?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  description?: string;
  job_description?: string;
  job_apply_link?: string;
  apply_link?: string;
  job_employment_type?: string;
  employment_type?: string;
  job_is_remote?: boolean;
  is_remote?: boolean;
  job_posting_timestamp?: number;
  [key: string]: any;
}

/**
 * Interface for database job
 */
interface DatabaseJob {
  title: string;
  company: string;
  description: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location: string | null;
  is_remote: boolean;
  salary_range: string | null;
  skills: string[];
  external_url: string | null;
  external_job_id: string | null;
  job_fingerprint: string;
  first_seen_at: string;
  last_seen_at: string;
  source_cluster: string;
  is_active: boolean;
  status: 'new';
}

/**
 * Fetch jobs from APIJobs API
 * Makes exactly ONE request with broad query
 */
async function fetchJobsFromAPI(
  query: string,
  limit: number = JOBS_LIMIT
): Promise<ApiJob[]> {
  const apiKey = process.env.APIJOBS_API_KEY;

  if (!apiKey) {
    throw new Error('APIJOBS_API_KEY not found in environment variables');
  }

  // Build query with date filter (last 72 hours if API supports it)
  const params = new URLSearchParams({
    query,
    page: '1',
    limit: limit.toString(),
    // Note: Add date filter if API supports it
    // posted_after: new Date(Date.now() - POSTED_LAST_HOURS * 60 * 60 * 1000).toISOString(),
  });

  const url = `https://api.apijobs.dev/v1/jobs?${params}`;

  safeLogger.info('Fetching jobs from APIJobs API', {
    query,
    limit,
    url: url.replace(apiKey, '***'),
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Agent-Forge-Academy/1.0',
    },
    signal: AbortSignal.timeout(30000), // 30 second timeout
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `APIJobs API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`
    );
  }

  const data = await response.json();
  const jobs = data.jobs || data.data || [];

  // Filter by posted date if timestamp available (client-side filter)
  const cutoffTime = Date.now() - POSTED_LAST_HOURS * 60 * 60 * 1000;
  const recentJobs = jobs.filter((job: ApiJob) => {
    if (job.job_posting_timestamp) {
      // Convert timestamp to milliseconds if it's in seconds
      const timestamp =
        job.job_posting_timestamp > 1000000000000
          ? job.job_posting_timestamp
          : job.job_posting_timestamp * 1000;
      return timestamp >= cutoffTime;
    }
    // If no timestamp, include it (assume recent)
    return true;
  });

  safeLogger.info('Fetched jobs from APIJobs API', {
    total: jobs.length,
    recent: recentJobs.length,
  });

  return recentJobs.slice(0, limit);
}

/**
 * Transform API job to database format
 */
function transformJob(
  apiJob: ApiJob,
  sourceCluster: RoleCluster
): DatabaseJob | null {
  try {
    const title = apiJob.title?.trim();
    const company = (apiJob.company_name || apiJob.company || 'Unknown Company').trim();
    const description = (apiJob.job_description || apiJob.description || '').trim();

    if (!title || !company || !description) {
      return null;
    }

    // Normalize location
    let location: string | null = null;
    if (apiJob.job_location) {
      location = apiJob.job_location;
    } else if (apiJob.location) {
      location = apiJob.location;
    } else {
      const parts: string[] = [];
      if (apiJob.job_city) parts.push(apiJob.job_city);
      if (apiJob.job_state) parts.push(apiJob.job_state);
      if (apiJob.job_country) parts.push(apiJob.job_country);
      if (parts.length > 0) {
        location = parts.join(', ');
      }
    }

    if (!location && (apiJob.job_is_remote || apiJob.is_remote)) {
      location = 'Remote';
    }

    const isRemote = apiJob.job_is_remote || apiJob.is_remote || false;
    const externalJobId = apiJob.id || apiJob.job_id || null;
    const externalUrl = apiJob.job_apply_link || apiJob.apply_link || null;

    // Generate fingerprint
    const fingerprint = generateJobFingerprint(title, company, location);

    // Infer job type
    const employmentType = apiJob.job_employment_type || apiJob.employment_type || '';
    let jobType: DatabaseJob['job_type'] = 'full_time';
    if (employmentType.toLowerCase().includes('part')) {
      jobType = 'part_time';
    } else if (employmentType.toLowerCase().includes('contract') || employmentType.toLowerCase().includes('freelance')) {
      jobType = 'contract';
    } else if (employmentType.toLowerCase().includes('intern')) {
      jobType = 'internship';
    }

    // Infer experience level
    const combined = `${title} ${description}`.toLowerCase();
    let experienceLevel: DatabaseJob['experience_level'] = 'mid';
    if (
      combined.includes('senior') ||
      combined.includes('lead') ||
      combined.includes('principal') ||
      combined.includes('architect') ||
      combined.includes('staff')
    ) {
      if (combined.includes('executive') || combined.includes('vp') || combined.includes('c-level')) {
        experienceLevel = 'executive';
      } else if (combined.includes('lead') || combined.includes('principal') || combined.includes('staff')) {
        experienceLevel = 'lead';
      } else {
        experienceLevel = 'senior';
      }
    } else if (
      combined.includes('junior') ||
      combined.includes('entry') ||
      combined.includes('graduate') ||
      combined.includes('intern') ||
      combined.includes('associate')
    ) {
      experienceLevel = 'entry';
    }

    // Extract basic skills (simple keyword matching)
    const skills: string[] = [];
    const descLower = description.toLowerCase();
    const skillKeywords = [
      'python', 'javascript', 'typescript', 'react', 'node', 'ai', 'machine learning',
      'llm', 'agent', 'mlops', 'data science', 'tensorflow', 'pytorch',
    ];
    skillKeywords.forEach((keyword) => {
      if (descLower.includes(keyword)) {
        skills.push(keyword);
      }
    });

    const now = new Date().toISOString();

    return {
      title,
      company,
      description,
      job_type: jobType,
      experience_level: experienceLevel,
      location,
      is_remote: isRemote,
      salary_range: null, // Can be enhanced later
      skills: skills.slice(0, 20), // Limit to 20 skills
      external_url: externalUrl,
      external_job_id: externalJobId,
      job_fingerprint: fingerprint,
      first_seen_at: now,
      last_seen_at: now,
      source_cluster: sourceCluster,
      is_active: true,
      status: 'new',
    };
  } catch (error: any) {
    safeLogger.error('Error transforming job', { error: error.message });
    return null;
  }
}

/**
 * Upsert jobs with fingerprint-based deduplication
 */
async function upsertJobs(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  jobs: DatabaseJob[]
): Promise<{ inserted: number; updated: number; errors: number }> {
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const job of jobs) {
    try {
      // Check if job exists by fingerprint
      const { data: existing } = await supabase
        .from('jobs')
        .select('id, first_seen_at')
        .eq('job_fingerprint', job.job_fingerprint)
        .limit(1)
        .single();

      if (existing) {
        // Update existing job (update last_seen_at and other fields)
        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            ...job,
            first_seen_at: existing.first_seen_at, // Preserve original first_seen_at
            last_seen_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          safeLogger.error('Error updating job', {
            fingerprint: job.job_fingerprint,
            error: updateError.message,
          });
          errors++;
        } else {
          updated++;
        }
      } else {
        // Insert new job
        const { error: insertError } = await supabase.from('jobs').insert(job);

        if (insertError) {
          safeLogger.error('Error inserting job', {
            fingerprint: job.job_fingerprint,
            error: insertError.message,
          });
          errors++;
        } else {
          inserted++;
        }
      }
    } catch (error: any) {
      safeLogger.error('Exception processing job', {
        fingerprint: job.job_fingerprint,
        error: error.message,
      });
      errors++;
    }
  }

  return { inserted, updated, errors };
}

/**
 * GET /api/cron/fetch-jobs
 * 
 * Low-quota job ingestion cron endpoint.
 * Protected by CRON_SECRET header.
 * 
 * Process:
 * 1. Check quota (hard stop at 45/month)
 * 2. Check no-op safeguard (skip if last run had < 3 new jobs)
 * 3. Get next cluster in rotation
 * 4. Make exactly ONE API request
 * 5. Process jobs with fingerprinting and deduplication
 * 6. Classify jobs (post-processing)
 * 7. Update state and log run
 */
export async function GET(request: NextRequest) {
  const runId = `fetch-jobs-${Date.now()}-${Math.random().toString(36).substring(7)}`;
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

    // Get ingestion state
    const { data: state, error: stateError } = await supabase
      .from('job_ingestion_state')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (stateError || !state) {
      safeLogger.error(`[${runId}] Failed to fetch ingestion state`, {
        error: stateError?.message,
      });
      return NextResponse.json(
        { error: 'Failed to fetch ingestion state' },
        { status: 500 }
      );
    }

    // Check monthly quota reset (reset on new month)
    const today = new Date();
    const resetDate = new Date(state.monthly_reset_date);
    let monthlyCount = state.monthly_request_count;
    let newResetDate = state.monthly_reset_date;

    if (
      today.getMonth() !== resetDate.getMonth() ||
      today.getFullYear() !== resetDate.getFullYear()
    ) {
      // New month - reset counter
      monthlyCount = 0;
      newResetDate = today.toISOString().split('T')[0];
      safeLogger.info(`[${runId}] Monthly quota reset`, {
        oldCount: state.monthly_request_count,
        newDate: newResetDate,
      });
    }

    // Hard quota check
    if (monthlyCount >= MAX_MONTHLY_REQUESTS) {
      safeLogger.warn(`[${runId}] Monthly quota exceeded`, {
        count: monthlyCount,
        limit: MAX_MONTHLY_REQUESTS,
      });
      return NextResponse.json(
        {
          skipped: true,
          reason: 'monthly_quota_exceeded',
          message: `Monthly quota exceeded (${monthlyCount}/${MAX_MONTHLY_REQUESTS})`,
          monthlyCount,
        },
        { status: 429 }
      );
    }

    // Alert if approaching limit
    if (monthlyCount >= ALERT_THRESHOLD) {
      safeLogger.warn(`[${runId}] Approaching monthly quota limit`, {
        count: monthlyCount,
        threshold: ALERT_THRESHOLD,
        limit: MAX_MONTHLY_REQUESTS,
      });
    }

    // No-op safeguard: skip if last run had < 3 new jobs
    if (state.should_skip_next_run || state.last_run_new_jobs_count < 3) {
      safeLogger.info(`[${runId}] Skipping run due to low yield`, {
        lastRunNewJobs: state.last_run_new_jobs_count,
        shouldSkip: state.should_skip_next_run,
      });

      // Log the skipped run
      await supabase.from('job_ingestion_runs').insert({
        run_at: new Date().toISOString(),
        cluster_name: state.last_run_cluster || 'none',
        query_used: 'N/A (skipped)',
        api_requests_made: 0,
        jobs_fetched: 0,
        jobs_new: 0,
        jobs_updated: 0,
        jobs_errors: 0,
        monthly_request_count_after: monthlyCount,
        was_skipped: true,
        skip_reason: `Low yield from previous run (${state.last_run_new_jobs_count} new jobs)`,
      });

      // Clear skip flag for next time
      await supabase
        .from('job_ingestion_state')
        .update({
          should_skip_next_run: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', '00000000-0000-0000-0000-000000000000');

      return NextResponse.json({
        skipped: true,
        reason: 'low_yield',
        message: `Skipped run due to low yield (${state.last_run_new_jobs_count} new jobs in last run)`,
        lastRunNewJobs: state.last_run_new_jobs_count,
      });
    }

    // Get next cluster in rotation
    const clusterIndex = state.current_cluster_index % ROLE_CLUSTERS.length;
    const cluster = ROLE_CLUSTERS[clusterIndex];
    const nextClusterIndex = (clusterIndex + 1) % ROLE_CLUSTERS.length;

    safeLogger.info(`[${runId}] Starting job ingestion`, {
      cluster: cluster.cluster,
      query: cluster.query,
      monthlyCount,
      nextClusterIndex,
    });

    // Make exactly ONE API request
    const apiJobs = await fetchJobsFromAPI(cluster.query, JOBS_LIMIT);

    // Transform jobs
    const dbJobs = apiJobs
      .map((job) => transformJob(job, cluster.cluster))
      .filter((job): job is DatabaseJob => job !== null);

    safeLogger.info(`[${runId}] Transformed jobs`, {
      fetched: apiJobs.length,
      valid: dbJobs.length,
    });

    // Upsert with deduplication
    const result = await upsertJobs(supabase, dbJobs);

    // Update ingestion state
    const newMonthlyCount = monthlyCount + 1;
    const shouldSkipNext = shouldSkipNextRun(result.inserted);

    await supabase
      .from('job_ingestion_state')
      .update({
        current_cluster_index: nextClusterIndex,
        monthly_request_count: newMonthlyCount,
        monthly_reset_date: newResetDate,
        last_run_at: new Date().toISOString(),
        last_run_cluster: cluster.cluster,
        last_run_new_jobs_count: result.inserted,
        should_skip_next_run: shouldSkipNext,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000000');

    // Log the run
    await supabase.from('job_ingestion_runs').insert({
      run_at: new Date().toISOString(),
      cluster_name: cluster.cluster,
      query_used: cluster.query,
      api_requests_made: 1, // Always exactly 1
      jobs_fetched: apiJobs.length,
      jobs_new: result.inserted,
      jobs_updated: result.updated,
      jobs_errors: result.errors,
      monthly_request_count_after: newMonthlyCount,
      was_skipped: false,
    });

    const duration = Date.now() - startTime;

    safeLogger.info(`[${runId}] Job ingestion completed`, {
      duration: `${duration}ms`,
      cluster: cluster.cluster,
      fetched: apiJobs.length,
      new: result.inserted,
      updated: result.updated,
      errors: result.errors,
      monthlyCount: newMonthlyCount,
      willSkipNext: shouldSkipNext,
    });

    return NextResponse.json({
      success: true,
      message: 'Job ingestion completed',
      cluster: cluster.cluster,
      query: cluster.query,
      stats: {
        fetched: apiJobs.length,
        new: result.inserted,
        updated: result.updated,
        errors: result.errors,
      },
      quota: {
        monthlyCount: newMonthlyCount,
        limit: MAX_MONTHLY_REQUESTS,
        remaining: MAX_MONTHLY_REQUESTS - newMonthlyCount,
      },
      nextRun: {
        clusterIndex: nextClusterIndex,
        cluster: ROLE_CLUSTERS[nextClusterIndex].cluster,
        willSkip: shouldSkipNext,
      },
      duration: `${duration}ms`,
    });
  } catch (error: any) {
    safeLogger.error(`[${runId}] Job ingestion failed`, {
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
