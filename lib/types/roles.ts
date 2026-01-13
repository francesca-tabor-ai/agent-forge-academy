/**
 * User role type definition
 * Role model: student, recruiter, instructor, admin
 * Note: 'tutor' is normalized to 'instructor' in middleware
 */
export type UserRole = 'student' | 'recruiter' | 'instructor' | 'admin';

export const USER_ROLES = {
  STUDENT: 'student',
  RECRUITER: 'recruiter',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
} as const;

