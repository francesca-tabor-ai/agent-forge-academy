import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createUserSupabaseClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get student profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!studentProfile) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { projectId, status = 'claimed' } = body;

  // Verify offer exists
  const { data: offer } = await supabase
    .from('offers')
    .select('id, eligibility')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!offer) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }

  // Determine claim status based on eligibility
  let claimStatus: 'claimed' | 'not_claimed' | 'requires_verification' = 'claimed';
  if (offer.eligibility?.toLowerCase().includes('student') || 
      offer.eligibility?.toLowerCase().includes('verification')) {
    claimStatus = 'requires_verification';
  }

  // Override with provided status if valid
  if (status && ['claimed', 'not_claimed', 'requires_verification'].includes(status)) {
    claimStatus = status as 'claimed' | 'not_claimed' | 'requires_verification';
  }

  // Create or update claim
  const { error } = await supabase
    .from('offer_claims')
    .upsert({
      student_profile_id: studentProfile.id,
      offer_id: id,
      status: claimStatus,
      project_id: projectId || null,
    }, {
      onConflict: 'student_profile_id,offer_id',
    });

  if (error) {
    console.error('Error claiming offer:', error);
    return NextResponse.json({ error: 'Failed to claim offer' }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: claimStatus });
}
