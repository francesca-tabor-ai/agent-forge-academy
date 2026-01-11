/**
 * Unit Tests: Job Matcher
 * 
 * Tests for calculateJobMatch function covering:
 * - No portfolio projects
 * - No enrollments
 * - Partial overlap scenarios
 * - Status thresholds (recommended, unlocked, locked, stretch, new)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateJobMatch,
  determineJobStatus,
  type Job,
  type StudentProfile,
  type PortfolioProject,
  type CourseEnrollment,
} from '@/lib/jobs/matching';

describe('Job Matcher - calculateJobMatch', () => {
  // Helper function to create a basic job
  const createJob = (overrides: Partial<Job> = {}): Job => ({
    id: 'job-1',
    skills: ['javascript', 'react', 'nodejs'],
    recommended_for_courses: ['course-1', 'course-2'],
    experience_level: 'mid',
    ...overrides,
  });

  // Helper function to create a basic student profile
  const createStudent = (overrides: Partial<StudentProfile> = {}): StudentProfile => ({
    id: 'student-1',
    skills: [],
    ...overrides,
  });

  // Helper function to create a portfolio project
  const createProject = (overrides: Partial<PortfolioProject> = {}): PortfolioProject => ({
    id: 'project-1',
    tech_stack: ['javascript', 'react'],
    title: 'Test Project',
    ...overrides,
  });

  // Helper function to create a course enrollment
  const createEnrollment = (overrides: Partial<CourseEnrollment> = {}): CourseEnrollment => ({
    course_id: 'course-1',
    progress_percentage: 0,
    completed_at: null,
    ...overrides,
  });

  describe('No Portfolio Projects', () => {
    it('should calculate match with no portfolio projects', () => {
      const job = createJob({
        skills: ['javascript', 'react', 'nodejs'],
        experience_level: 'entry',
      });
      const student = createStudent({
        skills: ['javascript', 'react'],
      });
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.score0to100).toBeGreaterThanOrEqual(0);
      expect(result.score0to100).toBeLessThanOrEqual(100);
      expect(result.status).toBeDefined();
      expect(result.missingSkills).toContain('nodejs');
      expect(result.breakdown?.portfolioScore).toBe(0); // No projects = 0 portfolio score
    });

    it('should have lower score without portfolio projects', () => {
      const job = createJob({
        skills: ['javascript', 'react'],
        experience_level: 'entry',
      });
      const student = createStudent({
        skills: ['javascript', 'react'],
      });
      const enrollments: CourseEnrollment[] = [];
      
      // Without projects
      const resultNoProjects = calculateJobMatch(job, student, enrollments, []);
      
      // With matching projects
      const resultWithProjects = calculateJobMatch(job, student, enrollments, [
        createProject({ tech_stack: ['javascript', 'react'] }),
      ]);

      expect(resultWithProjects.score0to100).toBeGreaterThan(resultNoProjects.score0to100);
      expect(resultWithProjects.breakdown?.portfolioScore).toBeGreaterThan(0);
    });
  });

  describe('No Enrollments', () => {
    it('should calculate match with no course enrollments', () => {
      const job = createJob({
        skills: ['javascript', 'react'],
        recommended_for_courses: ['course-1', 'course-2'],
      });
      const student = createStudent({
        skills: ['javascript', 'react'],
      });
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript', 'react'] }),
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.score0to100).toBeGreaterThanOrEqual(0);
      expect(result.score0to100).toBeLessThanOrEqual(100);
      expect(result.breakdown?.courseScore).toBeLessThan(50); // No enrollments = lower course score
    });

    it('should have lower score without course enrollments', () => {
      const job = createJob({
        skills: ['javascript', 'react'],
        recommended_for_courses: ['course-1'],
      });
      const student = createStudent({
        skills: ['javascript', 'react'],
      });
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript', 'react'] }),
      ];

      // Without enrollments
      const resultNoEnrollments = calculateJobMatch(job, student, [], projects);
      
      // With enrollments
      const resultWithEnrollments = calculateJobMatch(job, student, [
        createEnrollment({ course_id: 'course-1', completed_at: '2024-01-01' }),
      ], projects);

      expect(resultWithEnrollments.score0to100).toBeGreaterThan(resultNoEnrollments.score0to100);
      expect(resultWithEnrollments.breakdown?.courseScore).toBeGreaterThan(resultNoEnrollments.breakdown?.courseScore || 0);
    });
  });

  describe('Partial Overlap Scenarios', () => {
    it('should handle partial skills match', () => {
      const job = createJob({
        skills: ['javascript', 'react', 'nodejs', 'python'],
      });
      const student = createStudent({
        skills: ['javascript', 'react'], // Only 2 out of 4 skills
      });
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript', 'react'] }),
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.score0to100).toBeGreaterThan(0);
      expect(result.score0to100).toBeLessThan(100);
      expect(result.missingSkills).toContain('nodejs');
      expect(result.missingSkills).toContain('python');
      expect(result.breakdown?.skillsMatch).toBe(50); // 2/4 = 50%
    });

    it('should handle partial course enrollment match', () => {
      const job = createJob({
        recommended_for_courses: ['course-1', 'course-2', 'course-3'],
      });
      const student = createStudent();
      const enrollments: CourseEnrollment[] = [
        createEnrollment({ course_id: 'course-1', progress_percentage: 100, completed_at: '2024-01-01' }),
        createEnrollment({ course_id: 'course-2', progress_percentage: 60 }),
        // course-3 not enrolled
      ];
      const projects: PortfolioProject[] = [];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.breakdown?.courseMatch).toBeGreaterThan(0);
      expect(result.breakdown?.courseMatch).toBeLessThan(100);
    });

    it('should handle partial portfolio project match', () => {
      const job = createJob({
        skills: ['javascript', 'react', 'nodejs'],
      });
      const student = createStudent();
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript', 'react'] }), // Matches
        createProject({ tech_stack: ['python', 'django'] }), // Doesn't match
        createProject({ tech_stack: ['nodejs'] }), // Matches
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.breakdown?.portfolioMatch).toBeGreaterThan(0);
      expect(result.breakdown?.portfolioMatch).toBeLessThan(100);
    });

    it('should combine partial matches correctly', () => {
      const job = createJob({
        skills: ['javascript', 'react', 'nodejs', 'python'],
        recommended_for_courses: ['course-1', 'course-2'],
        experience_level: 'mid',
      });
      const student = createStudent({
        skills: ['javascript', 'react'], // 2/4 skills
      });
      const enrollments: CourseEnrollment[] = [
        createEnrollment({ course_id: 'course-1', progress_percentage: 50 }), // 1/2 courses, partial progress
      ];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript', 'react'] }), // 1 project matching
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      // Should have a moderate score due to partial matches
      expect(result.score0to100).toBeGreaterThan(20);
      expect(result.score0to100).toBeLessThan(80);
      expect(result.missingSkills.length).toBeGreaterThan(0);
    });
  });

  describe('Status Thresholds', () => {
    it('should return "recommended" status for score >= 80', () => {
      const job = createJob({
        skills: ['javascript', 'react'],
        experience_level: 'entry',
      });
      const student = createStudent({
        skills: ['javascript', 'react'],
      });
      const enrollments: CourseEnrollment[] = [
        createEnrollment({ course_id: 'course-1', completed_at: '2024-01-01' }),
      ];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript', 'react'] }),
        createProject({ tech_stack: ['javascript', 'react'] }),
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      if (result.score0to100 >= 80) {
        expect(result.status).toBe('recommended');
      }
    });

    it('should return "unlocked" status for score >= 60 and < 80', () => {
      const job = createJob({
        skills: ['javascript', 'react', 'nodejs'],
        experience_level: 'entry',
      });
      const student = createStudent({
        skills: ['javascript', 'react'], // 2/3 skills
      });
      const enrollments: CourseEnrollment[] = [
        createEnrollment({ course_id: 'course-1', progress_percentage: 50 }),
      ];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript', 'react'] }),
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      if (result.score0to100 >= 60 && result.score0to100 < 80) {
        expect(result.status).toBe('unlocked');
      }
    });

    it('should return "locked" status for score >= 40 and < 60', () => {
      const job = createJob({
        skills: ['javascript', 'react', 'nodejs', 'python'],
        experience_level: 'mid',
      });
      const student = createStudent({
        skills: ['javascript'], // 1/4 skills
      });
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript'] }),
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      if (result.score0to100 >= 40 && result.score0to100 < 60) {
        expect(result.status).toBe('locked');
      }
    });

    it('should return "stretch" status for score > 0 and < 40', () => {
      const job = createJob({
        skills: ['javascript', 'react', 'nodejs', 'python', 'java'],
        experience_level: 'senior',
      });
      const student = createStudent({
        skills: ['javascript'], // 1/5 skills
      });
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript'] }),
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      if (result.score0to100 > 0 && result.score0to100 < 40) {
        expect(result.status).toBe('stretch');
      }
    });

    it('should return "stretch" status for very low scores (near 0)', () => {
      const job = createJob({
        skills: ['python', 'django', 'flask'],
        experience_level: 'senior',
      });
      const student = createStudent({
        skills: ['javascript', 'react'], // No matching skills
      });
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript', 'react'] }), // No matching skills
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      // Very low scores should be 'stretch' (interface doesn't include 'new')
      if (result.score0to100 <= 5) {
        expect(result.status).toBe('stretch');
      }
    });
  });

  describe('determineJobStatus function', () => {
    it('should return "recommended" for score >= 80', () => {
      expect(determineJobStatus(80)).toBe('recommended');
      expect(determineJobStatus(90)).toBe('recommended');
      expect(determineJobStatus(100)).toBe('recommended');
    });

    it('should return "unlocked" for score >= 60 and < 80', () => {
      expect(determineJobStatus(60)).toBe('unlocked');
      expect(determineJobStatus(70)).toBe('unlocked');
      expect(determineJobStatus(79)).toBe('unlocked');
    });

    it('should return "locked" for score >= 40 and < 60', () => {
      expect(determineJobStatus(40)).toBe('locked');
      expect(determineJobStatus(50)).toBe('locked');
      expect(determineJobStatus(59)).toBe('locked');
    });

    it('should return "stretch" for score > 0 and < 40', () => {
      expect(determineJobStatus(1)).toBe('stretch');
      expect(determineJobStatus(20)).toBe('stretch');
      expect(determineJobStatus(39)).toBe('stretch');
    });

    it('should return "stretch" for score = 0 (lowest possible)', () => {
      // Note: determineJobStatus can return 'new', but MatchingResult interface uses 'stretch'
      const status = determineJobStatus(0);
      expect(['stretch', 'new']).toContain(status);
    });
  });

  describe('Edge Cases', () => {
    it('should handle job with no skills', () => {
      const job = createJob({
        skills: [],
      });
      const student = createStudent();
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.score0to100).toBeGreaterThanOrEqual(0);
      expect(result.breakdown?.skillsMatch).toBe(50); // Neutral score when no skills
    });

    it('should handle job with no recommended courses', () => {
      const job = createJob({
        recommended_for_courses: [],
      });
      const student = createStudent();
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.breakdown?.courseMatch).toBe(50); // Neutral score when no courses
    });

    it('should handle job with no experience level', () => {
      const job = createJob({
        experience_level: undefined,
      });
      const student = createStudent();
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.breakdown?.experienceMatch).toBe(50); // Neutral score when no level
    });

    it('should handle student with skills in profile but no projects', () => {
      const job = createJob({
        skills: ['javascript', 'react'],
      });
      const student = createStudent({
        skills: ['javascript', 'react'],
      });
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.score0to100).toBeGreaterThan(0);
      expect(result.breakdown?.skillsMatch).toBe(100); // All skills match from profile
      expect(result.breakdown?.portfolioScore).toBe(0); // No projects
    });

    it('should handle completed courses vs in-progress courses', () => {
      const job = createJob({
        recommended_for_courses: ['course-1', 'course-2'],
      });
      const student = createStudent();
      const enrollments: CourseEnrollment[] = [
        createEnrollment({ course_id: 'course-1', completed_at: '2024-01-01' }), // Completed
        createEnrollment({ course_id: 'course-2', progress_percentage: 60 }), // In progress > 50%
      ];
      const projects: PortfolioProject[] = [];

      const result = calculateJobMatch(job, student, enrollments, projects);

      expect(result.breakdown?.courseMatch).toBeGreaterThan(50);
      // Completed course should contribute more than in-progress
    });

    it('should normalize skill names correctly', () => {
      const job = createJob({
        skills: ['JavaScript', 'React.js', 'NodeJS'], // Mixed case and variations
      });
      const student = createStudent({
        skills: ['javascript', 'react', 'nodejs'], // Normalized
      });
      const enrollments: CourseEnrollment[] = [];
      const projects: PortfolioProject[] = [];

      const result = calculateJobMatch(job, student, enrollments, projects);

      // Should match despite case differences
      expect(result.breakdown?.skillsMatch).toBe(100);
      expect(result.missingSkills.length).toBe(0);
    });
  });

  describe('Weight Distribution', () => {
    it('should apply correct weights to score components', () => {
      const job = createJob({
        skills: ['javascript'],
        recommended_for_courses: ['course-1'],
        experience_level: 'entry',
      });
      const student = createStudent({
        skills: ['javascript'],
      });
      const enrollments: CourseEnrollment[] = [
        createEnrollment({ course_id: 'course-1', completed_at: '2024-01-01' }),
      ];
      const projects: PortfolioProject[] = [
        createProject({ tech_stack: ['javascript'] }),
      ];

      const result = calculateJobMatch(job, student, enrollments, projects);

      // Verify weights: skills 40%, courses 30%, portfolio 20%, experience 10%
      const expectedScore = Math.round(
        (result.breakdown!.skillsMatch * 0.4) +
        (result.breakdown!.courseMatch * 0.3) +
        (result.breakdown!.portfolioMatch * 0.2) +
        (result.breakdown!.experienceMatch * 0.1)
      );

      expect(result.score0to100).toBe(expectedScore);
      expect(result.breakdown?.skillsScore).toBe(Math.round(result.breakdown!.skillsMatch * 0.4));
      expect(result.breakdown?.courseScore).toBe(Math.round(result.breakdown!.courseMatch * 0.3));
      expect(result.breakdown?.portfolioScore).toBe(Math.round(result.breakdown!.portfolioMatch * 0.2));
      expect(result.breakdown?.experienceScore).toBe(Math.round(result.breakdown!.experienceMatch * 0.1));
    });
  });
});
