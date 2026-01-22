import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { safeLogger } from '@/lib/utils/redactPII';

export const runtime = 'nodejs'; // safest for OpenAI + Supabase

interface IdeationRequest {
  niche?: string;
  newNiche?: string;
  icp?: string;
  newIcp?: string;
  location?: string;
  additionalContext?: string;
  context?: string;
}

// System prompt (you can tune this)
const SYSTEM_PROMPT = `
You are a startup adaptation strategist.
Given a reference startup and a user's adaptation parameters (new niche, ICP, location, constraints),
generate 3 distinct adaptation ideas.

Return ONLY valid JSON matching this schema:

{
  "ideas": [
    {
      "name": string,
      "one_liner": string,
      "target_customer": string,
      "problem": string,
      "solution": string,
      "differentiators": string[],
      "gtm": string[],
      "pricing": string,
      "risks": string[],
      "first_30_days": string[]
    }
  ]
}

Rules:
- Be specific (not generic).
- Keep "one_liner" under 140 characters.
- "pricing" must be concrete (e.g., "$49/mo per seat", "2% take rate", "free + $199/mo pro").
- Avoid hallucinating factual claims about the reference startup's metrics.
- If inputs are missing, make reasonable assumptions and reflect them in the output.
`.trim();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = `ideate_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    const { id: startupId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: IdeationRequest = await request.json().catch(() => ({}));
    const newNiche = (body.newNiche ?? body.niche ?? '').trim();
    const newIcp = (body.newIcp ?? body.icp ?? '').trim();
    const location = (body.location ?? '').trim();
    const additionalContext = (body.additionalContext ?? body.context ?? '').trim();

    // Fetch the reference startup
    const { data: startup, error: startupErr } = await supabase
      .from('startups')
      .select('id,name,tagline,description,status,revenue_range,vibe_score,website_url,launch_year,pricing_model,target_customer')
      .eq('id', startupId)
      .single();

    if (startupErr || !startup) {
      return NextResponse.json(
        { error: 'Startup not found', details: startupErr?.message },
        { status: 404 }
      );
    }

    const userPrompt = `
Reference startup:
- name: ${startup.name ?? ''}
- tagline: ${startup.tagline ?? ''}
- description: ${startup.description ?? ''}
- target_customer: ${startup.target_customer ?? ''}
- pricing_model: ${startup.pricing_model ?? ''}
- status: ${startup.status ?? ''}
- launch_year: ${startup.launch_year ?? ''}
- website_url: ${startup.website_url ?? ''}

Adaptation parameters:
- new_niche: ${newNiche || '(not provided)'}
- new_icp: ${newIcp || '(not provided)'}
- location: ${location || '(not provided)'}
- additional_context: ${additionalContext || '(none)'}

Generate 3 ideas. Return JSON only.
`.trim();

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured', details: 'OPENAI_API_KEY or LLM_API_KEY environment variable is required' },
        { status: 500 }
      );
    }

    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    // Call OpenAI API directly with JSON mode
    const openaiResponse = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      safeLogger.error('[StartupIdeation] OpenAI API error', {
        requestId,
        status: openaiResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: 'OpenAI API error', details: errorText },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    const text = openaiData.choices[0]?.message?.content?.trim() || '{}';

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      safeLogger.error('[StartupIdeation] Failed to parse OpenAI response', {
        requestId,
        raw: text.substring(0, 500),
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
      return NextResponse.json(
        { error: 'Model returned non-JSON output', raw: text.substring(0, 500) },
        { status: 502 }
      );
    }

    // Basic shape guard
    if (!parsed?.ideas || !Array.isArray(parsed.ideas)) {
      safeLogger.error('[StartupIdeation] Invalid response structure', {
        requestId,
        parsed,
      });
      return NextResponse.json(
        { error: "JSON missing 'ideas' array", raw: parsed },
        { status: 502 }
      );
    }

    const responseTime = Date.now() - startTime;
    safeLogger.info('[StartupIdeation] Success', {
      requestId,
      model,
      responseTime,
      ideasCount: parsed.ideas.length,
    });

    return NextResponse.json(
      {
        startup: {
          id: startup.id,
          name: startup.name,
          tagline: startup.tagline,
          description: startup.description,
        },
        ideas: parsed.ideas,
        meta: { model },
      },
      { status: 200 }
    );
  } catch (e: any) {
    const responseTime = Date.now() - startTime;
    safeLogger.error('[StartupIdeation] Error', {
      requestId,
      error: e?.message ?? String(e),
      stack: e?.stack,
      responseTime,
    });

    return NextResponse.json(
      { error: 'Ideation failed', details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
