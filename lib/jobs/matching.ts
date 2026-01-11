/**
 * Dynamic Jobs Matching Algorithm
 * 
 * Calculates matching scores between jobs and students based on:
 * - Skills match (40% weight) - from portfolio_projects.tech_stack[] (normalized + deduped)
 *   - CV-extracted skills included with low weight unless confirmed by portfolio/course evidence
 * - Course enrollment (30% weight) - boost if enrolled/completed courses intersect recommended_for_courses
 * - Portfolio projects (20% weight) - projects with matching tech stack
 * - Experience level (10% weight) - based on project count and job requirements
 */

import { extractSkillsFromCv, getConfirmedCvSkills } from '@/lib/profile/extractSkillsFromCv';

export interface StudentProfile {
  id: string;
  skills?: string[];
  cv_text?: string | null; // Extracted CV text for skill extraction
  cv_file_path?: string | null; // Legacy field (deprecated, use cv_text)
}

export interface PortfolioProject {
  id: string;
  tech_stack?: string[];
  title?: string;
  description?: string;
}

export interface CourseEnrollment {
  course_id: string;
  progress_percentage?: number;
  completed_at?: string | null;
}

export interface Job {
  id: string;
  skills?: string[];
  recommended_for_courses?: string[];
  experience_level?: string;
}

export interface MatchingResult {
  score0to100: number; // Main score (0-100)
  status: 'recommended' | 'unlocked' | 'locked' | 'stretch' | 'new';
  missingSkills: string[];
  explanation: string;
  // Detailed breakdown (for debugging/transparency)
  breakdown?: {
    skillsScore: number;
    courseScore: number;
    portfolioScore: number;
    experienceScore: number;
    skillsMatch: number;
    courseMatch: number;
    portfolioMatch: number;
    experienceMatch: number;
  };
}

/**
 * Calculate matching score between a job and a student profile
 * 
 * @param job - Job with skills, recommended_for_courses, experience_level
 * @param student - Student profile with optional skills and cv_file_path
 * @param enrolledCourses - Array of course enrollments (with progress/completion)
 * @param portfolioProjects - Array of portfolio projects with tech_stack
 * @returns MatchingResult with score0to100, status, missingSkills, and explanation
 */
export function calculateJobMatch(
  job: Job,
  student: StudentProfile,
  enrolledCourses: CourseEnrollment[],
  portfolioProjects: PortfolioProject[]
): MatchingResult {
  // Extract student skills from portfolio projects (normalize + dedupe)
  const studentSkills = extractStudentSkills(student, portfolioProjects);
  
  // Extract skills from CV text if available
  // CV skills are given low weight unless confirmed by portfolio/course evidence
  let cvSkills: string[] = [];
  if (student.cv_text) {
    cvSkills = extractSkillsFromCv(student.cv_text);
    
    // Get portfolio and course skills for confirmation
    const portfolioSkillList = portfolioProjects
      .flatMap(p => p.tech_stack || [])
      .map(s => normalizeSkill(s));
    
    // Get course skills from enrolled courses (simplified - could be enhanced)
    const courseSkillList: string[] = []; // TODO: Extract skills from course metadata
    
    // Only include confirmed CV skills (those that appear in portfolio or courses)
    const confirmedCvSkills = getConfirmedCvSkills(cvSkills, portfolioSkillList, courseSkillList);
    
    // Add confirmed CV skills to student skills
    confirmedCvSkills.forEach(skill => {
      if (!studentSkills.includes(skill)) {
        studentSkills.push(skill);
      }
    });
  }
  
  // 1. Skills Match (40% weight)
  // Unconfirmed CV skills are given very low weight (0.3x) in the calculation
  const skillsMatch = calculateSkillsMatch(job.skills || [], studentSkills, cvSkills);
  const skillsMissing = (job.skills || []).filter(
    skill => !studentSkills.includes(normalizeSkill(skill))
  );
  
  // 2. Course Enrollment Match (30% weight)
  // Boost if enrolled/completed courses intersect recommended_for_courses
  const courseMatch = calculateCourseMatch(
    job.recommended_for_courses || [],
    enrolledCourses
  );
  
  // 3. Portfolio Projects Match (20% weight)
  const portfolioMatch = calculatePortfolioMatch(
    job.skills || [],
    portfolioProjects
  );
  
  // 4. Experience Level Match (10% weight)
  const experienceMatch = calculateExperienceMatch(
    job.experience_level,
    student,
    portfolioProjects
  );
  
  // Calculate weighted score
  const skillsScore = Math.round(skillsMatch * 0.4);
  const courseScore = Math.round(courseMatch * 0.3);
  const portfolioScore = Math.round(portfolioMatch * 0.2);
  const experienceScore = Math.round(experienceMatch * 0.1);
  
  const score0to100 = Math.min(100, Math.max(0, 
    skillsScore + courseScore + portfolioScore + experienceScore
  ));
  
  // Determine status
  const status = determineJobStatus(score0to100);
  
  // Generate explanation
  const explanation = generateExplanation({
    score0to100,
    status,
    skillsMatch,
    courseMatch,
    portfolioMatch,
    experienceMatch,
    skillsMissing,
    jobSkills: job.skills || [],
    recommendedCourses: job.recommended_for_courses || [],
    enrolledCourses,
    portfolioProjects,
  });
  
  return {
    score0to100,
    status,
    missingSkills,
    explanation,
    breakdown: {
      skillsScore,
      courseScore,
      portfolioScore,
      experienceScore,
      skillsMatch,
      courseMatch,
      portfolioMatch,
      experienceMatch,
    },
  };
}

/**
 * Normalize skill name (lowercase, trim, handle common variations)
 */
function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim();
}

/**
 * Extract all skills from student profile and portfolio projects
 * Normalizes and deduplicates skills from portfolio_projects.tech_stack[]
 */
function extractStudentSkills(
  studentProfile: StudentProfile,
  portfolioProjects: PortfolioProject[]
): string[] {
  const skills = new Set<string>();
  
  // Add skills from student profile (if any)
  if (studentProfile.skills && Array.isArray(studentProfile.skills)) {
    studentProfile.skills.forEach(skill => {
      skills.add(normalizeSkill(skill));
    });
  }
  
  // Extract and normalize tech stack from portfolio projects
  portfolioProjects.forEach(project => {
    if (project.tech_stack && Array.isArray(project.tech_stack)) {
      project.tech_stack.forEach(tech => {
        skills.add(normalizeSkill(tech));
      });
    }
  });
  
  // CV skills extraction is handled in calculateJobMatch to allow for
  // confirmation against portfolio/course evidence
  
  return Array.from(skills);
}

/**
 * Calculate skills match percentage (0-100)
 * Based on how many required job skills the student has
 * CV-extracted skills (unconfirmed) are given lower weight
 */
function calculateSkillsMatch(
  jobSkills: string[],
  studentSkills: string[],
  cvSkills: string[] = []
): number {
  if (jobSkills.length === 0) return 50; // Neutral score if job has no skills listed
  
  const normalizedJobSkills = jobSkills.map(normalizeSkill);
  const normalizedStudentSkills = studentSkills.map(normalizeSkill);
  const normalizedCvSkills = cvSkills.map(normalizeSkill);
  
  // Separate confirmed skills (in studentSkills) from unconfirmed CV skills
  const confirmedSkills = normalizedStudentSkills;
  const unconfirmedCvSkills = normalizedCvSkills.filter(
    skill => !confirmedSkills.includes(skill)
  );
  
  // Count matches: confirmed skills get full weight, unconfirmed CV skills get 0.3 weight
  let weightedMatches = 0;
  
  normalizedJobSkills.forEach(jobSkill => {
    if (confirmedSkills.includes(jobSkill)) {
      weightedMatches += 1.0; // Full weight for confirmed skills
    } else if (unconfirmedCvSkills.includes(jobSkill)) {
      weightedMatches += 0.3; // Low weight for unconfirmed CV skills
    }
  });
  
  // Calculate percentage (normalized to 0-100)
  const matchPercentage = (weightedMatches / normalizedJobSkills.length) * 100;
  
  return Math.round(Math.min(100, matchPercentage));
}

/**
 * Calculate course enrollment match (0-100)
 * Boost if enrolled/completed courses intersect recommended_for_courses
 */
function calculateCourseMatch(
  recommendedCourses: string[],
  enrolledCourses: CourseEnrollment[]
): number {
  if (recommendedCourses.length === 0) return 50; // Neutral score if no courses recommended
  
  const enrolledCourseIds = enrolledCourses.map(e => e.course_id);
  const matchedCourses = recommendedCourses.filter(courseId =>
    enrolledCourseIds.includes(courseId)
  );
  
  // Weight by completion status (boost for completed courses)
  let weightedScore = 0;
  recommendedCourses.forEach(courseId => {
    const enrollment = enrolledCourses.find(e => e.course_id === courseId);
    if (enrollment) {
      if (enrollment.completed_at) {
        weightedScore += 1.0; // Completed course = full weight (100%)
      } else if (enrollment.progress_percentage && enrollment.progress_percentage > 50) {
        weightedScore += 0.7; // In progress > 50% = 70% weight
      } else {
        weightedScore += 0.3; // In progress < 50% = 30% weight
      }
    }
  });
  
  // Normalize to 0-100 scale
  const maxPossibleScore = recommendedCourses.length;
  const matchPercentage = maxPossibleScore > 0
    ? (weightedScore / maxPossibleScore) * 100
    : 0;
  
  return Math.round(matchPercentage);
}

/**
 * Calculate portfolio projects match (0-100)
 * Based on how many portfolio projects have matching tech stack
 */
function calculatePortfolioMatch(
  jobSkills: string[],
  portfolioProjects: PortfolioProject[]
): number {
  if (jobSkills.length === 0) return 50; // Neutral score if no skills required
  if (portfolioProjects.length === 0) return 0; // No projects = 0 score
  
  // Count projects that have at least one matching skill
  const normalizedJobSkills = jobSkills.map(normalizeSkill);
  let matchingProjects = 0;
  
  portfolioProjects.forEach(project => {
    const projectTech = (project.tech_stack || []).map(normalizeSkill);
    const hasMatchingSkill = normalizedJobSkills.some(skill =>
      projectTech.includes(skill)
    );
    if (hasMatchingSkill) {
      matchingProjects++;
    }
  });
  
  // Score based on percentage of projects that match
  // Cap at 100% even if all projects match (to avoid over-weighting)
  const projectMatchPercentage = (matchingProjects / portfolioProjects.length) * 100;
  const cappedPercentage = Math.min(100, projectMatchPercentage * 1.5); // Bonus for multiple matches
  
  return Math.round(cappedPercentage);
}

/**
 * Calculate experience level match (0-100)
 * Based on portfolio project count vs job experience requirements
 */
function calculateExperienceMatch(
  jobExperienceLevel: string | undefined,
  studentProfile: StudentProfile,
  portfolioProjects: PortfolioProject[]
): number {
  if (!jobExperienceLevel) return 50; // Neutral score if not specified
  
  // Simple heuristic: more projects = more experience
  const projectCount = portfolioProjects.length;
  
  // Map experience levels to scores
  const experienceLevels: Record<string, { minProjects: number; score: number }> = {
    'entry': { minProjects: 0, score: 80 },
    'junior': { minProjects: 1, score: 70 },
    'mid': { minProjects: 2, score: 60 },
    'senior': { minProjects: 4, score: 50 },
    'lead': { minProjects: 6, score: 40 },
  };
  
  const normalizedLevel = jobExperienceLevel.toLowerCase().trim();
  const levelConfig = experienceLevels[normalizedLevel] || { minProjects: 0, score: 50 };
  
  // If student has enough projects, give full score
  // Otherwise, penalize based on gap
  if (projectCount >= levelConfig.minProjects) {
    return levelConfig.score;
  } else {
    const gap = levelConfig.minProjects - projectCount;
    const penalty = gap * 10; // 10 points per missing project
    return Math.max(0, levelConfig.score - penalty);
  }
}

/**
 * Generate human-readable explanation of the matching score
 */
function generateExplanation(params: {
  score0to100: number;
  status: string;
  skillsMatch: number;
  courseMatch: number;
  portfolioMatch: number;
  experienceMatch: number;
  skillsMissing: string[];
  jobSkills: string[];
  recommendedCourses: string[];
  enrolledCourses: CourseEnrollment[];
  portfolioProjects: PortfolioProject[];
}): string {
  const {
    score0to100,
    status,
    skillsMatch,
    courseMatch,
    portfolioMatch,
    experienceMatch,
    skillsMissing,
    jobSkills,
    recommendedCourses,
    enrolledCourses,
    portfolioProjects,
  } = params;

  const parts: string[] = [];

  // Overall score and status
  parts.push(`Match Score: ${score0to100}% (${status})`);

  // Skills breakdown
  if (jobSkills.length > 0) {
    const matchedCount = jobSkills.length - skillsMissing.length;
    parts.push(`\nSkills: ${matchedCount}/${jobSkills.length} required skills matched (${skillsMatch}%)`);
    if (skillsMissing.length > 0) {
      parts.push(`Missing: ${skillsMissing.slice(0, 5).join(', ')}${skillsMissing.length > 5 ? '...' : ''}`);
    }
  }

  // Course enrollment breakdown
  if (recommendedCourses.length > 0) {
    const enrolledCourseIds = enrolledCourses.map(e => e.course_id);
    const matchedCourses = recommendedCourses.filter(id => enrolledCourseIds.includes(id));
    const completedCourses = recommendedCourses.filter(id => {
      const enrollment = enrolledCourses.find(e => e.course_id === id);
      return enrollment?.completed_at != null;
    });
    
    if (matchedCourses.length > 0) {
      parts.push(`\nCourses: ${matchedCourses.length}/${recommendedCourses.length} recommended courses enrolled (${courseMatch}%)`);
      if (completedCourses.length > 0) {
        parts.push(`${completedCourses.length} completed`);
      }
    } else {
      parts.push(`\nCourses: No recommended courses enrolled yet`);
    }
  }

  // Portfolio breakdown
  if (portfolioProjects.length > 0) {
    parts.push(`\nPortfolio: ${portfolioProjects.length} project(s) with relevant tech stack (${portfolioMatch}%)`);
  } else {
    parts.push(`\nPortfolio: No projects yet`);
  }

  // Experience level
  parts.push(`\nExperience: ${experienceMatch}% match based on project count`);

  return parts.join('\n');
}

/**
 * Determine job status based on matching score
 * Returns: 'recommended' | 'unlocked' | 'locked' | 'stretch' | 'new'
 */
export function determineJobStatus(matchingScore: number): 'recommended' | 'unlocked' | 'locked' | 'stretch' | 'new' {
  if (matchingScore >= 80) {
    return 'recommended';
  } else if (matchingScore >= 60) {
    return 'unlocked';
  } else if (matchingScore >= 40) {
    return 'locked';
  } else if (matchingScore > 0) {
    return 'stretch';
  } else {
    return 'new'; // Score of 0 or very low = new/unexplored
  }
}
