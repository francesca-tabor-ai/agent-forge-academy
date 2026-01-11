import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch conversation history for current context
export async function GET(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const projectId = searchParams.get('projectId');
    const jobId = searchParams.get('jobId');
    const conversationId = searchParams.get('conversationId');

    // Get student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Not a student' }, { status: 403 });
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from('advisor_conversations')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: true });

    // Filter by context
    if (courseId) {
      query = query.eq('active_course_id', courseId);
    } else {
      query = query.is('active_course_id', null);
    }

    if (projectId) {
      query = query.eq('active_project_id', projectId);
    } else {
      query = query.is('active_project_id', null);
    }

    if (jobId) {
      query = query.eq('active_job_id', jobId);
    } else {
      query = query.is('active_job_id', null);
    }

    // Filter by conversation ID if provided
    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Group by conversation_id and get the most recent conversation
    const conversationGroups = new Map<string, any[]>();
    conversations?.forEach((conv) => {
      const id = conv.conversation_id;
      if (!conversationGroups.has(id)) {
        conversationGroups.set(id, []);
      }
      conversationGroups.get(id)!.push(conv);
    });

    // Get the most recent conversation (by latest message timestamp)
    let mostRecentConversation: any[] | null = null;
    let mostRecentTime = 0;

    for (const messages of conversationGroups.values()) {
      const latestTime = Math.max(...messages.map((m) => new Date(m.created_at).getTime()));
      if (latestTime > mostRecentTime) {
        mostRecentTime = latestTime;
        mostRecentConversation = messages;
      }
    }

    if (!mostRecentConversation || mostRecentConversation.length === 0) {
      return NextResponse.json({ messages: [], conversationId: null });
    }

    // TypeScript needs this assignment to properly narrow the type
    const conversation = mostRecentConversation;

    // Convert to message format
    const messages = conversation.map((conv) => ({
      id: conv.id,
      role: conv.role,
      content: conv.content,
      timestamp: new Date(conv.created_at),
      intent: conv.metadata?.intent,
      metadata: conv.metadata, // Include full metadata for next_actions
    }));

    return NextResponse.json({
      messages,
      conversationId: conversation[0].conversation_id,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
