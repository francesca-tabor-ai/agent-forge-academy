#!/usr/bin/env tsx
/**
 * Sync Jobs from External API to Database
 * 
 * Fetches jobs from external APIs (JSearch/RapidAPI or APIJobs) and syncs them to the database.
 * 
 * Usage:
 *   npm run sync:jobs
 *   or
 *   tsx scripts/sync-jobs-from-api.ts
 * 
 * Environment Variables Required:
 *   - RAPID_API_KEY (for JSearch API via RapidAPI)
 *   - APIJOBS_API_KEY (for APIJobs API)
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 * 
 * Options:
 *   --api=jsearch|apijobs (default: jsearch)
 *   --query="software engineer" (search query)
 *   --location="San Francisco" (optional location filter)
 *   --remote (fetch remote jobs only)
 *   --limit=50 (max jobs to fetch, default: 50)
 *   --dry-run (don't actually insert, just show what would be inserted)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Types
type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
type ApiProvider = 'jsearch' | 'apijobs';

interface ApiJob {
  job_id?: string;
  id?: string;
  title: string;
  company_name?: string;
  company?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_location?: string;
  location?: string;
  job_description?: string;
  description?: string;
  job_employment_type?: string;
  employment_type?: string;
  job_apply_link?: string;
  apply_link?: string;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
  };
  job_required_skills?: string[];
  job_required_experience?: string[];
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_salary_period?: string;
  job_posting_timestamp?: number;
  job_is_remote?: boolean;
  is_remote?: boolean;
  [key: string]: any;
}

interface DatabaseJob {
  title: string;
  company: string;
  description: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  location: string | null;
  is_remote: boolean;
  salary_range: string | null;
  skills: string[];
  external_url: string | null;
  is_active: boolean;
  status: 'new';
}

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (key: string, defaultValue?: string): string | undefined => {
  const arg = args.find(a => a.startsWith(`--${key}=`));
  return arg ? arg.split('=')[1] : (args.includes(`--${key}`) ? 'true' : defaultValue);
};

const apiProvider = (getArg('api', 'jsearch') as ApiProvider) || 'jsearch';
const query = getArg('query', 'software engineer');
const location = getArg('location');
const remote = getArg('remote') === 'true';
const limit = parseInt(getArg('limit', '50') || '50', 10);
const dryRun = args.includes('--dry-run');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Extract skills from job description and highlights
 */
function extractSkills(job: ApiJob): string[] {
  const skills: Set<string> = new Set();

  // From job_required_skills
  if (job.job_required_skills && Array.isArray(job.job_required_skills)) {
    job.job_required_skills.forEach(skill => {
      if (typeof skill === 'string' && skill.trim()) {
        skills.add(skill.trim().toLowerCase());
      }
    });
  }

  // From job_highlights.Qualifications
  if (job.job_highlights?.Qualifications) {
    job.job_highlights.Qualifications.forEach((qual: string) => {
      // Extract common tech skills
      const techKeywords = [
        'javascript', 'typescript', 'python', 'java', 'react', 'node', 'vue', 'angular',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql',
        'machine learning', 'ai', 'tensorflow', 'pytorch', 'data science', 'analytics',
        'git', 'ci/cd', 'agile', 'scrum', 'api', 'rest', 'graphql'
      ];
      techKeywords.forEach(keyword => {
        if (qual.toLowerCase().includes(keyword)) {
          skills.add(keyword);
        }
      });
    });
  }

  // Extract from description (basic keyword matching)
  const description = (job.job_description || job.description || '').toLowerCase();
  const commonSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
    'react', 'vue', 'angular', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible',
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'machine learning', 'deep learning', 'ai', 'nlp', 'computer vision',
    'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
    'git', 'jenkins', 'github actions', 'ci/cd', 'agile', 'scrum'
  ];

  commonSkills.forEach(skill => {
    if (description.includes(skill)) {
      skills.add(skill);
    }
  });

  return Array.from(skills).slice(0, 20); // Limit to 20 skills
}

/**
 * Map employment type to database job_type
 */
function mapJobType(employmentType?: string): JobType {
  if (!employmentType) return 'full_time';

  const type = employmentType.toLowerCase();
  if (type.includes('full') || type.includes('permanent')) return 'full_time';
  if (type.includes('part')) return 'part_time';
  if (type.includes('contract') || type.includes('freelance')) return 'contract';
  if (type.includes('intern')) return 'internship';
  if (type.includes('freelance')) return 'freelance';

  return 'full_time'; // Default
}

/**
 * Infer experience level from job title and description
 */
function inferExperienceLevel(title: string, description: string): ExperienceLevel {
  const text = `${title} ${description}`.toLowerCase();

  // Senior/Lead indicators
  if (
    text.includes('senior') ||
    text.includes('lead') ||
    text.includes('principal') ||
    text.includes('architect') ||
    text.includes('staff') ||
    text.includes('director') ||
    text.includes('head of')
  ) {
    if (text.includes('executive') || text.includes('vp') || text.includes('c-level')) {
      return 'executive';
    }
    if (text.includes('lead') || text.includes('principal') || text.includes('staff')) {
      return 'lead';
    }
    return 'senior';
  }

  // Entry level indicators
  if (
    text.includes('junior') ||
    text.includes('entry') ||
    text.includes('graduate') ||
    text.includes('intern') ||
    text.includes('associate') ||
    (text.includes('0-2') || text.includes('1-2') || text.includes('0-1'))
  ) {
    return 'entry';
  }

  // Mid level (default if not clearly entry or senior)
  return 'mid';
}

/**
 * Format salary range
 */
function formatSalaryRange(job: ApiJob): string | null {
  const min = job.job_min_salary;
  const max = job.job_max_salary;
  const currency = job.job_salary_currency || 'USD';
  const period = job.job_salary_period || 'year';

  if (!min && !max) return null;

  const formatCurrency = (amount: number) => {
    if (currency === 'USD') return `$${amount.toLocaleString()}`;
    if (currency === 'GBP') return `£${amount.toLocaleString()}`;
    if (currency === 'EUR') return `€${amount.toLocaleString()}`;
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatPeriod = (p: string) => {
    if (p.includes('year') || p.includes('annual')) return 'year';
    if (p.includes('month')) return 'month';
    if (p.includes('hour')) return 'hour';
    return p;
  };

  if (min && max) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}/${formatPeriod(period)}`;
  }
  if (min) {
    return `${formatCurrency(min)}+/${formatPeriod(period)}`;
  }
  if (max) {
    return `Up to ${formatCurrency(max)}/${formatPeriod(period)}`;
  }

  return null;
}

/**
 * Normalize location string
 */
function normalizeLocation(job: ApiJob): string | null {
  if (job.job_location) return job.job_location;
  if (job.location) return job.location;

  const parts: string[] = [];
  if (job.job_city) parts.push(job.job_city);
  if (job.job_state) parts.push(job.job_state);
  if (job.job_country) parts.push(job.job_country);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  if (job.job_is_remote || job.is_remote) {
    return 'Remote';
  }

  return null;
}

/**
 * Transform API job to database format
 */
function transformJob(apiJob: ApiJob): DatabaseJob | null {
  try {
    const title = apiJob.title?.trim();
    const company = (apiJob.company_name || apiJob.company || 'Unknown Company').trim();
    const description = (apiJob.job_description || apiJob.description || '').trim();

    if (!title || !company || !description) {
      console.warn(`⚠️  Skipping job: missing required fields (title, company, or description)`);
      return null;
    }

    const location = normalizeLocation(apiJob);
    const isRemote = apiJob.job_is_remote || apiJob.is_remote || false;
    const employmentType = apiJob.job_employment_type || apiJob.employment_type;
    const jobType = mapJobType(employmentType);
    const experienceLevel = inferExperienceLevel(title, description);
    const skills = extractSkills(apiJob);
    const salaryRange = formatSalaryRange(apiJob);
    const externalUrl = apiJob.job_apply_link || apiJob.apply_link || null;

    return {
      title,
      company,
      description,
      job_type: jobType,
      experience_level: experienceLevel,
      location,
      is_remote: isRemote,
      salary_range: salaryRange,
      skills,
      external_url: externalUrl,
      is_active: true,
      status: 'new',
    };
  } catch (error: any) {
    console.error(`❌ Error transforming job: ${error.message}`);
    return null;
  }
}

/**
 * Fetch jobs from JSearch API (via RapidAPI)
 */
async function fetchJobsFromJSearch(
  query: string,
  location?: string,
  remote?: boolean,
  limit: number = 50
): Promise<ApiJob[]> {
  const rapidApiKey = process.env.RAPID_API_KEY;

  if (!rapidApiKey) {
    throw new Error('RAPID_API_KEY not found in environment variables');
  }

  const params = new URLSearchParams({
    query,
    page: '1',
    num_pages: '1',
    ...(location && { location }),
    ...(remote && { remote_jobs_only: 'true' }),
  });

  const url = `https://jsearch.p.rapidapi.com/search?${params}`;

  console.log(`📡 Fetching jobs from JSearch API...`);
  console.log(`   Query: ${query}`);
  if (location) console.log(`   Location: ${location}`);
  if (remote) console.log(`   Remote only: true`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`JSearch API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const jobs = data.data || [];

  console.log(`✅ Fetched ${jobs.length} jobs from JSearch API`);
  return jobs.slice(0, limit);
}

/**
 * Fetch jobs from APIJobs API
 */
async function fetchJobsFromAPIJobs(
  query: string,
  location?: string,
  remote?: boolean,
  limit: number = 50
): Promise<ApiJob[]> {
  const apiKey = process.env.APIJOBS_API_KEY;

  if (!apiKey) {
    throw new Error('APIJOBS_API_KEY not found in environment variables');
  }

  const params = new URLSearchParams({
    query,
    page: '1',
    limit: limit.toString(),
    ...(location && { location }),
    ...(remote && { remote: 'true' }),
  });

  const url = `https://api.apijobs.dev/v1/jobs?${params}`;

  console.log(`📡 Fetching jobs from APIJobs API...`);
  console.log(`   Query: ${query}`);
  if (location) console.log(`   Location: ${location}`);
  if (remote) console.log(`   Remote only: true`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`APIJobs API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const jobs = data.jobs || data.data || [];

  console.log(`✅ Fetched ${jobs.length} jobs from APIJobs API`);
  return jobs.slice(0, limit);
}

/**
 * Upsert jobs to database
 * Uses external_url as unique identifier if available, otherwise title+company
 */
async function upsertJobs(jobs: DatabaseJob[], dryRun: boolean = false): Promise<{ inserted: number; updated: number; errors: number }> {
  if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - No database changes will be made\n');
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company}`);
      console.log(`   Type: ${job.job_type}, Level: ${job.experience_level}`);
      console.log(`   Location: ${job.location || 'N/A'}, Remote: ${job.is_remote}`);
      console.log(`   Skills: ${job.skills.length > 0 ? job.skills.slice(0, 5).join(', ') : 'None'}`);
      console.log(`   URL: ${job.external_url || 'N/A'}\n`);
    });
    return { inserted: jobs.length, updated: 0, errors: 0 };
  }

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  console.log(`\n💾 Upserting ${jobs.length} jobs to database...\n`);

  for (const job of jobs) {
    try {
      // Check if job already exists by external_url (if available) or title+company
      let existingJob = null;

      if (job.external_url) {
        const { data: urlMatch } = await supabase
          .from('jobs')
          .select('id')
          .eq('external_url', job.external_url)
          .limit(1)
          .single();

        if (urlMatch) {
          existingJob = urlMatch;
        }
      }

      // If not found by URL, check by title+company
      if (!existingJob) {
        const { data: titleMatch } = await supabase
          .from('jobs')
          .select('id')
          .eq('title', job.title)
          .eq('company', job.company)
          .limit(1)
          .single();

        if (titleMatch) {
          existingJob = titleMatch;
        }
      }

      if (existingJob) {
        // Update existing job
        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            ...job,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingJob.id);

        if (updateError) {
          console.error(`❌ Error updating job "${job.title}" at ${job.company}:`, updateError.message);
          errors++;
        } else {
          updated++;
          console.log(`🔄 Updated: ${job.title} at ${job.company}`);
        }
      } else {
        // Insert new job
        const { error: insertError } = await supabase
          .from('jobs')
          .insert(job);

        if (insertError) {
          console.error(`❌ Error inserting job "${job.title}" at ${job.company}:`, insertError.message);
          errors++;
        } else {
          inserted++;
          console.log(`✅ Inserted: ${job.title} at ${job.company}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Exception processing job "${job.title}":`, error.message);
      errors++;
    }
  }

  return { inserted, updated, errors };
}

/**
 * Main sync function
 */
async function main() {
  console.log('🚀 Job Sync from External API');
  console.log('='.repeat(50));
  console.log(`API Provider: ${apiProvider}`);
  console.log(`Query: ${query}`);
  if (location) console.log(`Location: ${location}`);
  if (remote) console.log(`Remote only: true`);
  console.log(`Limit: ${limit}`);
  console.log(`Dry run: ${dryRun ? 'Yes' : 'No'}`);
  console.log('='.repeat(50));

  try {
    // Fetch jobs from API
    let apiJobs: ApiJob[];
    if (apiProvider === 'jsearch') {
      apiJobs = await fetchJobsFromJSearch(query, location, remote, limit);
    } else if (apiProvider === 'apijobs') {
      apiJobs = await fetchJobsFromAPIJobs(query, location, remote, limit);
    } else {
      throw new Error(`Unknown API provider: ${apiProvider}`);
    }

    if (apiJobs.length === 0) {
      console.log('\n⚠️  No jobs found from API');
      return;
    }

    // Transform jobs
    console.log(`\n🔄 Transforming ${apiJobs.length} jobs...`);
    const dbJobs = apiJobs
      .map(transformJob)
      .filter((job): job is DatabaseJob => job !== null);

    console.log(`✅ Transformed ${dbJobs.length} jobs (${apiJobs.length - dbJobs.length} skipped)`);

    if (dbJobs.length === 0) {
      console.log('\n⚠️  No valid jobs to insert');
      return;
    }

    // Upsert to database
    const result = await upsertJobs(dbJobs, dryRun);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Sync Summary');
    console.log('='.repeat(50));
    console.log(`Total fetched: ${apiJobs.length}`);
    console.log(`Valid jobs: ${dbJobs.length}`);
    if (!dryRun) {
      console.log(`Inserted: ${result.inserted}`);
      console.log(`Updated: ${result.updated}`);
      console.log(`Errors: ${result.errors}`);
    } else {
      console.log(`Would insert/update: ${result.inserted}`);
    }
    console.log('='.repeat(50));

    if (result.errors > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Sync failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { fetchJobsFromJSearch, fetchJobsFromAPIJobs, transformJob, upsertJobs };
