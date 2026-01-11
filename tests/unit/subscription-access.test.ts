/**
 * Unit Tests: Subscription Access Control
 * 
 * Tests for subscription access utility functions
 * Focus: Preventing unauthorized access and subscription mismatch bugs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isCourseAccessible,
  isCourseLocked,
  getCourseLockReason,
  getUpgradeMessage,
} from '@/lib/utils/course-access-frontend';
import { ESSENTIAL_TIER_COURSES } from '@/lib/utils/subscription-access';

describe('Subscription Access Control - Unit Tests', () => {
  describe('isCourseAccessible', () => {
    it('should return true for Professional tier accessing any course', () => {
      const result = isCourseAccessible('multi-agent-systems', 'professional');
      expect(result).toBe(true);
    });

    it('should return true for Essential tier accessing allowed course', () => {
      const result = isCourseAccessible('prompt-engineering', 'essential');
      expect(result).toBe(true);
    });

    it('should return false for Essential tier accessing restricted course', () => {
      const result = isCourseAccessible('multi-agent-systems', 'essential');
      expect(result).toBe(false);
    });

    it('should return false when no subscription tier', () => {
      const result = isCourseAccessible('prompt-engineering', null);
      expect(result).toBe(false);
    });

    it('should return false for unknown tier', () => {
      // @ts-expect-error - Testing invalid tier
      const result = isCourseAccessible('prompt-engineering', 'unknown');
      expect(result).toBe(false);
    });

    it('should handle all Essential tier allowed courses', () => {
      ESSENTIAL_TIER_COURSES.forEach((courseSlug) => {
        const result = isCourseAccessible(courseSlug, 'essential');
        expect(result).toBe(true);
      });
    });
  });

  describe('isCourseLocked', () => {
    it('should return false for Professional tier (all unlocked)', () => {
      const result = isCourseLocked('any-course', 'professional');
      expect(result).toBe(false);
    });

    it('should return false for Essential tier accessing allowed course', () => {
      const result = isCourseLocked('prompt-engineering', 'essential');
      expect(result).toBe(false);
    });

    it('should return true for Essential tier accessing restricted course', () => {
      const result = isCourseLocked('multi-agent-systems', 'essential');
      expect(result).toBe(true);
    });

    it('should return true when no subscription', () => {
      const result = isCourseLocked('prompt-engineering', null);
      expect(result).toBe(true);
    });
  });

  describe('getCourseLockReason', () => {
    it('should return reason for no subscription', () => {
      const reason = getCourseLockReason(null);
      expect(reason).toBe('A subscription is required to access this course.');
    });

    it('should return reason for Essential tier restricted course', () => {
      const reason = getCourseLockReason('essential');
      expect(reason).toBe('This course requires Professional Access.');
    });

    it('should return null for Professional tier', () => {
      const reason = getCourseLockReason('professional');
      expect(reason).toBeNull();
    });
  });

  describe('getUpgradeMessage', () => {
    it('should return upgrade message for no subscription', () => {
      const message = getUpgradeMessage(null);
      expect(message).toContain('Upgrade to Professional Access');
    });

    it('should return upgrade message for Essential tier', () => {
      const message = getUpgradeMessage('essential');
      expect(message).toContain('Upgrade to Professional Access');
    });

    it('should return generic message for unknown tier', () => {
      // @ts-expect-error - Testing invalid tier
      const message = getUpgradeMessage('unknown');
      expect(message).toContain('Upgrade');
    });
  });

  describe('Edge Cases - Preventing Bugs', () => {
    it('should handle empty course slug', () => {
      const result = isCourseAccessible('', 'professional');
      expect(result).toBe(false);
    });

    it('should handle invalid course slug format', () => {
      const result = isCourseAccessible('invalid-course-slug-123', 'essential');
      expect(result).toBe(false);
    });

    it('should be case-sensitive for course slugs', () => {
      const result = isCourseAccessible('Prompt-Engineering', 'essential');
      expect(result).toBe(false); // Should be lowercase
    });

    it('should handle all Professional courses as accessible', () => {
      const allCourses = [
        'prompt-engineering',
        'ai-content-pipelines',
        'multi-agent-systems',
        'agentic-rag',
        'ai-visibility',
        'llm-first-websites',
        'agentic-commerce',
        '3d-for-ecommerce',
        'ai-recommender-systems',
        'ai-native-software-delivery-pipelines',
        'spec-driven-development',
        'vibe-coding-cursor-supabase',
      ];

      allCourses.forEach((courseSlug) => {
        const result = isCourseAccessible(courseSlug, 'professional');
        expect(result).toBe(true);
      });
    });

    it('should correctly identify all Essential restricted courses', () => {
      const restrictedCourses = [
        'multi-agent-systems',
        'agentic-rag',
        'ai-visibility',
        'llm-first-websites',
        'agentic-commerce',
      ];

      restrictedCourses.forEach((courseSlug) => {
        const result = isCourseLocked(courseSlug, 'essential');
        expect(result).toBe(true);
      });
    });
  });

  describe('Regression Tests - Course List Changes', () => {
    it('should detect if Essential course list changes', () => {
      // This test ensures we catch if someone accidentally modifies the allowed list
      const expectedCourses = [
        'prompt-engineering',
        'ai-content-pipelines',
        'reddit-ai-visibility',
        'seo-to-aeo',
        'ai-governance-eu-ai-act',
      ];

      expect(ESSENTIAL_TIER_COURSES.length).toBe(5);
      expectedCourses.forEach((course) => {
        expect(ESSENTIAL_TIER_COURSES).toContain(course);
      });
    });

    it('should fail if Essential course is removed from list', () => {
      // This is a regression test - if a course is removed, this should fail
      const requiredCourses = [
        'prompt-engineering',
        'ai-content-pipelines',
        'reddit-ai-visibility',
        'seo-to-aeo',
        'ai-governance-eu-ai-act',
      ];

      requiredCourses.forEach((course) => {
        const isAccessible = isCourseAccessible(course, 'essential');
        expect(isAccessible).toBe(true);
      });
    });

    it('should detect if new course is added to Essential list', () => {
      // If a new course is added, this test ensures it's properly accessible
      const currentList = [...ESSENTIAL_TIER_COURSES];
      
      // Verify all courses in list are accessible
      currentList.forEach((course) => {
        expect(isCourseAccessible(course, 'essential')).toBe(true);
      });
    });
  });
});
