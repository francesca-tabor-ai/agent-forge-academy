/**
 * User role type definition
 * Role model: student, recruiter, instructor, admin
 * Note: 'tutor' is normalized to 'instructor' in middleware
 */
export type UserRole = 'student' | 'recruiter' | 'instructor' | 'admin';

export const USER_ROLES = {
  STUDENT: 'student' as UserRole,
  RECRUITER: 'recruiter' as UserRole,
  INSTRUCTOR: 'instructor' as UserRole,
  ADMIN: 'admin' as UserRole,
} as const;

