import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/ai/llm';

/**
 * Diagnostics endpoint for AI Advisor
 * Returns provider configuration status without exposing sensitive keys
 * 
 * GET /api/diagnostics/ai
 * 
 * Response:
 * {
 *   provider: string,           // 'openai' | 'anthropic'
 *   model: string,              // Model name
 *   hasApiKey: boolean,         // Whether API key is configured
 *   providerConfigured: boolean, // Whether provider can be instantiated
 *   version?: string,           // Build/version info if available
 *   timestamp: string           // ISO timestamp
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const provider = process.env.LLM_PROVIDER || 'openai';
    const apiKey = process.env.LLM_API_KEY;
    const model = provider === 'openai' 
      ? (process.env.OPENAI_MODEL || 'gpt-4-turbo-preview')
      : (process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229');
    
    let providerConfigured = false;
    let errorMessage: string | undefined;

    // Check if API key exists
    const hasApiKey = !!apiKey;

    // Try to instantiate provider (this validates configuration)
    if (hasApiKey) {
      try {
        getLLMProvider();
        providerConfigured = true;
      } catch (error: any) {
        providerConfigured = false;
        errorMessage = error.message || 'Failed to initialize provider';
      }
    } else {
      errorMessage = 'LLM_API_KEY environment variable is not set';
    }

    // Get version/build info if available
    const version = process.env.NEXT_PUBLIC_APP_VERSION || 
                    process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 
                    undefined;

    return NextResponse.json({
      provider,
      model,
      hasApiKey,
      providerConfigured,
      version,
      error: errorMessage || undefined,
      timestamp: new Date().toISOString(),
    }, {
      status: providerConfigured ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        provider: 'unknown',
        model: 'unknown',
        hasApiKey: false,
        providerConfigured: false,
        error: error.message || 'Diagnostics check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
