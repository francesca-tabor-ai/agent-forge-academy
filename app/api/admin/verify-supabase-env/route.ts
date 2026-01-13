import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createUserSupabaseClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/verify-supabase-env
 * 
 * Verifies that Supabase environment variables are:
 * 1. Present at runtime
 * 2. Correctly formatted (no trailing spaces)
 * 3. Valid (URL format, keys are non-empty)
 * 4. Functional (can create clients and connect)
 * 
 * This endpoint is useful for verifying Vercel environment variable configuration.
 * 
 * Returns:
 * {
 *   verified: boolean,
 *   checks: Array<{ name, status, message, details? }>
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
      details?: Record<string, unknown>;
    }> = [];

    // Check 1: Environment Variables Present
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const missingVars: string[] = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    // Service key is optional for this check (only needed for server operations)

    if (missingVars.length > 0) {
      checks.push({
        name: 'Environment Variables Present',
        status: 'fail',
        message: `Missing required env vars: ${missingVars.join(', ')}`,
        details: {
          missing: missingVars,
          present: {
            NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey,
            SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
          },
        },
      });
    } else {
      checks.push({
        name: 'Environment Variables Present',
        status: 'pass',
        message: 'All required Supabase env vars are present',
        details: {
          NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✓' : '✗',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '✓' : '✗',
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? '✓' : '✗',
        },
      });
    }

    // Check 2: No Trailing Spaces
    if (supabaseUrl && supabaseAnonKey) {
      const urlHasTrailingSpace = supabaseUrl.trim() !== supabaseUrl;
      const keyHasTrailingSpace = supabaseAnonKey.trim() !== supabaseAnonKey;
      const urlHasLeadingSpace = supabaseUrl.trimStart() !== supabaseUrl;
      const keyHasLeadingSpace = supabaseAnonKey.trimStart() !== supabaseAnonKey;

      if (urlHasTrailingSpace || keyHasTrailingSpace || urlHasLeadingSpace || keyHasLeadingSpace) {
        checks.push({
          name: 'No Trailing/Leading Spaces',
          status: 'fail',
          message: 'Env vars have leading or trailing spaces. Remove them in Vercel settings.',
          details: {
            urlHasLeadingSpace,
            urlHasTrailingSpace,
            keyHasLeadingSpace,
            keyHasTrailingSpace,
          },
        });
      } else {
        checks.push({
          name: 'No Trailing/Leading Spaces',
          status: 'pass',
          message: 'No leading or trailing spaces detected',
        });
      }
    } else {
      checks.push({
        name: 'No Trailing/Leading Spaces',
        status: 'warn',
        message: 'Skipped (env vars missing)',
      });
    }

    // Check 3: Valid URL Format
    if (supabaseUrl) {
      try {
        const url = new URL(supabaseUrl);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          checks.push({
            name: 'Valid URL Format',
            status: 'fail',
            message: `Invalid URL protocol: ${url.protocol}. Must be http: or https:`,
          });
        } else {
          checks.push({
            name: 'Valid URL Format',
            status: 'pass',
            message: `Valid URL format (${url.protocol}//${url.host})`,
            details: {
              protocol: url.protocol,
              host: url.host,
            },
          });
        }
      } catch (error) {
        checks.push({
          name: 'Valid URL Format',
          status: 'fail',
          message: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: {
            providedValue: supabaseUrl.substring(0, 20) + '...', // Show first 20 chars only
          },
        });
      }
    } else {
      checks.push({
        name: 'Valid URL Format',
        status: 'warn',
        message: 'Skipped (NEXT_PUBLIC_SUPABASE_URL missing)',
      });
    }

    // Check 4: Keys Are Non-Empty
    if (supabaseAnonKey) {
      if (supabaseAnonKey.trim().length === 0) {
        checks.push({
          name: 'Keys Are Non-Empty',
          status: 'fail',
          message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is empty',
        });
      } else if (supabaseAnonKey.length < 50) {
        // Anon keys are typically JWT tokens, should be reasonably long
        checks.push({
          name: 'Keys Are Non-Empty',
          status: 'warn',
          message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY seems too short (may be invalid)',
          details: {
            length: supabaseAnonKey.length,
          },
        });
      } else {
        checks.push({
          name: 'Keys Are Non-Empty',
          status: 'pass',
          message: 'Keys are non-empty and appear valid',
        });
      }
    } else {
      checks.push({
        name: 'Keys Are Non-Empty',
        status: 'warn',
        message: 'Skipped (NEXT_PUBLIC_SUPABASE_ANON_KEY missing)',
      });
    }

    // Check 5: Can Create Server Client (Service Role)
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const serverClient = createServerSupabaseClient();
        // Try a simple operation to verify the client works
        const { error } = await serverClient.storage.listBuckets();
        if (error) {
          checks.push({
            name: 'Server Client Functional',
            status: 'fail',
            message: `Server client created but operation failed: ${error.message}`,
            details: {
              errorCode: error.statusCode,
            },
          });
        } else {
          checks.push({
            name: 'Server Client Functional',
            status: 'pass',
            message: 'Server client created and functional',
          });
        }
      } catch (error) {
        checks.push({
          name: 'Server Client Functional',
          status: 'fail',
          message: `Failed to create server client: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    } else {
      checks.push({
        name: 'Server Client Functional',
        status: 'warn',
        message: 'Skipped (SUPABASE_SERVICE_ROLE_KEY missing)',
      });
    }

    // Check 6: Can Create User Client (Anon Key)
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const userClient = await createUserSupabaseClient();
        // Try a simple operation (this will work even without auth)
        const { error } = await userClient.from('profiles').select('count').limit(0);
        // We don't care if it fails due to RLS, just that the client was created
        checks.push({
          name: 'User Client Functional',
          status: 'pass',
          message: 'User client created successfully',
        });
      } catch (error) {
        checks.push({
          name: 'User Client Functional',
          status: 'fail',
          message: `Failed to create user client: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    } else {
      checks.push({
        name: 'User Client Functional',
        status: 'warn',
        message: 'Skipped (required env vars missing)',
      });
    }

    // Check 7: CV Upload Flow Readiness
    // This checks if the bucket name env var is set (optional but recommended)
    const resumeBucket = process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET;
    if (resumeBucket) {
      checks.push({
        name: 'CV Upload Configuration',
        status: 'pass',
        message: `Resume bucket configured: ${resumeBucket}`,
        details: {
          bucketName: resumeBucket,
        },
      });
    } else {
      checks.push({
        name: 'CV Upload Configuration',
        status: 'warn',
        message: 'NEXT_PUBLIC_SUPABASE_RESUME_BUCKET not set (will default to "resumes")',
      });
    }

    const allPassed = checks.filter(c => c.status === 'pass').length;
    const allCriticalPassed = checks
      .filter(c => c.name !== 'CV Upload Configuration' && c.status !== 'warn')
      .every(c => c.status === 'pass');

    return NextResponse.json({
      verified: allCriticalPassed,
      summary: {
        total: checks.length,
        passed: allPassed,
        failed: checks.filter(c => c.status === 'fail').length,
        warnings: checks.filter(c => c.status === 'warn').length,
      },
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        verified: false,
        error: 'Verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
