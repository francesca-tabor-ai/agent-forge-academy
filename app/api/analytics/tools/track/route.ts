import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { type AnalyticsEventType } from '@/lib/utils/tool-analytics';

interface TrackEventRequest {
  event_type: AnalyticsEventType;
  tool_id?: string;
  offer_id?: string;
  course_id?: string;
  project_id?: string;
  metadata?: Record<string, any>;
}

// POST: Track an analytics event
export async function POST(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TrackEventRequest = await request.json();
    const { event_type, tool_id, offer_id, course_id, project_id, metadata } = body;

    if (!event_type) {
      return NextResponse.json({ error: 'event_type is required' }, { status: 400 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get student profile ID if exists
    let studentProfileId: string | null = null;
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    studentProfileId = studentProfile?.id || null;

    // Insert analytics event
    const { error } = await supabase
      .from('tool_analytics_events')
      .insert({
        event_type,
        user_id: user.id,
        student_profile_id: studentProfileId,
        tool_id: tool_id || null,
        offer_id: offer_id || null,
        course_id: course_id || null,
        project_id: project_id || null,
        metadata: metadata || {},
      });

    if (error) {
      console.error('Error tracking analytics event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in analytics tracking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
