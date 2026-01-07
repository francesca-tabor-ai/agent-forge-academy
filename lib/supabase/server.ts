import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
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
 * Maps 'tutor' to 'instructor' for consistency (database supports both for backward compatibility)
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
  
  // Map 'tutor' to 'instructor' for consistency (database may have 'tutor' for backward compatibility)
  if (role === 'tutor' || role === 'instructor') {
    return 'instructor';
  }
  
  return (role as UserRole) || null;
}

/**
 * Checks if user has the required role
 * Accepts 'tutor' for backward compatibility (maps to 'instructor')
 */
export async function hasRole(
  requiredRole: UserRole | 'tutor'
): Promise<boolean> {
  const role = await getUserRole();
  // Handle 'tutor' for backward compatibility (maps to 'instructor')
  if (requiredRole === 'tutor' || requiredRole === 'instructor') {
    return role === 'instructor';
  }
  return role === requiredRole;
}

/**
 * Checks if user has any of the required roles
 * Accepts 'tutor' in the array for backward compatibility (maps to 'instructor')
 */
export async function hasAnyRole(
  requiredRoles: Array<UserRole | 'tutor'>
): Promise<boolean> {
  const role = await getUserRole();
  if (role === null) {
    return false;
  }
  // Map 'tutor' to 'instructor' in the required roles array for comparison
  const normalizedRoles = requiredRoles.map(r => r === 'tutor' ? 'instructor' : r) as UserRole[];
  return normalizedRoles.includes(role);
}

