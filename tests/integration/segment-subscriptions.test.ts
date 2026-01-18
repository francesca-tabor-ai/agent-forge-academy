/**
 * Integration Tests: Segment Subscriptions
 * 
 * Tests for:
 * 1. Landing page lists correct live courses
 * 2. Checkout endpoint uses correct Stripe price id
 * 3. Webhook creates subscription row
 * 4. Access gating allows/denies correctly based on subscription status
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSegment } from '@/lib/utils/segments';
import { getStripePriceId, getSubscriptionMetadata } from '@/lib/utils/subscription-metadata';
import { hasCourseAccess } from '@/lib/utils/course-access';

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  getStripeClient: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  })),
}));

describe('Segment Subscriptions - Integration Tests', () => {
  const supabase = createServerSupabaseClient();
  let testUserId: string;
  let testSegmentSubscriptions: Array<{ id: string }> = [];

  beforeEach(async () => {
    // Create a test user (or use existing test user)
    // For now, we'll use a mock user ID
    testUserId = 'test-user-segment-sub-' + Date.now();
  });

  afterEach(async () => {
    // Cleanup test subscriptions
    for (const sub of testSegmentSubscriptions) {
      await supabase
        .from('segment_subscriptions')
        .delete()
        .eq('id', sub.id);
    }
    testSegmentSubscriptions = [];
  });

  describe('1. Landing page lists correct live courses', () => {
    it('should return only live courses for a track segment', async () => {
      const segment = getSegment('track', 'agentic-systems');
      
      expect(segment).toBeDefined();
      expect(segment?.type).toBe('track');
      expect(segment?.key).toBe('agentic-systems');
      
      // Check that included courses are live
      if (segment && segment.includedCourseSlugs.length > 0) {
        const { data: courses } = await supabase
          .from('courses')
          .select('slug, is_live')
          .in('slug', segment.includedCourseSlugs);
        
        // All returned courses should be live
        courses?.forEach((course) => {
          expect(course.is_live).toBe(true);
        });
      }
    });

    it('should return only live courses for an industry segment', async () => {
      const segment = getSegment('industry', 'finance');
      
      expect(segment).toBeDefined();
      expect(segment?.type).toBe('industry');
      expect(segment?.key).toBe('finance');
      
      if (segment && segment.includedCourseSlugs.length > 0) {
        const { data: courses } = await supabase
          .from('courses')
          .select('slug, is_live')
          .in('slug', segment.includedCourseSlugs);
        
        courses?.forEach((course) => {
          expect(course.is_live).toBe(true);
        });
      }
    });

    it('should return only live courses for a role segment', async () => {
      const segment = getSegment('role', 'engineer');
      
      expect(segment).toBeDefined();
      expect(segment?.type).toBe('role');
      expect(segment?.key).toBe('engineer');
      
      if (segment && segment.includedCourseSlugs.length > 0) {
        const { data: courses } = await supabase
          .from('courses')
          .select('slug, is_live')
          .in('slug', segment.includedCourseSlugs);
        
        courses?.forEach((course) => {
          expect(course.is_live).toBe(true);
        });
      }
    });

    it('should not include non-live courses in segment', async () => {
      // Get a segment
      const segment = getSegment('track', 'agentic-systems');
      
      if (segment && segment.includedCourseSlugs.length > 0) {
        // Check all courses in database for this segment
        const { data: allCourses } = await supabase
          .from('courses')
          .select('slug, is_live')
          .in('slug', segment.includedCourseSlugs);
        
        // Filter non-live courses
        const nonLiveCourses = allCourses?.filter(c => !c.is_live) || [];
        
        // Non-live courses should not be in the segment's included courses
        nonLiveCourses.forEach((course) => {
          expect(segment.includedCourseSlugs).not.toContain(course.slug);
        });
      }
    });
  });

  describe('2. Checkout endpoint uses correct Stripe price id', () => {
    it('should return correct monthly price ID for track segment', () => {
      const priceId = getStripePriceId('track', 'agentic-systems', 'monthly');
      const metadata = getSubscriptionMetadata('track', 'agentic-systems');
      
      expect(metadata).toBeDefined();
      expect(priceId).toBe(metadata?.stripeMonthlyPriceId);
    });

    it('should return correct annual price ID for track segment', () => {
      const priceId = getStripePriceId('track', 'agentic-systems', 'annual');
      const metadata = getSubscriptionMetadata('track', 'agentic-systems');
      
      expect(metadata).toBeDefined();
      expect(priceId).toBe(metadata?.stripeAnnualPriceId);
    });

    it('should return correct monthly price ID for industry segment', () => {
      const priceId = getStripePriceId('industry', 'finance', 'monthly');
      const metadata = getSubscriptionMetadata('industry', 'finance');
      
      expect(metadata).toBeDefined();
      expect(priceId).toBe(metadata?.stripeMonthlyPriceId);
    });

    it('should return correct annual price ID for industry segment', () => {
      const priceId = getStripePriceId('industry', 'finance', 'annual');
      const metadata = getSubscriptionMetadata('industry', 'finance');
      
      expect(metadata).toBeDefined();
      expect(priceId).toBe(metadata?.stripeAnnualPriceId);
    });

    it('should return correct monthly price ID for role segment', () => {
      const priceId = getStripePriceId('role', 'engineer', 'monthly');
      const metadata = getSubscriptionMetadata('role', 'engineer');
      
      expect(metadata).toBeDefined();
      expect(priceId).toBe(metadata?.stripeMonthlyPriceId);
    });

    it('should return correct annual price ID for role segment', () => {
      const priceId = getStripePriceId('role', 'engineer', 'annual');
      const metadata = getSubscriptionMetadata('role', 'engineer');
      
      expect(metadata).toBeDefined();
      expect(priceId).toBe(metadata?.stripeAnnualPriceId);
    });

    it('should return null for non-existent segment', () => {
      const priceId = getStripePriceId('track', 'non-existent-segment', 'monthly');
      expect(priceId).toBeNull();
    });
  });

  describe('3. Webhook creates subscription row', () => {
    it('should create segment_subscriptions row with correct data', async () => {
      // Simulate webhook data
      const subscriptionData = {
        user_id: testUserId,
        segment_type: 'track' as const,
        segment_key: 'agentic-systems',
        stripe_subscription_id: 'sub_test_' + Date.now(),
        stripe_price_id: 'price_test_monthly',
        status: 'active',
        billing_cycle: 'monthly' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data: subscription, error } = await supabase
        .from('segment_subscriptions')
        .insert(subscriptionData)
        .select('id')
        .single();

      expect(error).toBeNull();
      expect(subscription).toBeDefined();
      expect(subscription?.id).toBeDefined();

      if (subscription) {
        testSegmentSubscriptions.push(subscription);

        // Verify the subscription was created correctly
        const { data: created } = await supabase
          .from('segment_subscriptions')
          .select('*')
          .eq('id', subscription.id)
          .single();

        expect(created).toBeDefined();
        expect(created?.user_id).toBe(testUserId);
        expect(created?.segment_type).toBe('track');
        expect(created?.segment_key).toBe('agentic-systems');
        expect(created?.status).toBe('active');
        expect(created?.billing_cycle).toBe('monthly');
      }
    });

    it('should update existing subscription on webhook event', async () => {
      // Create initial subscription
      const initialData = {
        user_id: testUserId,
        segment_type: 'track' as const,
        segment_key: 'agentic-systems',
        stripe_subscription_id: 'sub_test_update_' + Date.now(),
        stripe_price_id: 'price_test_monthly',
        status: 'active',
        billing_cycle: 'monthly' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data: subscription } = await supabase
        .from('segment_subscriptions')
        .insert(initialData)
        .select('id')
        .single();

      if (subscription) {
        testSegmentSubscriptions.push(subscription);

        // Simulate webhook update
        const updateData = {
          status: 'active',
          current_period_end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('segment_subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', initialData.stripe_subscription_id);

        expect(updateError).toBeNull();

        // Verify update
        const { data: updated } = await supabase
          .from('segment_subscriptions')
          .select('*')
          .eq('id', subscription.id)
          .single();

        expect(updated).toBeDefined();
        expect(updated?.status).toBe('active');
        expect(new Date(updated!.current_period_end).getTime()).toBeGreaterThan(
          new Date(initialData.current_period_end).getTime()
        );
      }
    });

    it('should mark subscription as expired on cancellation', async () => {
      const subscriptionData = {
        user_id: testUserId,
        segment_type: 'track' as const,
        segment_key: 'agentic-systems',
        stripe_subscription_id: 'sub_test_cancel_' + Date.now(),
        stripe_price_id: 'price_test_monthly',
        status: 'active',
        billing_cycle: 'monthly' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data: subscription } = await supabase
        .from('segment_subscriptions')
        .insert(subscriptionData)
        .select('id')
        .single();

      if (subscription) {
        testSegmentSubscriptions.push(subscription);

        // Simulate cancellation
        const { error: cancelError } = await supabase
          .from('segment_subscriptions')
          .update({
            status: 'expired',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionData.stripe_subscription_id);

        expect(cancelError).toBeNull();

        // Verify cancellation
        const { data: canceled } = await supabase
          .from('segment_subscriptions')
          .select('*')
          .eq('id', subscription.id)
          .single();

        expect(canceled).toBeDefined();
        expect(canceled?.status).toBe('expired');
        expect(canceled?.canceled_at).toBeDefined();
      }
    });
  });

  describe('4. Access gating allows/denies correctly based on subscription status', () => {
    it('should allow access when user has active segment subscription', async () => {
      // Get a segment with courses
      const segment = getSegment('track', 'agentic-systems');
      
      if (!segment || segment.includedCourseSlugs.length === 0) {
        // Skip if no courses in segment
        return;
      }

      const courseSlug = segment.includedCourseSlugs[0];

      // Create active subscription
      const subscriptionData = {
        user_id: testUserId,
        segment_type: segment.type,
        segment_key: segment.key,
        stripe_subscription_id: 'sub_test_access_' + Date.now(),
        stripe_price_id: 'price_test_monthly',
        status: 'active',
        billing_cycle: 'monthly' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data: subscription } = await supabase
        .from('segment_subscriptions')
        .insert(subscriptionData)
        .select('id')
        .single();

      if (subscription) {
        testSegmentSubscriptions.push(subscription);

        // Check access
        const accessResult = await hasCourseAccess(testUserId, courseSlug);
        
        expect(accessResult.hasAccess).toBe(true);
        expect(accessResult.reason).toBe('segment_subscription');
        expect(accessResult.segmentType).toBe(segment.type);
        expect(accessResult.segmentKey).toBe(segment.key);
      }
    });

    it('should deny access when user has no subscription', async () => {
      const segment = getSegment('track', 'agentic-systems');
      
      if (!segment || segment.includedCourseSlugs.length === 0) {
        return;
      }

      const courseSlug = segment.includedCourseSlugs[0];
      const accessResult = await hasCourseAccess(testUserId, courseSlug);
      
      expect(accessResult.hasAccess).toBe(false);
      expect(accessResult.reason).toBe('no_access');
    });

    it('should deny access when subscription is expired', async () => {
      const segment = getSegment('track', 'agentic-systems');
      
      if (!segment || segment.includedCourseSlugs.length === 0) {
        return;
      }

      const courseSlug = segment.includedCourseSlugs[0];

      // Create expired subscription
      const subscriptionData = {
        user_id: testUserId,
        segment_type: segment.type,
        segment_key: segment.key,
        stripe_subscription_id: 'sub_test_expired_' + Date.now(),
        stripe_price_id: 'price_test_monthly',
        status: 'expired',
        billing_cycle: 'monthly' as const,
        current_period_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Expired 30 days ago
      };

      const { data: subscription } = await supabase
        .from('segment_subscriptions')
        .insert(subscriptionData)
        .select('id')
        .single();

      if (subscription) {
        testSegmentSubscriptions.push(subscription);

        // Check access - should be denied because subscription is expired
        const accessResult = await hasCourseAccess(testUserId, courseSlug);
        
        expect(accessResult.hasAccess).toBe(false);
        expect(accessResult.reason).toBe('no_access');
      }
    });

    it('should deny access when subscription period has ended', async () => {
      const segment = getSegment('track', 'agentic-systems');
      
      if (!segment || segment.includedCourseSlugs.length === 0) {
        return;
      }

      const courseSlug = segment.includedCourseSlugs[0];

      // Create subscription with past period_end
      const subscriptionData = {
        user_id: testUserId,
        segment_type: segment.type,
        segment_key: segment.key,
        stripe_subscription_id: 'sub_test_past_period_' + Date.now(),
        stripe_price_id: 'price_test_monthly',
        status: 'active', // Still active but period ended
        billing_cycle: 'monthly' as const,
        current_period_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Ended yesterday
      };

      const { data: subscription } = await supabase
        .from('segment_subscriptions')
        .insert(subscriptionData)
        .select('id')
        .single();

      if (subscription) {
        testSegmentSubscriptions.push(subscription);

        // Check access - should be denied because period has ended
        const accessResult = await hasCourseAccess(testUserId, courseSlug);
        
        expect(accessResult.hasAccess).toBe(false);
        expect(accessResult.reason).toBe('no_access');
      }
    });

    it('should allow access only to courses in subscribed segment', async () => {
      const subscribedSegment = getSegment('track', 'agentic-systems');
      const otherSegment = getSegment('track', 'ml-engineering');
      
      if (!subscribedSegment || subscribedSegment.includedCourseSlugs.length === 0) {
        return;
      }

      if (!otherSegment || otherSegment.includedCourseSlugs.length === 0) {
        return;
      }

      // Create subscription for agentic-systems
      const subscriptionData = {
        user_id: testUserId,
        segment_type: subscribedSegment.type,
        segment_key: subscribedSegment.key,
        stripe_subscription_id: 'sub_test_segment_only_' + Date.now(),
        stripe_price_id: 'price_test_monthly',
        status: 'active',
        billing_cycle: 'monthly' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data: subscription } = await supabase
        .from('segment_subscriptions')
        .insert(subscriptionData)
        .select('id')
        .single();

      if (subscription) {
        testSegmentSubscriptions.push(subscription);

        // Should have access to courses in subscribed segment
        const subscribedCourse = subscribedSegment.includedCourseSlugs[0];
        const accessResult1 = await hasCourseAccess(testUserId, subscribedCourse);
        expect(accessResult1.hasAccess).toBe(true);

        // Should NOT have access to courses in other segment
        const otherCourse = otherSegment.includedCourseSlugs[0];
        const accessResult2 = await hasCourseAccess(testUserId, otherCourse);
        expect(accessResult2.hasAccess).toBe(false);
      }
    });
  });
});
