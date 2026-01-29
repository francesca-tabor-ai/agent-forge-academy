import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// GET: Get all tools for a project (both catalog and custom)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project ownership (RLS will enforce, but we check for better error messages)
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all project tools (both catalog and custom)
    const { data: projectTools, error } = await supabase
      .from('project_tools')
      .select(`
        id,
        tool_type,
        tool_id,
        custom_tool_id,
        "order",
        tools:tool_id (
          id,
          name,
          slug,
          description,
          category,
          logo_url,
          website_url
        ),
        custom_tools:custom_tool_id (
          id,
          name,
          category,
          version,
          url,
          notes
        )
      `)
      .eq('project_id', projectId)
      .order('order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to unified format
    const tools = (projectTools || [])
      .map((pt: any) => {
        if (pt.tool_type === 'catalog' && pt.tools) {
          return {
            id: pt.tools.id,
            projectToolId: pt.id,
            name: pt.tools.name,
            slug: pt.tools.slug,
            description: pt.tools.description,
            category: pt.tools.category,
            logo_url: pt.tools.logo_url,
            website_url: pt.tools.website_url,
            toolType: 'catalog' as const,
            order: pt.order || 0,
          };
        } else if (pt.tool_type === 'custom' && pt.custom_tools) {
          const ct = pt.custom_tools;
          return {
            id: ct.id,
            projectToolId: pt.id,
            name: ct.name,
            slug: `custom-${ct.id}`,
            description: ct.notes || null,
            category: ct.category || null,
            logo_url: null,
            website_url: ct.url || null,
            version: ct.version || null,
            toolType: 'custom' as const,
            order: pt.order || 0,
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({ tools });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add a tool to a project (catalog or custom)
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { catalogToolId, customTool, saveToMyTools } = body;

    // Verify project ownership
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get current max order for this project
    const { data: existingTools } = await supabase
      .from('project_tools')
      .select('order')
      .eq('project_id', projectId)
      .order('order', { ascending: false })
      .limit(1);

    const nextOrder = existingTools && existingTools.length > 0 
      ? (existingTools[0].order || 0) + 1 
      : 0;

    // Handle catalog tool
    if (catalogToolId) {
      // Verify tool exists
      const { data: tool } = await supabase
        .from('tools')
        .select('id')
        .eq('id', catalogToolId)
        .single();

      if (!tool) {
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
      }

      // Check for duplicate (case-insensitive name check)
      const { data: existingCatalogTool } = await supabase
        .from('project_tools')
        .select('id, tools:tool_id(name)')
        .eq('project_id', projectId)
        .eq('tool_id', catalogToolId)
        .single();

      if (existingCatalogTool) {
        return NextResponse.json({ error: 'Tool already added to project' }, { status: 409 });
      }

      // Add catalog tool to project
      const { data: projectTool, error } = await supabase
        .from('project_tools')
        .insert({
          project_id: projectId,
          tool_id: catalogToolId,
          tool_type: 'catalog',
          created_by: user.id,
          order: nextOrder,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Tool already added to project' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ projectTool });
    }

    // Handle custom tool
    if (customTool) {
      const { name, category, version, url, notes } = customTool;

      // Validation
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Tool name is required' }, { status: 400 });
      }

      const trimmedName = name.trim();
      if (trimmedName.length > 60) {
        return NextResponse.json({ error: 'Tool name must be 60 characters or less' }, { status: 400 });
      }

      // Validate URL if provided
      if (url && url.trim()) {
        try {
          new URL(url);
        } catch {
          return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }
      }

      // Check for duplicate custom tool name in this project (case-insensitive)
      const { data: existingProjectTools } = await supabase
        .from('project_tools')
        .select('custom_tool_id, custom_tools:custom_tool_id(name)')
        .eq('project_id', projectId)
        .eq('tool_type', 'custom');

      if (existingProjectTools) {
        const duplicate = existingProjectTools.some((pt: any) => 
          pt.custom_tools && 
          pt.custom_tools.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (duplicate) {
          return NextResponse.json({ error: 'A tool with this name already exists in this project' }, { status: 409 });
        }
      }

      let customToolId: string;

      // Check if user wants to save for reuse and if tool already exists in their custom tools
      if (saveToMyTools) {
        const { data: existingCustomTool } = await supabase
          .from('custom_tools')
          .select('id')
          .eq('user_id', user.id)
          .ilike('name', trimmedName)
          .single();

        if (existingCustomTool) {
          customToolId = existingCustomTool.id;
        } else {
          // Create new custom tool
          const { data: newCustomTool, error: customToolError } = await supabase
            .from('custom_tools')
            .insert({
              user_id: user.id,
              name: trimmedName,
              category: category || null,
              version: version || null,
              url: url || null,
              notes: notes || null,
            })
            .select('id')
            .single();

          if (customToolError) {
            if (customToolError.code === '23505') {
              // Duplicate name, fetch existing
              const { data: existing } = await supabase
                .from('custom_tools')
                .select('id')
                .eq('user_id', user.id)
                .ilike('name', trimmedName)
                .single();
              customToolId = existing?.id || '';
            } else {
              return NextResponse.json({ error: customToolError.message }, { status: 400 });
            }
          } else {
            customToolId = newCustomTool.id;
          }
        }
      } else {
        // Create custom tool without saving for reuse (one-time use)
        const { data: newCustomTool, error: customToolError } = await supabase
          .from('custom_tools')
          .insert({
            user_id: user.id,
            name: trimmedName,
            category: category || null,
            version: version || null,
            url: url || null,
            notes: notes || null,
          })
          .select('id')
          .single();

        if (customToolError) {
          return NextResponse.json({ error: customToolError.message }, { status: 400 });
        }
        customToolId = newCustomTool.id;
      }

      // Add custom tool to project
      const { data: projectTool, error } = await supabase
        .from('project_tools')
        .insert({
          project_id: projectId,
          custom_tool_id: customToolId,
          tool_type: 'custom',
          created_by: user.id,
          order: nextOrder,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Tool already added to project' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ projectTool });
    }

    return NextResponse.json({ error: 'Either catalogToolId or customTool is required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a tool from a project
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectToolId = searchParams.get('projectToolId');
    const toolId = searchParams.get('tool_id') || searchParams.get('toolId'); // For backward compatibility

    // Verify project ownership
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Use projectToolId if provided (preferred), otherwise fall back to toolId for backward compatibility
    if (projectToolId) {
      const { error } = await supabase
        .from('project_tools')
        .delete()
        .eq('id', projectToolId)
        .eq('project_id', projectId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } else if (toolId) {
      // Backward compatibility: delete by tool_id (catalog tools only)
      const { error } = await supabase
        .from('project_tools')
        .delete()
        .eq('project_id', projectId)
        .eq('tool_id', toolId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'projectToolId or toolId is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
