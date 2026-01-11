/**
 * Dynamic Jobs Matching Algorithm
 * 
 * Calculates matching scores between jobs and students based on:
 * - Skills match (40% weight)
 * - Course enrollment (30% weight)
 * - Portfolio projects (20% weight)
 * - Experience level (10% weight)
 */

export interface StudentProfile {
  id: string;
  skills?: string[];
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
  matchingScore: number;
  skillsMatch: number;
  courseMatch: number;
  portfolioMatch: number;
  experienceMatch: number;
  skillsMissing: string[];
  breakdown?: {
    skillsScore: number;
    courseScore: number;
    portfolioScore: number;
    experienceScore: number;
  };
}

/**
 * Calculate matching score between a job and a student profile
 */
export function calculateJobMatch(
  job: Job,
  studentProfile: StudentProfile,
  enrolledCourses: CourseEnrollment[],
  portfolioProjects: PortfolioProject[]
): MatchingResult {
  // Extract student skills from profile and portfolio
  const studentSkills = extractStudentSkills(studentProfile, portfolioProjects);
  
  // 1. Skills Match (40% weight)
  const skillsMatch = calculateSkillsMatch(job.skills || [], studentSkills);
  const skillsMissing = (job.skills || []).filter(
    skill => !studentSkills.includes(skill.toLowerCase())
  );
  
  // 2. Course Enrollment Match (30% weight)
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
    studentProfile,
    portfolioProjects
  );
  
  // Calculate weighted score
  const matchingScore = Math.round(
    (skillsMatch * 0.4) +
    (courseMatch * 0.3) +
    (portfolioMatch * 0.2) +
    (experienceMatch * 0.1)
  );
  
  return {
    matchingScore: Math.min(100, Math.max(0, matchingScore)), // Clamp between 0-100
    skillsMatch,
    courseMatch,
    portfolioMatch,
    experienceMatch,
    skillsMissing,
    breakdown: {
      skillsScore: Math.round(skillsMatch * 0.4),
      courseScore: Math.round(courseMatch * 0.3),
      portfolioScore: Math.round(portfolioMatch * 0.2),
      experienceScore: Math.round(experienceMatch * 0.1),
    },
  };
}

/**
 * Extract all skills from student profile and portfolio projects
 */
function extractStudentSkills(
  studentProfile: StudentProfile,
  portfolioProjects: PortfolioProject[]
): string[] {
  const skills = new Set<string>();
  
  // Add skills from student profile
  if (studentProfile.skills && Array.isArray(studentProfile.skills)) {
    studentProfile.skills.forEach(skill => {
      skills.add(skill.toLowerCase().trim());
    });
  }
  
  // Add tech stack from portfolio projects
  portfolioProjects.forEach(project => {
    if (project.tech_stack && Array.isArray(project.tech_stack)) {
      project.tech_stack.forEach(tech => {
        skills.add(tech.toLowerCase().trim());
      });
    }
  });
  
  return Array.from(skills);
}

/**
 * Calculate skills match percentage (0-100)
 */
function calculateSkillsMatch(
  jobSkills: string[],
  studentSkills: string[]
): number {
  if (jobSkills.length === 0) return 50; // Neutral score if job has no skills listed
  
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
  const matchedSkills = normalizedJobSkills.filter(skill =>
    studentSkills.includes(skill)
  );
  
  // Calculate percentage of matched skills
  const matchPercentage = (matchedSkills.length / normalizedJobSkills.length) * 100;
  
  return Math.round(matchPercentage);
}

/**
 * Calculate course enrollment match (0-100)
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
  
  // Weight by completion status
  let weightedScore = 0;
  recommendedCourses.forEach(courseId => {
    const enrollment = enrolledCourses.find(e => e.course_id === courseId);
    if (enrollment) {
      if (enrollment.completed_at) {
        weightedScore += 1.0; // Completed course = full weight
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
 */
function calculatePortfolioMatch(
  jobSkills: string[],
  portfolioProjects: PortfolioProject[]
): number {
  if (jobSkills.length === 0) return 50; // Neutral score if no skills required
  if (portfolioProjects.length === 0) return 0; // No projects = 0 score
  
  // Count projects that have at least one matching skill
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
  let matchingProjects = 0;
  
  portfolioProjects.forEach(project => {
    const projectTech = (project.tech_stack || []).map(t => t.toLowerCase().trim());
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
 * Determine job status based on matching score
 */
export function determineJobStatus(matchingScore: number): string {
  if (matchingScore >= 80) {
    return 'recommended';
  } else if (matchingScore >= 60) {
    return 'unlocked';
  } else if (matchingScore >= 40) {
    return 'locked';
  } else {
    return 'stretch';
  }
}
