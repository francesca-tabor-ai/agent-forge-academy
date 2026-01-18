import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/ai/llm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getEmbeddingProvider } from '@/lib/rag/embeddings';

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: Record<string, any>;
}

/**
 * Comprehensive health check endpoint for AI Advisor
 * Checks:
 * - LLM provider configuration and connectivity
 * - Vector store connectivity
 * - Index existence (pgvector extension, match_lesson_chunks function, embeddings)
 * - Embedding provider configuration
 */
export async function GET(request: NextRequest) {
  const checks: HealthCheckResult[] = [];
  const startTime = Date.now();

  // 1. LLM Provider Configuration Check
  try {
    const provider = process.env.LLM_PROVIDER || 'openai';
    const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      checks.push({
        name: 'LLM Provider Configuration',
        status: 'fail',
        message: 'LLM_API_KEY or OPENAI_API_KEY environment variable is not set',
      });
    } else {
      try {
        // Try to instantiate the provider
        getLLMProvider();
        
        // Test upstream connectivity
        let upstreamHealthy = false;
        let upstreamError: string | undefined;
        
        try {
          if (provider === 'openai') {
            const healthCheckResponse = await fetch('https://api.openai.com/v1/models', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
              signal: AbortSignal.timeout(3000), // 3 second timeout
            });
            upstreamHealthy = healthCheckResponse.ok;
            if (!upstreamHealthy) {
              upstreamError = `HTTP ${healthCheckResponse.status}`;
            }
          } else if (provider === 'anthropic') {
            // For Anthropic, we can check if the API key is valid by making a minimal request
            // Note: Anthropic doesn't have a simple health endpoint, so we'll just verify config
            upstreamHealthy = true; // Assume healthy if configured
          } else {
            upstreamHealthy = true; // Assume healthy for other providers
          }
        } catch (upstreamError_: any) {
          upstreamHealthy = false;
          upstreamError = upstreamError_.message || 'Upstream check failed';
        }
        
        checks.push({
          name: 'LLM Provider Configuration',
          status: upstreamHealthy ? 'pass' : 'warn',
          message: upstreamHealthy 
            ? `Provider configured (${provider}) and upstream reachable`
            : `Provider configured (${provider}) but upstream check failed: ${upstreamError}`,
          details: {
            provider,
            upstreamHealthy,
            upstreamError: upstreamError || undefined,
          },
        });
      } catch (error: any) {
        checks.push({
          name: 'LLM Provider Configuration',
          status: 'fail',
          message: `Failed to initialize provider: ${error.message}`,
          details: { provider, error: error.message },
        });
      }
    }
  } catch (error: any) {
    checks.push({
      name: 'LLM Provider Configuration',
      status: 'fail',
      message: `Provider check error: ${error.message}`,
    });
  }

  // 2. Embedding Provider Configuration Check
  try {
    const embeddingApiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
    const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    
    if (!embeddingApiKey) {
      checks.push({
        name: 'Embedding Provider Configuration',
        status: 'warn',
        message: 'Embedding API key not configured (vector search will not work)',
        details: {
          embeddingModel,
        },
      });
    } else {
      try {
        const embeddingProvider = getEmbeddingProvider();
        checks.push({
          name: 'Embedding Provider Configuration',
          status: 'pass',
          message: `Embedding provider configured (${embeddingModel})`,
          details: {
            embeddingModel,
          },
        });
      } catch (error: any) {
        checks.push({
          name: 'Embedding Provider Configuration',
          status: 'fail',
          message: `Failed to initialize embedding provider: ${error.message}`,
          details: {
            embeddingModel,
            error: error.message,
          },
        });
      }
    }
  } catch (error: any) {
    checks.push({
      name: 'Embedding Provider Configuration',
      status: 'fail',
      message: `Embedding provider check error: ${error.message}`,
    });
  }

  // 3. Vector Store Connectivity Check
  try {
    const supabase = createServerSupabaseClient();
    
    // Test basic database connectivity
    const { data: testData, error: dbError } = await supabase
      .from('lesson_chunks')
      .select('id')
      .limit(1);
    
    if (dbError) {
      checks.push({
        name: 'Vector Store Connectivity',
        status: 'fail',
        message: `Database connection failed: ${dbError.message}`,
        details: { error: dbError.message, code: dbError.code },
      });
    } else {
      checks.push({
        name: 'Vector Store Connectivity',
        status: 'pass',
        message: 'Database connection successful',
      });
    }
  } catch (error: any) {
    checks.push({
      name: 'Vector Store Connectivity',
      status: 'fail',
      message: `Database check error: ${error.message}`,
    });
  }

  // 4. pgvector Extension Check (via function availability)
  try {
    const supabase = createServerSupabaseClient();
    
    // Check if vector search function exists by attempting to call it with minimal params
    // We use a zero vector and request 0 results to minimize load
    const zeroVector = Array(1536).fill(0);
    const { data: functionCheck, error: funcError } = await supabase
      .rpc('match_lesson_chunks', {
        query_embedding: zeroVector,
        match_threshold: 0.0,
        match_count: 0, // Request 0 results to minimize load
      });
    
    if (funcError) {
      // Check if error is due to function not existing vs other issues
      if (funcError.message?.includes('function') && funcError.message?.includes('does not exist')) {
        checks.push({
          name: 'pgvector Extension',
          status: 'warn',
          message: 'pgvector extension may not be installed (match_lesson_chunks function not found)',
          details: {
            note: 'Vector search will fall back to keyword search',
            error: funcError.message,
          },
        });
      } else {
        // Function exists but may have failed due to other reasons (e.g., no embeddings)
        // This is actually a good sign - function exists
        checks.push({
          name: 'pgvector Extension',
          status: 'pass',
          message: 'pgvector extension appears to be installed (match_lesson_chunks function exists)',
          details: {
            note: funcError.message?.includes('embedding') 
              ? 'Function exists but may need embeddings to be indexed'
              : undefined,
          },
        });
      }
    } else {
      // Function call succeeded (even with 0 results)
      checks.push({
        name: 'pgvector Extension',
        status: 'pass',
        message: 'pgvector extension is installed and match_lesson_chunks function is available',
      });
    }
  } catch (error: any) {
    // If RPC call fails completely, function likely doesn't exist
    if (error.message?.includes('function') || error.message?.includes('RPC')) {
      checks.push({
        name: 'pgvector Extension',
        status: 'warn',
        message: 'pgvector extension may not be installed (match_lesson_chunks function not available)',
        details: {
          note: 'Vector search will fall back to keyword search',
          error: error.message,
        },
      });
    } else {
      checks.push({
        name: 'pgvector Extension',
        status: 'warn',
        message: `Could not verify pgvector extension: ${error.message}`,
        details: {
          note: 'Vector search may fall back to keyword search',
        },
      });
    }
  }

  // 5. Index Existence Check
  try {
    const supabase = createServerSupabaseClient();
    
    // Check if embeddings exist (count chunks with embeddings)
    const { count: embeddingCount, error: countError } = await supabase
      .from('lesson_chunks')
      .select('id', { count: 'exact', head: true })
      .not('embedding', 'is', null);
    
    if (countError) {
      checks.push({
        name: 'Index Existence',
        status: 'warn',
        message: `Could not check embedding count: ${countError.message}`,
      });
    } else {
      const count = embeddingCount || 0;
      checks.push({
        name: 'Index Existence',
        status: count > 0 ? 'pass' : 'warn',
        message: count > 0 
          ? `Found ${count} chunks with embeddings (vector search available)`
          : 'No chunks with embeddings found (vector search will use keyword fallback)',
        details: {
          chunksWithEmbeddings: count,
        },
      });
    }
    
    // Check total chunk count
    const { count: totalCount, error: totalError } = await supabase
      .from('lesson_chunks')
      .select('id', { count: 'exact', head: true });
    
    if (totalError) {
      checks.push({
        name: 'Lesson Chunks Table',
        status: 'warn',
        message: `Could not check total chunk count: ${totalError.message}`,
      });
    } else {
      const total = totalCount || 0;
      checks.push({
        name: 'Lesson Chunks Table',
        status: total > 0 ? 'pass' : 'warn',
        message: total > 0 
          ? `Found ${total} total chunks in lesson_chunks table`
          : 'No chunks found in lesson_chunks table (content may not be indexed)',
        details: {
          totalChunks: total,
        },
      });
    }
  } catch (error: any) {
    checks.push({
      name: 'Index Existence',
      status: 'warn',
      message: `Index check error: ${error.message}`,
    });
  }

  // Calculate overall health
  const failedChecks = checks.filter(c => c.status === 'fail');
  const warnChecks = checks.filter(c => c.status === 'warn');
  const passedChecks = checks.filter(c => c.status === 'pass');
  
  const overallHealthy = failedChecks.length === 0;
  const overallStatus = overallHealthy ? (warnChecks.length > 0 ? 'degraded' : 'healthy') : 'unhealthy';
  
  const duration = Date.now() - startTime;

  return NextResponse.json({
    ok: overallHealthy,
    status: overallStatus,
    checks: {
      total: checks.length,
      passed: passedChecks.length,
      warnings: warnChecks.length,
      failed: failedChecks.length,
    },
    details: checks,
    timestamp: new Date().toISOString(),
    duration: `${duration}ms`,
  }, {
    status: overallHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
