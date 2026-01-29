import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// GET: Search user's custom tools
export async function GET(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    // Get user's custom tools
    let queryBuilder = supabase
      .from('custom_tools')
      .select('id, name, category, version, url, notes, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by query if provided
    if (query && query.trim()) {
      queryBuilder = queryBuilder.ilike('name', `%${query.trim()}%`);
    }

    const { data: customTools, error } = await queryBuilder;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also search global catalog tools if query provided
    let catalogTools: any[] = [];
    if (query && query.trim()) {
      const { data: toolsData } = await supabase
        .from('tools')
        .select('id, name, slug, description, category, logo_url, website_url')
        .ilike('name', `%${query.trim()}%`)
        .limit(20);

      catalogTools = toolsData || [];
    }

    // Combine results: catalog tools first, then custom tools
    const tools = [
      ...catalogTools.map(tool => ({
        ...tool,
        toolType: 'catalog' as const,
      })),
      ...(customTools || []).map(tool => ({
        id: tool.id,
        name: tool.name,
        slug: `custom-${tool.id}`,
        description: tool.notes || null,
        category: tool.category || null,
        logo_url: null,
        website_url: tool.url || null,
        version: tool.version || null,
        toolType: 'custom' as const,
      })),
    ];

    return NextResponse.json({ tools });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
