/**
 * User role type definition
 * Simplified role model: student, recruiter, admin (optional)
 * Tutor and instructor roles have been removed and migrated to admin.
 */
export type UserRole = 'student' | 'recruiter' | 'admin';

export const USER_ROLES = {
  STUDENT: 'student',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
} as const;

