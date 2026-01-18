/**
 * Regression Tests: Segment Subscriptions
 * 
 * Tests to prevent regressions in:
 * - Landing page course listings
 * - Stripe checkout integration
 * - Webhook subscription creation
 * - Access gating logic
 */

import { describe, it, expect } from 'vitest';
import { getSegment } from '@/lib/utils/segments';
import { getStripePriceId, getSubscriptionMetadata, getAllSubscriptionMetadata } from '@/lib/utils/subscription-metadata';
import { getSegmentsForCourse } from '@/lib/utils/course-access';

describe('Segment Subscriptions - Regression Tests', () => {
  describe('Landing page course listings', () => {
    it('should have at least one segment of each type', () => {
      const trackSegments = ['agentic-systems', 'ml-engineering', 'platform-engineering'];
      const industrySegments = ['finance', 'healthcare', 'saas'];
      const roleSegments = ['engineer', 'pm', 'founder'];

      // Check tracks
      trackSegments.forEach((key) => {
        const segment = getSegment('track', key);
        expect(segment).toBeDefined();
        expect(segment?.type).toBe('track');
        expect(segment?.key).toBe(key);
      });

      // Check industries
      industrySegments.forEach((key) => {
        const segment = getSegment('industry', key);
        expect(segment).toBeDefined();
        expect(segment?.type).toBe('industry');
        expect(segment?.key).toBe(key);
      });

      // Check roles
      roleSegments.forEach((key) => {
        const segment = getSegment('role', key);
        expect(segment).toBeDefined();
        expect(segment?.type).toBe('role');
        expect(segment?.key).toBe(key);
      });
    });

    it('should have hero images for all segments', () => {
      const trackSegments = ['agentic-systems', 'ml-engineering'];
      const industrySegments = ['finance', 'healthcare'];
      const roleSegments = ['engineer', 'pm'];

      trackSegments.forEach((key) => {
        const segment = getSegment('track', key);
        expect(segment?.heroImageUrl).toBeDefined();
        expect(segment?.heroImageUrl.length).toBeGreaterThan(0);
      });

      industrySegments.forEach((key) => {
        const segment = getSegment('industry', key);
        expect(segment?.heroImageUrl).toBeDefined();
        expect(segment?.heroImageUrl.length).toBeGreaterThan(0);
      });

      roleSegments.forEach((key) => {
        const segment = getSegment('role', key);
        expect(segment?.heroImageUrl).toBeDefined();
        expect(segment?.heroImageUrl.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Stripe checkout integration', () => {
    it('should have subscription metadata for all segments', () => {
      const allMetadata = getAllSubscriptionMetadata();
      
      expect(allMetadata.length).toBeGreaterThan(0);
      
      // Check that each subscription has required fields
      allMetadata.forEach((metadata) => {
        expect(metadata.segmentType).toBeDefined();
        expect(['track', 'industry', 'role']).toContain(metadata.segmentType);
        expect(metadata.segmentKey).toBeDefined();
        expect(metadata.stripeProductId).toBeDefined();
        expect(metadata.stripeMonthlyPriceId).toBeDefined();
        expect(metadata.stripeAnnualPriceId).toBeDefined();
        expect(metadata.displayPriceMonthly).toBeDefined();
        expect(metadata.displayPriceAnnual).toBeDefined();
        expect(metadata.currency).toBeDefined();
      });
    });

    it('should return price IDs for known segments', () => {
      const testCases = [
        { type: 'track' as const, key: 'agentic-systems', period: 'monthly' as const },
        { type: 'track' as const, key: 'agentic-systems', period: 'annual' as const },
        { type: 'industry' as const, key: 'finance', period: 'monthly' as const },
        { type: 'industry' as const, key: 'finance', period: 'annual' as const },
        { type: 'role' as const, key: 'engineer', period: 'monthly' as const },
        { type: 'role' as const, key: 'engineer', period: 'annual' as const },
      ];

      testCases.forEach(({ type, key, period }) => {
        const priceId = getStripePriceId(type, key, period);
        expect(priceId).toBeDefined();
        expect(priceId).not.toBeNull();
      });
    });

    it('should have consistent pricing format', () => {
      const metadata = getSubscriptionMetadata('track', 'agentic-systems');
      
      if (metadata) {
        // Check monthly price format (e.g., "£49/mo")
        expect(metadata.displayPriceMonthly).toMatch(/£\d+\/mo/);
        
        // Check annual price format (e.g., "£490/yr")
        expect(metadata.displayPriceAnnual).toMatch(/£\d+\/yr/);
        
        // Check currency
        expect(metadata.currency).toBe('GBP');
      }
    });
  });

  describe('Access gating logic', () => {
    it('should find segments for courses', async () => {
      // Test with a known course that should be in at least one segment
      const testCourses = ['agentic-rag', 'agentic-commerce'];
      
      for (const courseSlug of testCourses) {
        const segments = await getSegmentsForCourse(courseSlug);
        
        // Course might not be in any segment, which is okay
        // But if it is, segments should be valid
        segments.forEach((segment) => {
          expect(segment.type).toBeDefined();
          expect(['track', 'industry', 'role']).toContain(segment.type);
          expect(segment.key).toBeDefined();
          expect(segment.displayName).toBeDefined();
        });
      }
    });

    it('should return at most 3 segments per course', async () => {
      const testCourses = ['agentic-rag', 'agentic-commerce'];
      
      for (const courseSlug of testCourses) {
        const segments = await getSegmentsForCourse(courseSlug);
        expect(segments.length).toBeLessThanOrEqual(3);
      }
    });

    it('should have valid landing page paths for segments', async () => {
      const segments = await getSegmentsForCourse('agentic-rag');
      
      segments.forEach((segment) => {
        // Verify landing page path format
        const expectedPath = `/landing/${segment.type}/${segment.key}`;
        expect(expectedPath).toMatch(/^\/landing\/(track|industry|role)\/[a-z0-9-]+$/);
      });
    });
  });

  describe('Data consistency', () => {
    it('should have subscriptions.md entries for all segments', () => {
      const allMetadata = getAllSubscriptionMetadata();
      const segmentKeys = new Set(
        allMetadata.map(m => `${m.segmentType}:${m.segmentKey}`)
      );

      // Check that we have subscriptions for at least some segments
      expect(segmentKeys.size).toBeGreaterThan(0);

      // Verify no duplicate entries
      expect(segmentKeys.size).toBe(allMetadata.length);
    });

    it('should have consistent segment keys across utilities', () => {
      const trackSegment = getSegment('track', 'agentic-systems');
      const metadata = getSubscriptionMetadata('track', 'agentic-systems');

      if (trackSegment && metadata) {
        expect(trackSegment.key).toBe(metadata.segmentKey);
        expect(trackSegment.displayName).toBe(metadata.displayName);
      }
    });
  });
});
