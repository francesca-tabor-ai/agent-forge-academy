import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/ai/llm';

/**
 * Health check endpoint for AI Advisor
 * Returns whether the LLM provider is configured
 */
export async function GET(request: NextRequest) {
  try {
    // Check if LLM provider is configured
    let providerConfigured = false;
    let providerName = 'unknown';
    let errorMessage: string | undefined;

    try {
      const provider = process.env.LLM_PROVIDER || 'openai';
      const apiKey = process.env.LLM_API_KEY;
      
      providerName = provider;
      providerConfigured = !!apiKey;
      
      if (apiKey) {
        // Try to instantiate the provider to verify it works
        getLLMProvider();
      } else {
        errorMessage = 'LLM_API_KEY environment variable is not set';
      }
    } catch (error: any) {
      errorMessage = error.message || 'Failed to initialize LLM provider';
    }

    return NextResponse.json({
      ok: true,
      providerConfigured,
      provider: providerName,
      error: errorMessage || undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        providerConfigured: false,
        error: error.message || 'Health check failed',
      },
      { status: 500 }
    );
  }
}
