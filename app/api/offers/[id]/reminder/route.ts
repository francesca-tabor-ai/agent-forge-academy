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

  const body = await request.json();
  const { days } = body;

  if (!days || typeof days !== 'number') {
    return NextResponse.json({ error: 'Invalid days parameter' }, { status: 400 });
  }

  // Update or insert saved offer with reminder
  const { error } = await supabase
    .from('saved_offers')
    .upsert({
      student_profile_id: studentProfile.id,
      offer_id: id,
      reminder_days_before_expiry: days,
    }, {
      onConflict: 'student_profile_id,offer_id',
    });

  if (error) {
    console.error('Error setting reminder:', error);
    return NextResponse.json({ error: 'Failed to set reminder' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
