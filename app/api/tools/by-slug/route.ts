import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// GET: Get tool ID by slug
export async function GET(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    // Try to find tool by slug
    const { data: tool } = await supabase
      .from('tools')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (tool) {
      return NextResponse.json({ toolId: tool.id, toolName: tool.name });
    }

    // Fallback: try to find by name (normalize slug to name)
    const normalizedName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const { data: toolByName } = await supabase
      .from('tools')
      .select('id, name')
      .ilike('name', normalizedName)
      .single();

    if (toolByName) {
      return NextResponse.json({ toolId: toolByName.id, toolName: toolByName.name });
    }

    return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
