/**
 * Utility functions for calculating tool proficiency based on course completion
 */

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ToolProficiency {
  toolId: string;
  toolName: string;
  level: ProficiencyLevel;
  completedCoursesCount: number;
}

/**
 * Calculate proficiency level based on number of completed courses
 */
export function calculateProficiencyLevel(completedCoursesCount: number): ProficiencyLevel {
  if (completedCoursesCount === 0) {
    return 'beginner'; // No courses completed, but we might still show beginner
  } else if (completedCoursesCount === 1) {
    return 'beginner';
  } else if (completedCoursesCount >= 2 && completedCoursesCount <= 3) {
    return 'intermediate';
  } else {
    return 'advanced';
  }
}

/**
 * Get proficiency label for display
 */
export function getProficiencyLabel(level: ProficiencyLevel): string {
  const labels: Record<ProficiencyLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return labels[level];
}

/**
 * Get proficiency color for badges
 */
export function getProficiencyColor(level: ProficiencyLevel): string {
  const colors: Record<ProficiencyLevel, string> = {
    beginner: 'bg-blue-100 text-blue-700 border-blue-200',
    intermediate: 'bg-purple-100 text-purple-700 border-purple-200',
    advanced: 'bg-green-100 text-green-700 border-green-200',
  };
  return colors[level];
}

/**
 * Get proficiency icon/emoji
 */
export function getProficiencyIcon(level: ProficiencyLevel): string {
  const icons: Record<ProficiencyLevel, string> = {
    beginner: '🌱',
    intermediate: '⭐',
    advanced: '🏆',
  };
  return icons[level];
}
