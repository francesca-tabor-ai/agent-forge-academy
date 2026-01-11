/**
 * Test Helper Utilities
 * 
 * Common functions for subscription access control tests
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';

// Test user IDs
export const TEST_USERS = {
  PROFESSIONAL: '5d5182a0-f5ab-4f47-be2e-01fa70547bd6',
  ESSENTIAL: '76db4904-b24f-487a-b443-9474aeb25dfa',
} as const;

// Essential tier allowed courses
export const ESSENTIAL_ALLOWED_COURSES = [
  'prompt-engineering',
  'ai-content-pipelines',
  'reddit-ai-visibility',
  'seo-to-aeo',
  'ai-governance-eu-ai-act',
] as const;

// Restricted courses (not in Essential tier)
export const RESTRICTED_COURSES = [
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
] as const;

/**
 * Gets course ID from slug
 */
export async function getCourseIdBySlug(slug: string): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  return course?.id || null;
}

/**
 * Gets all course IDs
 */
export async function getAllCourseIds(): Promise<Record<string, string>> {
  const supabase = createServerSupabaseClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug')
    .eq('is_published', true);

  const courseMap: Record<string, string> = {};
  courses?.forEach((course) => {
    courseMap[course.slug] = course.id;
  });

  return courseMap;
}

/**
 * Creates a test subscription
 */
export async function createTestSubscription(
  userId: string,
  tier: 'essential' | 'professional',
  periodEnd?: Date
): Promise<string> {
  const supabase = createServerSupabaseClient();

  // Get student profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    throw new Error('Profile not found');
  }

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!studentProfile) {
    throw new Error('Student profile not found');
  }

  // Get tier config
  const { data: tierConfig } = await supabase
    .from('subscription_tier_config')
    .select('price_monthly')
    .eq('tier', tier)
    .single();

  const endDate = periodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert({
      student_profile_id: studentProfile.id,
      tier,
      status: 'active',
      price_monthly: tierConfig?.price_monthly || 39,
      currency: 'GBP',
      current_period_start: new Date().toISOString(),
      current_period_end: endDate.toISOString(),
    })
    .select('id')
    .single();

  if (error || !subscription) {
    throw new Error(`Failed to create test subscription: ${error?.message}`);
  }

  return subscription.id;
}

/**
 * Cleans up test subscription
 */
export async function cleanupTestSubscription(subscriptionId: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.from('subscriptions').delete().eq('id', subscriptionId);
}

/**
 * Verifies subscription access
 */
export async function verifyAccess(
  userId: string,
  courseId: string,
  expectedAccess: boolean
): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { data: hasAccess } = await supabase.rpc('has_course_access', {
    p_user_id: userId,
    p_course_id: courseId,
  });

  return hasAccess === expectedAccess;
}

/**
 * Test data factory
 */
export const TestData = {
  professionalUser: {
    id: TEST_USERS.PROFESSIONAL,
    tier: 'professional' as const,
  },
  essentialUser: {
    id: TEST_USERS.ESSENTIAL,
    tier: 'essential' as const,
  },
  allowedCourse: {
    slug: 'prompt-engineering',
  },
  restrictedCourse: {
    slug: 'multi-agent-systems',
  },
};
