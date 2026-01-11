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

  // Save offer
  const { error } = await supabase
    .from('saved_offers')
    .insert({
      student_profile_id: studentProfile.id,
      offer_id: id,
    });

  if (error) {
    // If already saved, that's fine
    if (error.code === '23505') {
      return NextResponse.json({ success: true });
    }
    console.error('Error saving offer:', error);
    return NextResponse.json({ error: 'Failed to save offer' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
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

  // Remove saved offer
  const { error } = await supabase
    .from('saved_offers')
    .delete()
    .eq('student_profile_id', studentProfile.id)
    .eq('offer_id', id);

  if (error) {
    console.error('Error removing saved offer:', error);
    return NextResponse.json({ error: 'Failed to remove saved offer' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
