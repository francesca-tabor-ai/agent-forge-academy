/**
 * Supabase client for CLI scripts
 * This file does NOT use 'server-only' so it can be used in CLI scripts
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for CLI operations
 * Uses the service role key for admin operations
 * This is safe for CLI scripts as they run outside the Next.js context
 */
export function createCliSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
