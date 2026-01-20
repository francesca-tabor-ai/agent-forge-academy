import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const { id } = await params;
    const supabase = await createUserSupabaseClient();

    const { data: startup, error } = await supabase
      .from('startups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ startup });
  } catch (error) {
    console.error('Error in GET /api/admin/startups/[id]:', error);
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
    const { id } = await params;
    const body = await request.json();
    const supabase = await createUserSupabaseClient();

    const updateData: any = {};
    if (body.founderId !== undefined) updateData.founder_id = body.founderId;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.revenueRange !== undefined) updateData.revenue_range = body.revenueRange;
    if (body.vibeScore !== undefined) updateData.vibe_score = body.vibeScore;
    if (body.launchYear !== undefined) updateData.launch_year = body.launchYear;
    if (body.pricingModel !== undefined) updateData.pricing_model = body.pricingModel;
    if (body.targetCustomer !== undefined) updateData.target_customer = body.targetCustomer;
    if (body.logoUrl !== undefined) updateData.logo_url = body.logoUrl;
    if (body.websiteUrl !== undefined) updateData.website_url = body.websiteUrl;
    if (body.isFeatured !== undefined) updateData.is_featured = body.isFeatured;

    const { data: startup, error } = await supabase
      .from('startups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating startup:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ startup });
  } catch (error) {
    console.error('Error in PATCH /api/admin/startups/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const { id } = await params;
    const supabase = await createUserSupabaseClient();

    const { error } = await supabase
      .from('startups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting startup:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/startups/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
