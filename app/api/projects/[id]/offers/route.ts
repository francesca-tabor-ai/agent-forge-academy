import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// POST: Add an offer to a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { offerId } = body;

    if (!offerId) {
      return NextResponse.json({ error: 'offerId is required' }, { status: 400 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Not a student' }, { status: 403 });
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify the project belongs to the student
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select('id, title')
      .eq('id', projectId)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Verify the offer exists and is active
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('id')
      .eq('id', offerId)
      .eq('is_active', true)
      .single();

    if (offerError || !offer) {
      return NextResponse.json(
        { error: 'Offer not found or not active' },
        { status: 404 }
      );
    }

    // Insert the link (idempotent - unique constraint will prevent duplicates)
    const { data: projectOffer, error: insertError } = await supabase
      .from('project_offers')
      .insert({
        project_id: projectId,
        offer_id: offerId,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      // Check if it's a duplicate (unique constraint violation)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { ok: true, message: 'Offer already added to this project', projectOffer: null },
          { status: 200 }
        );
      }
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, projectOffer });
  } catch (error) {
    console.error('Error adding offer to project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an offer from a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');

    if (!offerId) {
      return NextResponse.json({ error: 'offerId is required' }, { status: 400 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Not a student' }, { status: 403 });
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify the project belongs to the student
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the link
    const { error: deleteError } = await supabase
      .from('project_offers')
      .delete()
      .eq('project_id', projectId)
      .eq('offer_id', offerId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error removing offer from project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
