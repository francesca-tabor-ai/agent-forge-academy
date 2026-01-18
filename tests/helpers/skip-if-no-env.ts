/**
 * Helper to skip tests when required environment variables are missing
 */

export function skipIfNoSupabaseEnv() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!hasSupabaseUrl || !hasServiceKey) {
    return {
      skip: true,
      reason: 'Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)',
    };
  }
  
  return { skip: false };
}
