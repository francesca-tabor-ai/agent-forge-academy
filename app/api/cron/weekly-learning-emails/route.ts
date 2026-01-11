import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { loadAllLessons } from '@/lib/lessons';

/**
 * Get ISO week number for a date
 * ISO weeks start on Monday, week 1 is the first week with a Thursday
 * @param date - Date to get week number for
 * @returns ISO week number (1-53)
 */
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get course-specific default email action if lesson doesn't have email_action
 * Minimal scope: Only high-value courses that map cleanly to "one lever per week"
 * @param courseSlug - The course slug
 * @param nextLessonTitle - The next lesson title (optional, for generic fallback)
 * @returns Default action string for the course
 */
function defaultActionByCourse(courseSlug: string, nextLessonTitle?: string | null): string {
  // Course-specific default actions (minimal scope: high-value courses only)
  const courseDefaults: Record<string, string> = {
    'multi-agent-systems': 'Design a simple multi-agent workflow for a task you do manually today.',
    'ai-native-software-delivery-pipelines': 'Sketch the architecture for your next AI-native feature.',
  };

  // Return course-specific default if available
  if (courseDefaults[courseSlug]) {
    return courseDefaults[courseSlug];
  }

  // Generic fallback
  if (nextLessonTitle) {
    return `Continue with "${nextLessonTitle}"`;
  }

  return 'Continue learning';
}

/**
 * GET /api/cron/weekly-learning-emails
 * 
 * Weekly cron endpoint to enqueue learning emails for students.
 * Protected by CRON_SECRET header.
 * 
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 * 
 * Process:
 * 1. Find students with weekly_learning_emails_enabled = true
 * 2. For each student, pick active enrollment (most recently seen / highest progress)
 * 3. Compute nextLessonSlug based on progress
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

    // Find students with weekly learning emails enabled
    // First get student profiles
    const { data: studentProfiles, error: studentsError } = await supabase
      .from('student_profiles')
      .select('id, profile_id, weekly_learning_emails_enabled')
      .eq('weekly_learning_emails_enabled', true);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    if (!studentProfiles || studentProfiles.length === 0) {
      return NextResponse.json({
        message: 'No students with emails enabled',
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

        // Get student's enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('course_enrollments')
          .select(`
            id,
            course_id,
            progress_percentage,
            enrolled_at,
            courses!inner (
              id,
              slug,
              title
            )
          `)
          .eq('student_profile_id', studentProfile.id)
          .order('progress_percentage', { ascending: false })
          .order('enrolled_at', { ascending: false })
          .limit(1);

        if (enrollmentsError || !enrollments || enrollments.length === 0) {
          // Skip students without enrollments
          continue;
        }

        // Pick the most active enrollment (highest progress, most recent)
        const enrollment = enrollments[0];
        const course = enrollment.courses as any;

        // Get lesson progress for this course
        const { data: lessonProgress, error: progressError } = await supabase
          .from('lesson_progress')
          .select('lesson_slug, status, completed_at, last_seen_at')
          .eq('student_profile_id', studentProfile.id)
          .eq('course_id', course.id)
          .order('last_seen_at', { ascending: false });

        // Load all lessons for this course
        const allLessons = loadAllLessons(undefined, course.slug);
        
        if (allLessons.length === 0) {
          // Skip if no lessons available
          continue;
        }

        // Sort lessons by order
        const sortedLessons = [...allLessons].sort((a, b) => {
          const orderA = a.frontmatter.order ?? 0;
          const orderB = b.frontmatter.order ?? 0;
          return orderA - orderB;
        });

        // Find completed lessons
        const completedLessons = lessonProgress
          ?.filter(lp => lp.status === 'completed')
          .map(lp => lp.lesson_slug) || [];

        // Find last seen lesson
        const lastSeenLesson = lessonProgress?.[0];
        const lastLessonSlug = lastSeenLesson?.lesson_slug;

        // Compute next lesson
        let nextLesson: typeof sortedLessons[0] | null = null;
        let nextLessonSlug: string | null = null;
        let nextLessonTitle: string | null = null;

        if (completedLessons.length > 0) {
          // Find the last completed lesson (highest order)
          let lastCompletedIndex = -1;
          for (let i = sortedLessons.length - 1; i >= 0; i--) {
            if (completedLessons.includes(sortedLessons[i].slug)) {
              lastCompletedIndex = i;
              break;
            }
          }
          
          // Get the next lesson after the last completed one
          if (lastCompletedIndex >= 0 && lastCompletedIndex < sortedLessons.length - 1) {
            nextLesson = sortedLessons[lastCompletedIndex + 1];
            nextLessonSlug = nextLesson.slug;
            nextLessonTitle = nextLesson.frontmatter.title || nextLesson.slug;
          }
          // If all lessons are completed, nextLesson remains null
        } else {
          // No completed lessons, use first lesson
          nextLesson = sortedLessons[0];
          nextLessonSlug = nextLesson.slug;
          nextLessonTitle = nextLesson.frontmatter.title || nextLesson.slug;
        }

        // Get last lesson title if available
        const lastLesson = lastLessonSlug
          ? sortedLessons.find(l => l.slug === lastLessonSlug)
          : null;
        const lastLessonTitle = lastLesson?.frontmatter.title || lastLessonSlug || null;

        // Extract email_takeaway and email_action from next lesson with fallbacks
        // Pattern: takeaway = nextLesson.email_takeaway || nextLesson.description
        //          action = nextLesson.email_action || defaultActionByCourse(courseSlug)
        let emailTakeaway: string | null = null;
        let emailAction: string | null = null;

        if (nextLesson) {
          // Use email_takeaway if available, otherwise fallback to description
          emailTakeaway = nextLesson.frontmatter.email_takeaway || nextLesson.frontmatter.description || null;
          
          // Use email_action if available, otherwise use course-specific default
          emailAction = nextLesson.frontmatter.email_action || defaultActionByCourse(course.slug, nextLessonTitle);
        } else {
          // No next lesson (course completed)
          emailTakeaway = `You've completed ${course.title}! Great work.`;
          emailAction = 'Explore your other courses';
        }

        // Get user email for sending
        const userEmail = user?.email;
        if (!userEmail) {
          // Skip if no email address
          continue;
        }

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
        const subject = nextLessonTitle
          ? `Continue learning: ${nextLessonTitle}`
          : `Your progress in ${course.title}`;

        // Build payload
        const payload = {
          name: studentName,
          courseTitle: course.title,
          courseSlug: course.slug,
          lastLesson: lastLessonTitle,
          lastLessonSlug: lastLessonSlug,
          nextLesson: nextLessonTitle,
          nextLessonSlug: nextLessonSlug,
          emailTakeaway,
          emailAction,
          progressPercentage: enrollment.progress_percentage || 0,
          unsubscribeToken,
        };

        // Generate dedupe_key: email_type:YYYY-WW:student_profile_id
        // YYYY-WW format (ISO week number) allows safe re-runs within the same week
        const now = new Date();
        const year = now.getFullYear();
        // Get ISO week number
        const weekNumber = getISOWeekNumber(now);
        const weekStr = weekNumber.toString().padStart(2, '0');
        const dedupeKey = `weekly_learning:${year}-W${weekStr}:${studentProfile.id}`;

        // Enqueue to email_outbox with new structure
        // Note: Using service role client (createServerSupabaseClient) bypasses RLS
        // Use upsert to handle duplicate dedupe_key gracefully (ON CONFLICT DO NOTHING)
        const { error: insertError } = await supabase
          .from('email_outbox')
          .upsert({
            student_profile_id: studentProfile.id,
            email_type: 'weekly_learning',
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
          console.error(`Error enqueueing email for student ${studentProfile.id}:`, insertError);
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
      message: 'Weekly learning emails processed',
      totalStudents: studentProfiles.length,
      enqueued,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in weekly learning emails cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
