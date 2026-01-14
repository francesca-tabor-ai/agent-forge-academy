import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface Skill {
  name: string;
  isTopSkill?: boolean;
  order?: number;
}

export async function POST(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentProfileId, skillName, isTopSkill } = body;

    if (!studentProfileId || !skillName || typeof isTopSkill !== 'boolean') {
      return NextResponse.json(
        { error: 'studentProfileId, skillName, and isTopSkill (boolean) are required' },
        { status: 400 }
      );
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

    // Get student profile and verify ownership
    const { data: studentProfile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('id, profile_id, skills')
      .eq('id', studentProfileId)
      .single();

    if (fetchError || !studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    if (studentProfile.profile_id !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get current skills
    let currentSkills: Skill[] = [];
    if (studentProfile.skills) {
      if (Array.isArray(studentProfile.skills)) {
        if (typeof studentProfile.skills[0] === 'string') {
          // Legacy format: string array
          currentSkills = (studentProfile.skills as string[]).map((name, index) => ({
            name,
            isTopSkill: false,
            order: index,
          }));
        } else {
          // New format: object array
          currentSkills = studentProfile.skills as Skill[];
        }
      }
    }

    // Check current top skills count
    const currentTopCount = currentSkills.filter(s => s.isTopSkill).length;
    
    // If trying to add and already at max (5), return error
    if (isTopSkill && currentTopCount >= 5) {
      return NextResponse.json(
        { error: 'You can mark up to 5 skills as top skills. Please unmark another top skill first.' },
        { status: 400 }
      );
    }

    // Update the skill
    const updatedSkills = currentSkills.map(skill => 
      skill.name === skillName
        ? { ...skill, isTopSkill }
        : skill
    );

    // Update skills
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ skills: updatedSkills })
      .eq('id', studentProfileId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, skills: updatedSkills });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
