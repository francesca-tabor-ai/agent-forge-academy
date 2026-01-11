import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/subscription/change-tier
 * 
 * Changes a user's subscription tier (upgrade or downgrade)
 * 
 * Body:
 * {
 *   "newTier": "essential" | "professional",
 *   "effectiveImmediately": boolean (default: true)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { newTier, effectiveImmediately = true } = body;

    // Validate newTier
    if (!newTier || !['essential', 'professional'].includes(newTier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "essential" or "professional"' },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can change subscription tier' },
        { status: 403 }
      );
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, tier, status, current_period_end')
      .eq('student_profile_id', studentProfile.id)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Active subscription not found' },
        { status: 404 }
      );
    }

    // Check if already on the requested tier
    if (subscription.tier === newTier) {
      return NextResponse.json(
        { error: `Subscription is already on ${newTier} tier` },
        { status: 400 }
      );
    }

    // Determine change type
    const isUpgrade = subscription.tier === 'essential' && newTier === 'professional';
    const isDowngrade = subscription.tier === 'professional' && newTier === 'essential';

    // For downgrades, check for in-progress courses that will lose access
    if (isDowngrade) {
      const { data: coursesLosingAccess } = await supabase.rpc(
        'get_courses_losing_access_on_downgrade',
        { p_student_profile_id: studentProfile.id }
      );

      // Return warning if user has in-progress courses that will lose access
      if (coursesLosingAccess && coursesLosingAccess.length > 0) {
        return NextResponse.json(
          {
            error: 'downgrade_warning',
            message: 'You have in-progress courses that will lose access after downgrade',
            coursesLosingAccess: coursesLosingAccess.map((c: any) => ({
              id: c.course_id,
              slug: c.course_slug,
              title: c.course_title,
              progress: c.progress_percentage,
            })),
            requiresConfirmation: true,
          },
          { status: 200 } // 200 because this is a warning, not an error
        );
      }
    }

    // Calculate prorated amount (simplified - in production, use proper proration logic)
    const { data: oldTierConfig } = await supabase
      .from('subscription_tier_config')
      .select('price_monthly')
      .eq('tier', subscription.tier)
      .single();

    const { data: newTierConfig } = await supabase
      .from('subscription_tier_config')
      .select('price_monthly')
      .eq('tier', newTier)
      .single();

    const proratedAmount = isUpgrade
      ? (newTierConfig?.price_monthly || 0) - (oldTierConfig?.price_monthly || 0)
      : null; // Downgrades typically don't refund

    // Change subscription tier using database function
    const { data: changeResult, error: changeError } = await supabase.rpc(
      'change_subscription_tier',
      {
        p_subscription_id: subscription.id,
        p_new_tier: newTier,
        p_effective_immediately: effectiveImmediately,
        p_prorated_amount: proratedAmount,
      }
    );

    if (changeError) {
      console.error('Error changing subscription tier:', changeError);
      return NextResponse.json(
        { error: 'Failed to change subscription tier' },
        { status: 500 }
      );
    }

    // Invalidate Next.js cache for user-related pages
    revalidatePath('/student/courses');
    revalidatePath('/student/subscription');
    revalidatePath('/student/dashboard');

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Subscription ${isUpgrade ? 'upgraded' : 'downgraded'} successfully`,
      subscription: {
        id: subscription.id,
        oldTier: subscription.tier,
        newTier: newTier,
        changeType: isUpgrade ? 'upgrade' : 'downgrade',
        effectiveImmediately,
        proratedAmount,
      },
      // Include warning for downgrades
      ...(isDowngrade && {
        warning: 'Some courses may become inaccessible after the current billing period ends',
      }),
    });

  } catch (error) {
    console.error('Error in subscription change:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription/change-tier/confirm-downgrade
 * 
 * Confirms a downgrade after user acknowledges courses that will lose access
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newTier, confirmed } = body;

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Downgrade not confirmed' },
        { status: 400 }
      );
    }

    // Get student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile!.id)
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('student_profile_id', studentProfile!.id)
      .eq('status', 'active')
      .single();

    // Execute the downgrade
    const { data: changeResult, error: changeError } = await supabase.rpc(
      'change_subscription_tier',
      {
        p_subscription_id: subscription!.id,
        p_new_tier: newTier,
        p_effective_immediately: true,
        p_prorated_amount: null,
      }
    );

    if (changeError) {
      return NextResponse.json(
        { error: 'Failed to downgrade subscription' },
        { status: 500 }
      );
    }

    // Invalidate cache
    revalidatePath('/student/courses');
    revalidatePath('/student/subscription');
    revalidatePath('/student/dashboard');

    return NextResponse.json({
      success: true,
      message: 'Subscription downgraded successfully',
      subscription: changeResult,
    });

  } catch (error) {
    console.error('Error confirming downgrade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
