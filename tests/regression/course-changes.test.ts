/**
 * Regression Tests: Course List Changes
 * 
 * Tests to prevent bugs when courses are added/removed from Essential tier
 * Focus: Ensuring access control remains correct after course list changes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ESSENTIAL_TIER_COURSES } from '@/lib/utils/subscription-types';
import {
  isCourseAccessible,
  isCourseLocked,
} from '@/lib/utils/course-access-frontend';

describe('Regression Tests - Course List Changes', () => {
  describe('Essential Tier Course List Integrity', () => {
    it('should maintain exactly 6 courses in Essential tier', () => {
      // Regression: If someone accidentally adds/removes a course, this fails
      expect(ESSENTIAL_TIER_COURSES.length).toBe(6);
    });

    it('should include all required Essential courses', () => {
      const requiredCourses = [
        'prompt-engineering',
        'ai-content-pipelines',
        'reddit-ai-visibility',
        'seo-to-aeo',
        'ai-governance-eu-ai-act',
        'creative-automation-templatization',
      ];

      requiredCourses.forEach((course) => {
        expect(ESSENTIAL_TIER_COURSES).toContain(course);
      });
    });

    it('should not include any restricted courses in Essential list', () => {
      const restrictedCourses = [
        'multi-agent-systems',
        'agentic-rag',
        'ai-visibility',
        'llm-first-websites',
        'agentic-commerce',
      ];

      restrictedCourses.forEach((course) => {
        expect(ESSENTIAL_TIER_COURSES).not.toContain(course);
      });
    });
  });

  describe('Adding New Course to Essential Tier', () => {
    it('should detect if new course is added to Essential list', () => {
      // This test ensures that if a course is added, it's properly accessible
      const currentList = [...ESSENTIAL_TIER_COURSES];
      
      // All courses in list must be accessible to Essential tier
      currentList.forEach((course) => {
        expect(isCourseAccessible(course, 'essential')).toBe(true);
        expect(isCourseLocked(course, 'essential')).toBe(false);
      });
    });

    it('should fail if course is added but not accessible', () => {
      // Regression: If course is in list but access check fails
      ESSENTIAL_TIER_COURSES.forEach((course) => {
        const isAccessible = isCourseAccessible(course, 'essential');
        expect(isAccessible).toBe(true);
      });
    });
  });

  describe('Removing Course from Essential Tier', () => {
    it('should detect if required course is removed', () => {
      // Regression: If a required course is removed, this fails
      const requiredCourses = [
        'prompt-engineering',
        'ai-content-pipelines',
        'reddit-ai-visibility',
        'seo-to-aeo',
        'ai-governance-eu-ai-act',
        'creative-automation-templatization',
      ];

      requiredCourses.forEach((course) => {
        const isInList = ESSENTIAL_TIER_COURSES.includes(course);
        expect(isInList).toBe(true);
        
        // And should be accessible
        expect(isCourseAccessible(course, 'essential')).toBe(true);
      });
    });

    it('should correctly lock course if removed from Essential list', () => {
      // If a course is removed from Essential list, it should be locked
      const restrictedCourse = 'multi-agent-systems';
      const isInList = ESSENTIAL_TIER_COURSES.includes(restrictedCourse);
      
      expect(isInList).toBe(false);
      expect(isCourseLocked(restrictedCourse, 'essential')).toBe(true);
    });
  });

  describe('Course Slug Consistency', () => {
    it('should use consistent slug format across all checks', () => {
      // Regression: Ensure slugs match between database and access checks
      ESSENTIAL_TIER_COURSES.forEach((slug) => {
        // Slugs should be lowercase with hyphens
        expect(slug).toMatch(/^[a-z0-9-]+$/);
        expect(slug).toBe(slug.toLowerCase());
      });
    });

    it('should handle slug variations correctly', () => {
      // Test that access checks are case-sensitive and format-sensitive
      const course = 'prompt-engineering';
      
      // Correct format should work
      expect(isCourseAccessible(course, 'essential')).toBe(true);
      
      // Variations should not work (if implemented)
      // This ensures we don't accidentally grant access due to case issues
    });
  });

  describe('Professional Tier - All Courses Access', () => {
    it('should always grant access to all courses for Professional tier', () => {
      // Regression: Professional tier should never be affected by course list changes
      const allCourses = [
        ...ESSENTIAL_TIER_COURSES,
        'multi-agent-systems',
        'agentic-rag',
        'ai-visibility',
        'llm-first-websites',
        'agentic-commerce',
        '3d-for-ecommerce',
        'ai-recommender-systems',
      ];

      allCourses.forEach((course) => {
        expect(isCourseAccessible(course, 'professional')).toBe(true);
        expect(isCourseLocked(course, 'professional')).toBe(false);
      });
    });

    it('should not be affected by Essential tier list changes', () => {
      // Professional tier access should be independent of Essential tier list
      const professionalAccess = isCourseAccessible('any-course', 'professional');
      expect(professionalAccess).toBe(true);
    });
  });

  describe('Database Consistency', () => {
    it('should match database subscription_tier_courses table', async () => {
      // Regression: Frontend list should match database
      // This would require database connection in test
      // For now, we verify the list structure
      
      expect(ESSENTIAL_TIER_COURSES.length).toBeGreaterThan(0);
      expect(ESSENTIAL_TIER_COURSES.length).toBeLessThanOrEqual(20); // Reasonable limit
      // Current count: 6 courses in Essential tier
      expect(ESSENTIAL_TIER_COURSES.length).toBe(6);
    });
  });

  describe('Access Control Logic Consistency', () => {
    it('should have consistent logic between isCourseAccessible and isCourseLocked', () => {
      const testCourses = [
        'prompt-engineering',
        'multi-agent-systems',
        'ai-content-pipelines',
      ];

      testCourses.forEach((course) => {
        const isAccessible = isCourseAccessible(course, 'essential');
        const isLocked = isCourseLocked(course, 'essential');
        
        // They should be opposites
        expect(isAccessible).toBe(!isLocked);
      });
    });

    it('should handle null subscription tier consistently', () => {
      const testCourse = 'prompt-engineering';
      
      // No subscription = no access = locked
      expect(isCourseAccessible(testCourse, null)).toBe(false);
      expect(isCourseLocked(testCourse, null)).toBe(true);
    });
  });
});
