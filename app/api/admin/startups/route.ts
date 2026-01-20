import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const supabase = await createUserSupabaseClient();
    const { data: startups, error } = await supabase
      .from('startups')
      .select(`
        id,
        name,
        tagline,
        description,
        status,
        revenue_range,
        vibe_score,
        launch_year,
        pricing_model,
        target_customer,
        logo_url,
        website_url,
        is_featured,
        created_at,
        founders:founder_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching startups:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ startups: startups || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/startups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userResult = await requireAdmin();
  if (userResult instanceof NextResponse) {
    return userResult;
  }

  try {
    const body = await request.json();
    const supabase = await createUserSupabaseClient();

    const { data: startup, error } = await supabase
      .from('startups')
      .insert({
        founder_id: body.founderId,
        name: body.name,
        tagline: body.tagline,
        description: body.description,
        status: body.status,
        revenue_range: body.revenueRange,
        vibe_score: body.vibeScore,
        launch_year: body.launchYear,
        pricing_model: body.pricingModel,
        target_customer: body.targetCustomer,
        logo_url: body.logoUrl,
        website_url: body.websiteUrl,
        is_featured: body.isFeatured || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating startup:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ startup });
  } catch (error) {
    console.error('Error in POST /api/admin/startups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
