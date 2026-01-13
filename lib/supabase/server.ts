import 'server-only';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/types/roles';

/**
 * Creates a Supabase client for server-side operations
 * Uses the service role key for admin operations
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a Supabase client for user operations (respects RLS)
 * Uses the anon key and user's session
 */
export async function createUserSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Gets the current user's role from Supabase
 * Returns null if not authenticated
 * Simplified role model: student, recruiter, admin
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role = profile?.role as string;
  
  // Map deprecated tutor/instructor roles to admin (migrated in database)
  if (role === 'tutor' || role === 'instructor') {
    return 'admin';
  }
  
  return (role as UserRole) || null;
}

/**
 * Checks if user has the required role
 * Simplified role model: student, recruiter, admin
 */
export async function hasRole(
  requiredRole: UserRole
): Promise<boolean> {
  const role = await getUserRole();
  return role === requiredRole;
}

/**
 * Checks if user has any of the required roles
 * Simplified role model: student, recruiter, admin
 */
export async function hasAnyRole(
  requiredRoles: Array<UserRole>
): Promise<boolean> {
  const role = await getUserRole();
  if (role === null) {
    return false;
  }
  return requiredRoles.includes(role);
}

/**
 * Requires admin role for API routes
 * Returns 401 if unauthenticated, 403 if not admin
 * Returns the user if authenticated and has admin role
 * 
 * Usage in API routes:
 * ```ts
 * const userResult = await requireAdmin();
 * if (userResult instanceof NextResponse) {
 *   return userResult; // Error response
 * }
 * const user = userResult; // User is authenticated and is admin
 * ```
 */
export async function requireAdmin(): Promise<User | NextResponse> {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Check authentication
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Authentication required.' },
      { status: 401 }
    );
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role = profile?.role as string;

  if (role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden. Admin role required.' },
      { status: 403 }
    );
  }

  return user;
}
