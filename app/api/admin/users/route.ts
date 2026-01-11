import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * 
 * List all users with pagination and search.
 * Requires admin role.
 * 
 * Query parameters:
 * - search: string (optional) - Search by email or user_id
 * - offset: number (optional, default: 0) - Pagination offset
 * - limit: number (optional, default: 50, max: 100) - Number of results per page
 * 
 * Returns:
 * - users: Array of { user_id, email, full_name, role, created_at }
 * - total: number - Total count of users (before pagination)
 * - offset: number - Current offset
 * - limit: number - Current limit
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();

    // Fetch all users from auth to enable email search
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: usersError.message },
        { status: 500 }
      );
    }

    // Create a map of user_id -> user data (email)
    const userMap = new Map(
      usersData?.users?.map(u => [u.id, { email: u.email || '', created_at: u.created_at }]) || []
    );

    // If searching by email, filter user_ids first
    let filteredUserIds: string[] | null = null;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUserIds = Array.from(userMap.entries())
        .filter(([userId, userData]) => {
          const emailMatch = userData.email?.toLowerCase().includes(searchLower);
          const userIdMatch = userId.toLowerCase().includes(searchLower);
          return emailMatch || userIdMatch;
        })
        .map(([userId]) => userId);
    }

    // Build query for profiles
    let profilesQuery = supabase
      .from('profiles')
      .select('user_id, role, created_at, id', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply user_id filter if searching
    if (filteredUserIds && filteredUserIds.length > 0) {
      profilesQuery = profilesQuery.in('user_id', filteredUserIds);
    } else if (filteredUserIds && filteredUserIds.length === 0) {
      // No matches found
      return NextResponse.json({
        users: [],
        total: 0,
        offset,
        limit,
      });
    }

    // Get total count before pagination
    let countQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (filteredUserIds && filteredUserIds.length > 0) {
      countQuery = countQuery.in('user_id', filteredUserIds);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting profiles:', countError);
    }

    // Apply pagination
    profilesQuery = profilesQuery.range(offset, offset + limit - 1);

    // Execute query
    const { data: profiles, error: profilesError } = await profilesQuery;

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        users: [],
        total: count || 0,
        offset,
        limit,
      });
    }

    // Get profile IDs for student_profiles lookup
    const profileIds = profiles.map(p => p.id).filter(Boolean);

    // Fetch student profiles for full_name
    const { data: studentProfiles, error: studentProfilesError } = await supabase
      .from('student_profiles')
      .select('profile_id, full_name')
      .in('profile_id', profileIds);

    if (studentProfilesError) {
      console.error('Error fetching student profiles:', studentProfilesError);
      // Continue without full_name if error (non-critical)
    }

    // Create a map of profile_id -> full_name
    const fullNameMap = new Map(
      studentProfiles?.map(sp => [sp.profile_id, sp.full_name]) || []
    );

    // Get user IDs for subscription lookup
    const userIds = profiles.map(p => p.user_id).filter(Boolean);

    // Fetch subscriptions for these users
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('user_id, status, stripe_price_id, current_period_end')
      .in('user_id', userIds);

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      // Continue without subscription data if error (non-critical)
    }

    // Fetch all subscription plans to map stripe_price_id to tier name
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id, name, stripe_price_id');

    if (plansError) {
      console.error('Error fetching subscription plans:', plansError);
    }

    // Create maps for quick lookups
    const subscriptionMap = new Map(
      subscriptions?.map(s => [s.user_id, s]) || []
    );
    const planMap = new Map(
      plans?.map(p => [p.stripe_price_id, p]) || []
    );

    // Helper function to get tier display name from plan ID
    const getTierDisplayName = (planId: string | null): string | null => {
      if (!planId) return null;
      
      // Map plan IDs to display names
      if (planId.startsWith('essential_')) return 'Essential';
      if (planId.startsWith('pro_')) return 'Professional';
      if (planId.startsWith('starter_')) return 'Starter';
      
      // Fallback to plan name if available
      return planId;
    };

    // Helper function to normalize status
    const normalizeStatus = (status: string | null): string | null => {
      if (!status) return null;
      
      // Map Stripe statuses to normalized values
      const statusMap: Record<string, string> = {
        'active': 'active',
        'trialing': 'active', // Treat trialing as active
        'canceled': 'canceled',
        'past_due': 'past_due',
        'unpaid': 'past_due',
        'incomplete': 'past_due',
        'incomplete_expired': 'canceled',
      };
      
      return statusMap[status.toLowerCase()] || status;
    };

    // Combine data
    const users = profiles.map(profile => {
      const userData = userMap.get(profile.user_id);
      const fullName = fullNameMap.get(profile.id) || null;
      const subscription = subscriptionMap.get(profile.user_id);
      
      // Get tier from subscription plan
      let tier: string | null = null;
      let planId: string | null = null;
      if (subscription?.stripe_price_id) {
        const plan = planMap.get(subscription.stripe_price_id);
        planId = plan?.id || null;
        tier = getTierDisplayName(planId);
      }

      // Get normalized status
      const status = normalizeStatus(subscription?.status || null);
      
      // Detect mismatches
      const hasMismatch = 
        (status === 'active' && !tier) || // Active but no tier
        (status && !subscription); // Status exists but subscription data missing

      return {
        user_id: profile.user_id,
        email: userData?.email || null,
        full_name: fullName,
        role: profile.role,
        created_at: profile.created_at,
        subscription: subscription ? {
          tier,
          status,
          current_period_end: subscription.current_period_end,
          plan_id: planId,
        } : null,
        has_subscription_mismatch: hasMismatch,
      };
    });

    return NextResponse.json({
      users,
      total: count || 0,
      offset,
      limit,
    });
  } catch (error) {
    console.error('Error in admin users handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
