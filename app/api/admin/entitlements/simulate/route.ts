import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/entitlements/simulate
 * 
 * Simulates user access to all courses.
 * Requires admin role.
 * 
 * Query parameters:
 * - user_id: string (required) - User ID to simulate
 * 
 * Returns:
 * - user: { id, email, full_name }
 * - subscription: { tier, status, current_period_end } | null
 * - courses: Array of { id, slug, title, has_access, reason }
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get user info
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { status: 404 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('user_id', userId)
      .maybeSingle();

    // Get user's subscription
    // Try the old subscription system first (student_profile_id based)
    let subscription: { tier: string; status: string; current_period_end: string | null } | null = null;
    
    if (profile) {
      // Get student profile
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (studentProfile) {
        // Try old subscription system
        const { data: oldSubscription } = await supabase
          .from('subscriptions')
          .select('tier, status, current_period_end')
          .eq('student_profile_id', studentProfile.id)
          .eq('status', 'active')
          .gt('current_period_end', new Date().toISOString())
          .maybeSingle();

        if (oldSubscription) {
          subscription = {
            tier: oldSubscription.tier,
            status: oldSubscription.status,
            current_period_end: oldSubscription.current_period_end,
          };
        }
      }
    }

    // If no old subscription, try the new Stripe-based subscription system
    if (!subscription) {
      const { data: stripeSubscription } = await supabase
        .from('subscriptions')
        .select('status, stripe_price_id, current_period_end')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .gt('current_period_end', new Date().toISOString())
        .maybeSingle();

      if (stripeSubscription) {
        // Get plan details to determine tier
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('stripe_price_id', stripeSubscription.stripe_price_id)
          .maybeSingle();

        // Map plan ID to tier (assuming plan IDs like 'essential_monthly', 'pro_monthly')
        let tier = 'none';
        if (plan?.id) {
          if (plan.id.includes('essential')) {
            tier = 'essential';
          } else if (plan.id.includes('pro') || plan.id.includes('professional')) {
            tier = 'professional';
          }
        }

        subscription = {
          tier,
          status: stripeSubscription.status,
          current_period_end: stripeSubscription.current_period_end,
        };
      }
    }

    // Get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, slug, title, is_published')
      .order('title');

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to fetch courses', details: coursesError.message },
        { status: 500 }
      );
    }

    // Get Essential tier course mappings
    const { data: essentialCourses } = await supabase
      .from('subscription_tier_courses')
      .select('course_id')
      .eq('tier', 'essential');

    const essentialCourseIds = new Set(
      (essentialCourses || []).map(ec => ec.course_id)
    );

    // Get tier config
    const { data: tierConfig } = await supabase
      .from('subscription_tier_config')
      .select('tier, has_all_access');

    const professionalHasAllAccess = (tierConfig || []).find(tc => tc.tier === 'professional')?.has_all_access || false;

    // Simulate access for each course
    const coursesWithAccess = (courses || []).map(course => {
      let hasAccess = false;
      let reason = '';

      // Check if course is published
      if (!course.is_published) {
        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          has_access: false,
          reason: 'Course is not published',
        };
      }

      // Check subscription
      if (!subscription) {
        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          has_access: false,
          reason: 'No active subscription',
        };
      }

      // Check if subscription is active
      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          has_access: false,
          reason: `Subscription status: ${subscription.status}`,
        };
      }

      // Check if subscription period has ended
      if (subscription.current_period_end) {
        const periodEnd = new Date(subscription.current_period_end);
        if (periodEnd < new Date()) {
          return {
            id: course.id,
            slug: course.slug,
            title: course.title,
            has_access: false,
            reason: 'Subscription period has ended',
          };
        }
      }

      // Check tier-based access
      if (subscription.tier === 'professional' && professionalHasAllAccess) {
        hasAccess = true;
        reason = 'Professional tier has access to all courses';
      } else if (subscription.tier === 'essential') {
        if (essentialCourseIds.has(course.id)) {
          hasAccess = true;
          reason = 'Essential tier - course in allowlist';
        } else {
          hasAccess = false;
          reason = 'Essential tier - course not in allowlist';
        }
      } else {
        hasAccess = false;
        reason = `Unknown or invalid tier: ${subscription.tier}`;
      }

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        has_access: hasAccess,
        reason,
      };
    });

    return NextResponse.json({
      user: {
        id: userId,
        email: userData.user.email,
        full_name: profile?.full_name || null,
      },
      subscription,
      courses: coursesWithAccess,
    });
  } catch (error) {
    console.error('Error in simulate handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
