import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

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
 */
export async function getUserRole(): Promise<'student' | 'tutor' | 'recruiter' | 'admin' | null> {
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

  return (profile?.role as 'student' | 'tutor' | 'recruiter' | 'admin') || null;
}

/**
 * Checks if user has the required role
 */
export async function hasRole(
  requiredRole: 'student' | 'tutor' | 'recruiter' | 'admin'
): Promise<boolean> {
  const role = await getUserRole();
  return role === requiredRole;
}

/**
 * Checks if user has any of the required roles
 */
export async function hasAnyRole(
  requiredRoles: Array<'student' | 'tutor' | 'recruiter' | 'admin'>
): Promise<boolean> {
  const role = await getUserRole();
  return role !== null && requiredRoles.includes(role);
}

