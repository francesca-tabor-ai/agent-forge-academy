import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/ai/llm';

/**
 * Health check endpoint for AI Advisor
 * Returns whether the LLM provider is configured and can reach upstream services
 */
export async function GET(request: NextRequest) {
  try {
    // Check if LLM provider is configured
    let providerConfigured = false;
    let providerName = 'unknown';
    let errorMessage: string | undefined;
    let upstreamHealthy = false;

    try {
      const provider = process.env.LLM_PROVIDER || 'openai';
      const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
      
      providerName = provider;
      providerConfigured = !!apiKey;
      
      if (apiKey) {
        // Try to instantiate the provider to verify it works
        getLLMProvider();
        
        // Optional: Do a basic upstream health check (lightweight)
        // This is a simple check - in production you might want to cache this
        try {
          // For OpenAI, we can do a minimal check (list models endpoint is lightweight)
          if (provider === 'openai') {
            const healthCheckResponse = await fetch('https://api.openai.com/v1/models', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
              // Use a short timeout for health checks
              signal: AbortSignal.timeout(3000), // 3 second timeout
            });
            upstreamHealthy = healthCheckResponse.ok;
          } else {
            // For other providers, assume healthy if provider is configured
            upstreamHealthy = true;
          }
        } catch (upstreamError: any) {
          // Upstream check failed, but provider is configured
          // This is okay - the service might be temporarily unavailable
          upstreamHealthy = false;
          if (process.env.NODE_ENV === 'development') {
            errorMessage = `Provider configured but upstream check failed: ${upstreamError.message}`;
          }
        }
      } else {
        errorMessage = 'LLM_API_KEY or OPENAI_API_KEY environment variable is not set';
      }
    } catch (error: any) {
      errorMessage = error.message || 'Failed to initialize LLM provider';
    }

    const isHealthy = providerConfigured && (upstreamHealthy || errorMessage === undefined);

    return NextResponse.json({
      ok: isHealthy,
      providerConfigured,
      upstreamHealthy,
      provider: providerName,
      error: errorMessage || undefined,
      timestamp: new Date().toISOString(),
    }, { 
      status: isHealthy ? 200 : 503 
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        providerConfigured: false,
        upstreamHealthy: false,
        error: error.message || 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
