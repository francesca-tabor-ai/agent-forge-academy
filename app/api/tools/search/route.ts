import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// GET: Search tools by name
export async function GET(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ tools: [] });
    }

    // Search in tools table if it exists, otherwise search in offers table
    // For now, we'll search offers by provider name since tools table might not be populated yet
    const { data: offers, error } = await supabase
      .from('offers')
      .select('provider')
      .ilike('provider', `%${query}%`)
      .eq('is_active', true)
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get unique providers
    const uniqueProviders = Array.from(new Set((offers || []).map(o => o.provider)));

    // Try to get tools from tools table, fallback to creating tool objects from offers
    const { data: toolsData } = await supabase
      .from('tools')
      .select('id, name, slug, description, category, logo_url, website_url')
      .ilike('name', `%${query}%`)
      .limit(20);

    let tools: any[] = [];

    if (toolsData && toolsData.length > 0) {
      tools = toolsData;
    } else {
      // Fallback: create tool objects from unique providers
      tools = uniqueProviders.map(provider => ({
        id: `temp-${provider.toLowerCase().replace(/\s+/g, '-')}`,
        name: provider,
        slug: provider.toLowerCase().replace(/\s+/g, '-'),
        description: null,
        category: null,
        logo_url: null,
        website_url: null,
      }));
    }

    return NextResponse.json({ tools });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
