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
    const { studentProfileId, skills } = body;

    if (!studentProfileId || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'studentProfileId and skills array are required' },
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
      .select('id, profile_id')
      .eq('id', studentProfileId)
      .single();

    if (fetchError || !studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    if (studentProfile.profile_id !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate and normalize skills
    const normalizedSkills: Skill[] = skills.map((skill: any, index: number) => {
      if (typeof skill === 'string') {
        return {
          name: skill,
          isTopSkill: false,
          order: index,
        };
      }
      return {
        name: skill.name,
        isTopSkill: skill.isTopSkill || false,
        order: skill.order !== undefined ? skill.order : index,
      };
    });

    // Update skills
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ skills: normalizedSkills })
      .eq('id', studentProfileId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, skills: normalizedSkills });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
