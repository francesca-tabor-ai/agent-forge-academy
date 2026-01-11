import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateJobMatch, type Job, determineJobStatus } from '@/lib/jobs/matching';
import { getStudentDataForMatching } from '@/lib/jobs/student-data-cache';

/**
 * GET /api/cron/weekly-jobs-emails
 * 
 * Weekly cron endpoint to enqueue job opportunity emails for students.
 * Protected by CRON_SECRET header.
 * 
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 * 
 * Process:
 * 1. Find students with weekly_jobs_emails_enabled = true
 * 2. For each student, calculate job matches
 * 3. Select:
 *    - 1 "Top Match" (highest score, status recommended/unlocked/new)
 *    - 2 "Near Miss" roles (good score, minimal missing skills)
 *    - 1 "Skill gap of the week" (most common missing skill across top roles)
 * 4. Build payload and enqueue to email_outbox
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

    const supabase = createServerSupabaseClient();

    // Find students with weekly jobs emails enabled
    const { data: studentProfiles, error: studentsError } = await supabase
      .from('student_profiles')
      .select('id, profile_id, weekly_jobs_emails_enabled')
      .eq('weekly_jobs_emails_enabled', true);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    if (!studentProfiles || studentProfiles.length === 0) {
      return NextResponse.json({
        message: 'No students with jobs emails enabled',
        enqueued: 0,
      });
    }

    // Get profile IDs and fetch user data separately
    const profileIds = studentProfiles.map(sp => sp.profile_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id')
      .in('id', profileIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    // Get user IDs and fetch user data
    const userIds = profiles?.map(p => p.user_id).filter(Boolean) || [];
    
    // Fetch users using admin API
    let userMap = new Map();
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        // Continue without user data - we'll use email as fallback
      } else {
        userMap = new Map(usersData?.users?.map(u => [u.id, u]) || []);
      }
    }

    // Create a map for quick lookups
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    let enqueued = 0;
    const errors: string[] = [];

    // Process each student
    for (const studentProfile of studentProfiles) {
      try {
        const profile = profileMap.get(studentProfile.profile_id);
        if (!profile) continue;

        const user = userMap.get(profile.user_id);
        const studentName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student';

        // Get user email for sending
        const userEmail = user?.email;
        if (!userEmail) {
          // Skip if no email address
          continue;
        }

        // Fetch student data for matching (same logic as /api/jobs)
        const studentData = await getStudentDataForMatching(supabase, studentProfile.id);

        // Fetch all active jobs (same logic as /api/jobs)
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (jobsError || !jobs || jobs.length === 0) {
          // Skip students if no jobs available
          continue;
        }

        // Calculate matching scores for all jobs (same logic as /api/jobs)
        const jobsWithScores = (jobs || []).map((job: any) => {
          const jobData: Job = {
            id: job.id,
            skills: (job.skills as string[]) || [],
            recommended_for_courses: (job.recommended_for_courses as string[]) || [],
            experience_level: job.experience_level,
          };

          const matchResult = calculateJobMatch(
            jobData,
            studentData.studentProfile,
            studentData.enrollments,
            studentData.portfolioProjects
          );

          return {
            id: job.id,
            title: job.title,
            company: job.company,
            description: job.description,
            job_type: job.job_type,
            experience_level: job.experience_level,
            location: job.location,
            is_remote: job.is_remote,
            salary_range: job.salary_range,
            status: matchResult.status,
            matching_score: matchResult.score0to100,
            skills: jobData.skills,
            skills_missing: matchResult.missingSkills,
            recommended_for_courses: job.recommended_for_courses || [],
            external_url: job.external_url,
            application_deadline: job.application_deadline,
          };
        });

        // Filter to statuses: recommended, unlocked, new
        // Sort by matching_score desc
        const eligibleJobs = jobsWithScores
          .filter(job => ['recommended', 'unlocked', 'new'].includes(job.status))
          .sort((a, b) => b.matching_score - a.matching_score);

        if (eligibleJobs.length === 0) {
          // Skip if no eligible jobs
          continue;
        }

        // Pick top 3 distinct roles
        const top3Roles = eligibleJobs.slice(0, 3);

        // Compute common_missing_skill from aggregated skills_missing[]
        const allMissingSkills: string[] = [];
        top3Roles.forEach(job => {
          allMissingSkills.push(...(job.skills_missing || []));
        });

        // Count occurrences of each missing skill
        const skillCount = new Map<string, number>();
        allMissingSkills.forEach(skill => {
          skillCount.set(skill, (skillCount.get(skill) || 0) + 1);
        });

        // Find most common missing skill
        let commonMissingSkill: string | null = null;
        let maxCount = 0;
        skillCount.forEach((count, skill) => {
          if (count > maxCount) {
            maxCount = count;
            commonMissingSkill = skill;
          }
        });

        // Get unsubscribe token
        const { data: studentProfileWithToken } = await supabase
          .from('student_profiles')
          .select('unsubscribe_token')
          .eq('id', studentProfile.id)
          .single();

        const unsubscribeToken = studentProfileWithToken?.unsubscribe_token;
        if (!unsubscribeToken) {
          console.warn(`No unsubscribe token for student ${studentProfile.id}`);
        }

        // Build email subject
        const subject = top3Roles.length > 0
          ? `3 roles you're closest to: ${top3Roles[0].title} at ${top3Roles[0].company}`
          : 'Your weekly job opportunities';

        // Build payload
        const payload = {
          name: studentName,
          roles: top3Roles.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            matching_score: job.matching_score,
            status: job.status,
            skills_missing: job.skills_missing,
            location: job.location,
            is_remote: job.is_remote,
            salary_range: job.salary_range,
            external_url: job.external_url,
          })),
          common_missing_skill: commonMissingSkill,
          unsubscribeToken,
        };

        // Generate dedupe_key: email_type:YYYY-MM-DD:student_profile_id
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const dedupeKey = `weekly_jobs:${today}:${studentProfile.id}`;

        // Enqueue to email_outbox with new structure
        // Note: Using service role client (createServerSupabaseClient) bypasses RLS
        // Use upsert to handle duplicate dedupe_key gracefully (ON CONFLICT DO NOTHING)
        const { error: insertError } = await supabase
          .from('email_outbox')
          .upsert({
            student_profile_id: studentProfile.id,
            email_type: 'weekly_jobs',
            dedupe_key: dedupeKey,
            to_email: userEmail,
            subject,
            payload,
            status: 'queued',
            attempt_count: 0,
            next_attempt_at: new Date().toISOString(),
          }, {
            onConflict: 'dedupe_key',
            ignoreDuplicates: true,
          });

        if (insertError) {
          console.error(`Error enqueueing jobs email for student ${studentProfile.id}:`, insertError);
          errors.push(`Student ${studentProfile.id}: ${insertError.message}`);
        } else {
          enqueued++;
        }
      } catch (error) {
        console.error(`Error processing student ${studentProfile.id}:`, error);
        errors.push(`Student ${studentProfile.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: 'Weekly jobs emails processed',
      totalStudents: studentProfiles.length,
      enqueued,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in weekly jobs emails cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
