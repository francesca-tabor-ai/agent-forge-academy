/**
 * Request Logger Utility
 * 
 * Logs API requests to the database for debugging and monitoring.
 * Used by critical endpoints to track requests, responses, and errors.
 */

import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export interface RequestLogData {
  requestId: string;
  userId?: string | null;
  path: string;
  method: string;
  status: number;
  duration: number; // milliseconds
  errorStack?: string | null;
  errorMessage?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Logs a request to the database
 * Uses service role client to bypass RLS
 * 
 * @param logData - Request log data
 */
export async function logRequest(logData: RequestLogData): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('request_logs')
      .insert({
        request_id: logData.requestId,
        user_id: logData.userId || null,
        path: logData.path,
        method: logData.method,
        status: logData.status,
        duration: logData.duration,
        error_stack: logData.errorStack || null,
        error_message: logData.errorMessage || null,
        ip_address: logData.ipAddress || null,
        user_agent: logData.userAgent || null,
      });

    if (error) {
      // Log error but don't throw - logging failures shouldn't break the request
      console.error('[RequestLogger] Failed to log request:', error);
    }
  } catch (error) {
    // Log error but don't throw - logging failures shouldn't break the request
    console.error('[RequestLogger] Error logging request:', error);
  }
}

/**
 * Helper function to extract IP address from request
 */
export function getIpAddress(request: NextRequest): string | null {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         null;
}

/**
 * Helper function to extract user agent from request
 */
export function getUserAgent(request: NextRequest): string | null {
  return request.headers.get('user-agent') || null;
}

/**
 * Helper function to extract user ID from request
 * Checks for impersonation header first (X-Debug-User-Id), then auth
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Check for impersonation header (from API tester)
  const debugUserId = request.headers.get('x-debug-user-id');
  if (debugUserId) {
    return debugUserId;
  }

  // Otherwise, get from auth
  try {
    const { createUserSupabaseClient } = await import('@/lib/supabase/server');
    const supabase = await createUserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}
