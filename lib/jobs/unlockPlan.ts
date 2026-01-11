/**
 * Unlock Plan Recommender
 * 
 * Given a target job (or target role), recommends 1-3 AI Growth Hub courses/lessons/projects
 * that close the biggest missing skills gaps.
 * 
 * Uses:
 * - jobs.skills_missing (computed missing skills)
 * - jobs.recommended_for_courses (course slugs that prepare for this job)
 * - Course metadata to match skills to courses
 */

import { courseMetadata, type CourseMetadata } from '@/lib/course-metadata';
import { loadAllLessons, type Lesson } from '@/lib/lessons';

export interface UnlockPlanRecommendation {
  type: 'course' | 'lesson' | 'project';
  courseSlug?: string;
  lessonSlug?: string;
  title: string;
  description: string;
  deepLink: string;
  skillsCovered: string[]; // Skills from skills_missing that this recommendation addresses
  priority: 'high' | 'medium' | 'low'; // Priority based on skill gap impact
}

export interface TargetJob {
  id?: string;
  title?: string;
  company?: string;
  skills_missing: string[]; // Computed missing skills
  recommended_for_courses?: string[]; // Course slugs recommended for this job
  skills?: string[]; // All required skills (for context)
}

/**
 * Normalize skill names for matching (lowercase, remove special chars)
 */
function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Check if a skill matches a course (by title, description, or category)
 */
function skillMatchesCourse(skill: string, course: CourseMetadata): boolean {
  const normalizedSkill = normalizeSkill(skill);
  const searchText = [
    course.title,
    course.category,
    course.outcome || '',
    course.build || '',
    course.bestFor || '',
    course.slug,
  ]
    .join(' ')
    .toLowerCase();

  // Check for exact word matches or partial matches
  const skillWords = normalizedSkill.split(' ');
  return skillWords.some((word) => {
    if (word.length < 3) return false; // Skip very short words
    return searchText.includes(word);
  });
}

/**
 * Check if a skill matches a lesson (by title, description, or content)
 */
function skillMatchesLesson(skill: string, lesson: Lesson): boolean {
  const normalizedSkill = normalizeSkill(skill);
  const searchText = [
    lesson.frontmatter.title,
    lesson.frontmatter.description || '',
    lesson.frontmatter.module || '',
    lesson.slug,
    lesson.content.substring(0, 500), // First 500 chars of content
  ]
    .join(' ')
    .toLowerCase();

  const skillWords = normalizedSkill.split(' ');
  return skillWords.some((word) => {
    if (word.length < 3) return false;
    return searchText.includes(word);
  });
}

/**
 * Score a course recommendation based on how many missing skills it covers
 */
function scoreCourseRecommendation(
  courseSlug: string,
  missingSkills: string[],
  course: CourseMetadata
): { score: number; skillsCovered: string[] } {
  const skillsCovered: string[] = [];
  let score = 0;

  for (const skill of missingSkills) {
    if (skillMatchesCourse(skill, course)) {
      skillsCovered.push(skill);
      score += 1;
    }
  }

  // Boost score if course is in recommended_for_courses
  // This will be handled in the main function

  return { score, skillsCovered };
}

/**
 * Score a lesson recommendation based on how many missing skills it covers
 */
function scoreLessonRecommendation(
  lesson: Lesson,
  missingSkills: string[]
): { score: number; skillsCovered: string[] } {
  const skillsCovered: string[] = [];
  let score = 0;

  for (const skill of missingSkills) {
    if (skillMatchesLesson(skill, lesson)) {
      skillsCovered.push(skill);
      score += 1;
    }
  }

  return { score, skillsCovered };
}

/**
 * Generate unlock plan recommendations for a target job
 * 
 * @param targetJob - Target job with skills_missing and recommended_for_courses
 * @param limit - Maximum number of recommendations (default: 3)
 * @returns Array of unlock plan recommendations with deep links
 */
export function generateUnlockPlan(
  targetJob: TargetJob,
  limit: number = 3
): UnlockPlanRecommendation[] {
  const { skills_missing, recommended_for_courses = [] } = targetJob;

  if (!skills_missing || skills_missing.length === 0) {
    return [];
  }

  const recommendations: UnlockPlanRecommendation[] = [];

  // Step 1: Prioritize courses from recommended_for_courses that match missing skills
  const recommendedCourses: Array<{
    courseSlug: string;
    course: CourseMetadata;
    score: number;
    skillsCovered: string[];
  }> = [];

  for (const courseSlug of recommended_for_courses) {
    const course = courseMetadata[courseSlug];
    if (!course) continue;

    const { score, skillsCovered } = scoreCourseRecommendation(
      courseSlug,
      skills_missing,
      course
    );

    if (score > 0) {
      recommendedCourses.push({
        courseSlug,
        course,
        score: score * 2, // Boost score for recommended courses
        skillsCovered,
      });
    }
  }

  // Step 2: Find other courses that match missing skills (not in recommended_for_courses)
  const otherCourses: Array<{
    courseSlug: string;
    course: CourseMetadata;
    score: number;
    skillsCovered: string[];
  }> = [];

  for (const [courseSlug, course] of Object.entries(courseMetadata)) {
    // Skip if already in recommended courses
    if (recommended_for_courses.includes(courseSlug)) continue;

    const { score, skillsCovered } = scoreCourseRecommendation(
      courseSlug,
      skills_missing,
      course
    );

    if (score > 0) {
      otherCourses.push({
        courseSlug,
        course,
        score,
        skillsCovered,
      });
    }
  }

  // Step 3: Combine and sort by score
  const allCourses = [...recommendedCourses, ...otherCourses].sort(
    (a, b) => b.score - a.score
  );

  // Step 4: Generate course recommendations (up to limit)
  const remainingSkills = new Set(skills_missing);
  let recommendationsCount = 0;

  for (const { courseSlug, course, skillsCovered } of allCourses) {
    if (recommendationsCount >= limit) break;

    // Check if this course covers any remaining skills
    const relevantSkills = skillsCovered.filter((skill) =>
      remainingSkills.has(skill)
    );

    if (relevantSkills.length === 0) continue;

    // Determine priority based on how many skills it covers
    const priority: 'high' | 'medium' | 'low' =
      relevantSkills.length >= 3
        ? 'high'
        : relevantSkills.length >= 2
          ? 'medium'
          : 'low';

    recommendations.push({
      type: 'course',
      courseSlug,
      title: course.title,
      description: course.outcome || course.build || '',
      deepLink: `/student/courses/${courseSlug}`,
      skillsCovered: relevantSkills,
      priority,
    });

    // Remove covered skills from remaining set
    relevantSkills.forEach((skill) => remainingSkills.delete(skill));
    recommendationsCount++;
  }

  // Step 5: If we haven't reached the limit and there are still missing skills,
  // try to find specific lessons that match
  if (recommendationsCount < limit && remainingSkills.size > 0) {
    try {
      const allLessons = loadAllLessons();
      const lessonScores: Array<{
        lesson: Lesson;
        score: number;
        skillsCovered: string[];
      }> = [];

      for (const lesson of allLessons) {
        // Only consider lessons from courses we haven't already recommended
        if (
          lesson.courseSlug &&
          recommendations.some((r) => r.courseSlug === lesson.courseSlug)
        ) {
          continue;
        }

        const { score, skillsCovered } = scoreLessonRecommendation(
          lesson,
          Array.from(remainingSkills)
        );

        if (score > 0) {
          lessonScores.push({ lesson, score, skillsCovered });
        }
      }

      // Sort lessons by score and add top ones
      lessonScores.sort((a, b) => b.score - a.score);

      for (const { lesson, skillsCovered } of lessonScores) {
        if (recommendationsCount >= limit) break;

        const relevantSkills = skillsCovered.filter((skill) =>
          remainingSkills.has(skill)
        );

        if (relevantSkills.length === 0) continue;

        const priority: 'high' | 'medium' | 'low' =
          relevantSkills.length >= 2 ? 'high' : 'medium';

        if (lesson.courseSlug) {
          recommendations.push({
            type: 'lesson',
            courseSlug: lesson.courseSlug,
            lessonSlug: lesson.slug,
            title: lesson.frontmatter.title,
            description:
              lesson.frontmatter.description ||
              `Lesson from ${courseMetadata[lesson.courseSlug]?.title || lesson.courseSlug}`,
            deepLink: `/student/courses/${lesson.courseSlug}/lessons/${lesson.slug}`,
            skillsCovered: relevantSkills,
            priority,
          });

          relevantSkills.forEach((skill) => remainingSkills.delete(skill));
          recommendationsCount++;
        }
      }
    } catch (error) {
      console.warn('Error loading lessons for unlock plan:', error);
      // Continue without lesson recommendations
    }
  }

  // Step 6: If we still haven't reached the limit, add project recommendations
  // (For now, we'll suggest building projects related to missing skills)
  if (recommendationsCount < limit && remainingSkills.size > 0) {
    const remainingSkillsArray = Array.from(remainingSkills).slice(0, 3);
    recommendations.push({
      type: 'project',
      title: 'Build a Portfolio Project',
      description: `Create a project demonstrating: ${remainingSkillsArray.join(', ')}. This will help you close the remaining skill gaps and showcase your abilities to employers.`,
      deepLink: '/student/portfolio',
      skillsCovered: remainingSkillsArray,
      priority: 'medium',
    });
    recommendationsCount++;
  }

  return recommendations.slice(0, limit);
}

/**
 * Format unlock plan recommendations for display
 */
export function formatUnlockPlan(
  recommendations: UnlockPlanRecommendation[]
): string {
  if (recommendations.length === 0) {
    return 'No specific recommendations available at this time.';
  }

  return recommendations
    .map((rec, idx) => {
      const priorityEmoji =
        rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⭐' : '📚';
      const typeLabel =
        rec.type === 'course'
          ? 'Course'
          : rec.type === 'lesson'
            ? 'Lesson'
            : 'Project';

      return `${idx + 1}. ${priorityEmoji} **${rec.title}** (${typeLabel})
   - **Skills covered:** ${rec.skillsCovered.join(', ')}
   - **Link:** ${rec.deepLink}
   ${rec.description ? `- **Description:** ${rec.description}` : ''}`;
    })
    .join('\n\n');
}
