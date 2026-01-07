/**
 * User role type definition
 * Standardized to use 'instructor' instead of 'tutor'
 * The database enum supports both 'tutor' and 'instructor' for backward compatibility,
 * but TypeScript types should use 'instructor' consistently.
 */
export type UserRole = 'student' | 'instructor' | 'recruiter' | 'admin';

export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
} as const;

