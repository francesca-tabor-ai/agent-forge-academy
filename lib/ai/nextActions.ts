/**
 * Next Actions Generator
 * 
 * Generates structured next_actions based on intent, context, and response content
 * to provide actionable UI buttons in the advisor interface.
 */

import type { AdvisorIntent } from './intent';
import { generateUnlockPlan } from '@/lib/jobs/unlockPlan';

export type NextActionType =
  | 'start_course'
  | 'open_course'
  | 'open_lesson'
  | 'open_job'
  | 'view_portfolio'
  | 'add_project'
  | 'browse_jobs'
  | 'unlock_plan';

export interface NextAction {
  type: NextActionType;
  label: string;
  courseSlug?: string;
  lessonSlug?: string;
  jobId?: string;
  deepLink: string;
}

/**
 * Generate next actions based on intent, context, and response content
 */
export async function generateNextActions(
  intent: AdvisorIntent | undefined,
  context?: {
    course?: { id: string; slug: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  },
  responseContent?: string,
  jobData?: {
    id: string;
    skills_missing?: string[];
    recommended_for_courses?: string[];
  }
): Promise<NextAction[]> {
  const actions: NextAction[] = [];

  // Intent-based actions
  switch (intent) {
    case 'learning_help':
      if (context?.course) {
        // If user is asking about a course, suggest opening it
        actions.push({
          type: 'open_course',
          label: `Open ${context.course.title}`,
          courseSlug: context.course.slug,
          deepLink: `/student/courses/${context.course.slug}`,
        });
      } else if (responseContent) {
        // Try to extract course mentions from response
        const courseMentions = extractCourseMentions(responseContent);
        for (const courseSlug of courseMentions.slice(0, 1)) {
          actions.push({
            type: 'open_course',
            label: `View Course`,
            courseSlug,
            deepLink: `/student/courses/${courseSlug}`,
          });
        }
      }
      break;

    case 'project_review':
      if (context?.project) {
        actions.push({
          type: 'view_portfolio',
          label: 'View Portfolio',
          deepLink: '/student/portfolio',
        });
      } else {
        actions.push({
          type: 'add_project',
          label: 'Add a Project',
          deepLink: '/student/portfolio',
        });
      }
      break;

    case 'job_matching':
      if (context?.job) {
        actions.push({
          type: 'open_job',
          label: `View ${context.job.title}`,
          jobId: context.job.id,
          deepLink: `/student/jobs/${context.job.id}`,
        });
      } else {
        actions.push({
          type: 'browse_jobs',
          label: 'Browse Job Opportunities',
          deepLink: '/student/jobs',
        });
      }

      // If job has missing skills, generate unlock plan
      if (jobData?.skills_missing && jobData.skills_missing.length > 0) {
        const unlockPlan = generateUnlockPlan({
          skills_missing: jobData.skills_missing,
          recommended_for_courses: jobData.recommended_for_courses || [],
        }, 1); // Get top recommendation

        if (unlockPlan.length > 0) {
          const topRec = unlockPlan[0];
          actions.push({
            type: 'unlock_plan',
            label: `Start: ${topRec.title}`,
            courseSlug: topRec.courseSlug,
            lessonSlug: topRec.lessonSlug,
            deepLink: topRec.deepLink,
          });
        }
      }
      break;

    case 'application_help':
      if (context?.job) {
        actions.push({
          type: 'open_job',
          label: `View ${context.job.title}`,
          jobId: context.job.id,
          deepLink: `/student/jobs/${context.job.id}`,
        });
      }
      if (context?.project) {
        actions.push({
          type: 'view_portfolio',
          label: 'View Portfolio',
          deepLink: '/student/portfolio',
        });
      }
      break;

    case 'general_career':
      actions.push({
        type: 'browse_jobs',
        label: 'Browse Job Opportunities',
        deepLink: '/student/jobs',
      });
      break;
  }

  // Context-based actions (if no intent-specific actions)
  if (actions.length === 0) {
    if (context?.course) {
      actions.push({
        type: 'open_course',
        label: `Continue ${context.course.title}`,
        courseSlug: context.course.slug,
        deepLink: `/student/courses/${context.course.slug}`,
      });
    } else if (context?.project) {
      actions.push({
        type: 'view_portfolio',
        label: 'View Portfolio',
        deepLink: '/student/portfolio',
      });
    } else if (context?.job) {
      actions.push({
        type: 'open_job',
        label: `View ${context.job.title}`,
        jobId: context.job.id,
        deepLink: `/student/jobs/${context.job.id}`,
      });
    }
  }

  return actions.slice(0, 3); // Limit to 3 actions
}

/**
 * Extract course slugs mentioned in response content
 */
function extractCourseMentions(content: string): string[] {
  const courseSlugs: string[] = [];
  const courseSlugPattern = /\/student\/courses\/([a-z0-9-]+)/gi;
  const matches = content.matchAll(courseSlugPattern);
  
  for (const match of matches) {
    if (match[1] && !courseSlugs.includes(match[1])) {
      courseSlugs.push(match[1]);
    }
  }

  return courseSlugs;
}
