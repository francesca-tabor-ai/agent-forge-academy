import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/health
 * 
 * Performs health checks for critical system components.
 * Requires admin role.
 * 
 * Returns:
 * - checks: Array of { name, status, message }
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    const checks: Array<{ name: string; status: 'pass' | 'fail'; message: string }> = [];

    // 1. Supabase Environment Variables Check
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      // Runtime guard: ensure TypeScript knows these are strings
      if (!supabaseUrl || !supabaseAnonKey) {
        checks.push({
          name: 'Supabase Environment Variables',
          status: 'fail',
          message: `Missing required env vars: ${!supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : ''}${!supabaseUrl && !supabaseAnonKey ? ', ' : ''}${!supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''}`,
        });
      } else {
        // Safe now: both are strings after the guard
        const urlHasTrailingSpace = supabaseUrl.trim() !== supabaseUrl;
        const keyHasTrailingSpace = supabaseAnonKey.trim() !== supabaseAnonKey;
        
        if (urlHasTrailingSpace || keyHasTrailingSpace) {
          checks.push({
            name: 'Supabase Environment Variables',
            status: 'fail',
            message: 'Env vars have trailing spaces. Remove them in Vercel settings.',
          });
        } else {
          // Validate URL format
          try {
            new URL(supabaseUrl);
            // Check if service key is also present
            if (!supabaseServiceKey) {
              checks.push({
                name: 'Supabase Environment Variables',
                status: 'fail',
                message: 'Missing SUPABASE_SERVICE_ROLE_KEY',
              });
            } else {
              checks.push({
                name: 'Supabase Environment Variables',
                status: 'pass',
                message: 'All required Supabase env vars are present and valid',
              });
            }
          } catch {
            checks.push({
              name: 'Supabase Environment Variables',
              status: 'fail',
              message: 'NEXT_PUBLIC_SUPABASE_URL is not a valid URL',
            });
          }
        }
      }
    } catch (error) {
      checks.push({
        name: 'Supabase Environment Variables',
        status: 'fail',
        message: `Env var check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // 2. DB Connectivity Check
    try {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        checks.push({
          name: 'DB Connectivity',
          status: 'fail',
          message: `Database connection failed: ${error.message}`,
        });
      } else {
        checks.push({
          name: 'DB Connectivity',
          status: 'pass',
          message: 'Database connection successful',
        });
      }
    } catch (error) {
      checks.push({
        name: 'DB Connectivity',
        status: 'fail',
        message: `Database check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // 3. Storage Access Check
    try {
      const supabase = createServerSupabaseClient();
      // Try to list buckets to check storage access
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();

      if (storageError) {
        checks.push({
          name: 'Storage Access',
          status: 'fail',
          message: `Storage access failed: ${storageError.message}`,
        });
      } else {
        // Check if portfolio-files bucket exists
        const portfolioBucket = buckets?.find(b => b.name === 'portfolio-files');
        if (portfolioBucket) {
          checks.push({
            name: 'Storage Access',
            status: 'pass',
            message: 'Storage access successful (portfolio-files bucket exists)',
          });
        } else {
          checks.push({
            name: 'Storage Access',
            status: 'fail',
            message: 'Storage accessible but portfolio-files bucket not found',
          });
        }
      }
    } catch (error) {
      checks.push({
        name: 'Storage Access',
        status: 'fail',
        message: `Storage check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // 4. Stripe Configuration Check
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST;
      if (!stripeKey) {
        checks.push({
          name: 'Stripe Configured',
          status: 'fail',
          message: 'STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_TEST not set',
        });
      } else {
        // Check if Stripe webhook secret is configured
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET_TEST;
        checks.push({
          name: 'Stripe Configured',
          status: 'pass',
          message: webhookSecret 
            ? 'Stripe API key and webhook secret configured'
            : 'Stripe API key configured (webhook secret missing)',
        });
      }
    } catch (error) {
      checks.push({
        name: 'Stripe Configured',
        status: 'fail',
        message: `Stripe check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // 5. AI Provider Configuration Check
    try {
      const llmApiKey = process.env.LLM_API_KEY;
      const llmProvider = process.env.LLM_PROVIDER || 'openai';

      if (!llmApiKey) {
        checks.push({
          name: 'AI Provider Configured',
          status: 'fail',
          message: 'LLM_API_KEY not set',
        });
      } else {
        // Check provider-specific configuration
        if (llmProvider === 'openai') {
          const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
          checks.push({
            name: 'AI Provider Configured',
            status: 'pass',
            message: `OpenAI configured (model: ${model})`,
          });
        } else if (llmProvider === 'anthropic') {
          const model = process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
          checks.push({
            name: 'AI Provider Configured',
            status: 'pass',
            message: `Anthropic configured (model: ${model})`,
          });
        } else {
          checks.push({
            name: 'AI Provider Configured',
            status: 'fail',
            message: `Unknown LLM provider: ${llmProvider}`,
          });
        }
      }
    } catch (error) {
      checks.push({
        name: 'AI Provider Configured',
        status: 'fail',
        message: `AI provider check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    const allPassed = checks.every(check => check.status === 'pass');

    return NextResponse.json({
      status: allPassed ? 'healthy' : 'unhealthy',
      checks,
    });
  } catch (error) {
    console.error('Error in admin health handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
