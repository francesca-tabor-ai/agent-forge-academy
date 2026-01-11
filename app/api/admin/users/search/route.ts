import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users/search
 * 
 * Search users by email for autocomplete.
 * Requires admin role.
 * 
 * Query parameters:
 * - q: string (required) - Search query (email)
 * - limit: number (optional, default: 10, max: 50) - Number of results
 * 
 * Returns:
 * - users: Array of { user_id, email, full_name, role }
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
    const query = searchParams.get('q') || '';
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    if (!query || query.length < 2) {
      return NextResponse.json({
        users: [],
      });
    }

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

    // Filter users by email (case-insensitive)
    const queryLower = query.toLowerCase();
    const matchingUsers = usersData?.users
      ?.filter(u => u.email?.toLowerCase().includes(queryLower))
      .slice(0, limit)
      .map(u => ({ user_id: u.id, email: u.email || null })) || [];

    // Get profiles for these users to get role and full_name
    if (matchingUsers.length > 0) {
      const userIds = matchingUsers.map(u => u.user_id);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, role, id')
        .in('user_id', userIds);

      const profileIds = profiles?.map(p => p.id).filter(Boolean) || [];
      
      // Get student profiles for full_name
      const { data: studentProfiles } = await supabase
        .from('student_profiles')
        .select('profile_id, full_name')
        .in('profile_id', profileIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const fullNameMap = new Map(studentProfiles?.map(sp => [sp.profile_id, sp.full_name]) || []);

      // Combine data
      const users = matchingUsers.map(user => {
        const profile = profileMap.get(user.user_id);
        const fullName = profile ? fullNameMap.get(profile.id) || null : null;

        return {
          user_id: user.user_id,
          email: user.email,
          full_name: fullName,
          role: profile?.role || null,
        };
      });

      return NextResponse.json({ users });
    }

    return NextResponse.json({ users: [] });
  } catch (error) {
    console.error('Error in admin users search handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
