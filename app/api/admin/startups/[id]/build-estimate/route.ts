import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const { id: startupId } = await params;
    const body = await request.json();
    const supabase = await createUserSupabaseClient();

    const { data: estimate, error } = await supabase
      .from('build_estimates')
      .insert({
        startup_id: startupId,
        technical_difficulty: body.technicalDifficulty,
        estimated_build_time_days: body.estimatedBuildTimeDays,
        estimated_build_cost_usd: body.estimatedBuildCostUsd,
        maintenance_cost_usd_monthly: body.maintenanceCostUsdMonthly,
        solo_friendly: body.soloFriendly || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating build estimate:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ estimate });
  } catch (error) {
    console.error('Error in POST /api/admin/startups/[id]/build-estimate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const { id: startupId } = await params;
    const body = await request.json();
    const supabase = await createUserSupabaseClient();

    // First, get existing estimate
    const { data: existing } = await supabase
      .from('build_estimates')
      .select('id')
      .eq('startup_id', startupId)
      .single();

    const updateData: any = {};
    if (body.technicalDifficulty !== undefined) updateData.technical_difficulty = body.technicalDifficulty;
    if (body.estimatedBuildTimeDays !== undefined) updateData.estimated_build_time_days = body.estimatedBuildTimeDays;
    if (body.estimatedBuildCostUsd !== undefined) updateData.estimated_build_cost_usd = body.estimatedBuildCostUsd;
    if (body.maintenanceCostUsdMonthly !== undefined) updateData.maintenance_cost_usd_monthly = body.maintenanceCostUsdMonthly;
    if (body.soloFriendly !== undefined) updateData.solo_friendly = body.soloFriendly;

    let estimate;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('build_estimates')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      estimate = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('build_estimates')
        .insert({
          startup_id: startupId,
          ...updateData,
        })
        .select()
        .single();
      
      if (error) throw error;
      estimate = data;
    }

    return NextResponse.json({ estimate });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/startups/[id]/build-estimate:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
