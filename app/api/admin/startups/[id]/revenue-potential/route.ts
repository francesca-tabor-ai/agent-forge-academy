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

    const { data: revenue, error } = await supabase
      .from('revenue_potential')
      .insert({
        startup_id: startupId,
        conservative_mrr: body.conservativeMrr,
        realistic_mrr: body.realisticMrr,
        breakout_mrr: body.breakoutMrr,
        assumptions: body.assumptions,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating revenue potential:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ revenue });
  } catch (error) {
    console.error('Error in POST /api/admin/startups/[id]/revenue-potential:', error);
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

    // First, get existing revenue potential
    const { data: existing } = await supabase
      .from('revenue_potential')
      .select('id')
      .eq('startup_id', startupId)
      .single();

    const updateData: any = {};
    if (body.conservativeMrr !== undefined) updateData.conservative_mrr = body.conservativeMrr;
    if (body.realisticMrr !== undefined) updateData.realistic_mrr = body.realisticMrr;
    if (body.breakoutMrr !== undefined) updateData.breakout_mrr = body.breakoutMrr;
    if (body.assumptions !== undefined) updateData.assumptions = body.assumptions;

    let revenue;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('revenue_potential')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      revenue = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('revenue_potential')
        .insert({
          startup_id: startupId,
          ...updateData,
        })
        .select()
        .single();
      
      if (error) throw error;
      revenue = data;
    }

    return NextResponse.json({ revenue });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/startups/[id]/revenue-potential:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
