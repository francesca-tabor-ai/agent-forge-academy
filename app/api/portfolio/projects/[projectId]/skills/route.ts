import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { safeLogger } from '@/lib/utils/redactPII';
import { normalizeSkill } from '@/lib/profile/extractSkillsFromCv';

/**
 * GET /api/portfolio/projects/[projectId]/skills
 * Get all skills for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
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

    // Verify project belongs to student
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', params.projectId)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch project skills
    const { data: projectSkills, error } = await supabase
      .from('project_skills')
      .select(`
        skill_id,
        skills:skill_id (
          id,
          name
        )
      `)
      .eq('project_id', params.projectId);

    if (error) {
      safeLogger.error('[Project Skills API] Error fetching skills', {
        userId: user.id,
        projectId: params.projectId,
        error: error.message,
      });
      return NextResponse.json(
        { error: 'Failed to fetch project skills' },
        { status: 500 }
      );
    }

    const skills = (projectSkills || [])
      .map((ps: any) => ps.skills)
      .filter(Boolean)
      .map((skill: any) => ({
        id: skill.id,
        name: skill.name,
      }));

    return NextResponse.json({ skills });
  } catch (error) {
    safeLogger.error('[Project Skills API] Error in GET', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio/projects/[projectId]/skills
 * Add a skill to a project
 * Body: { skillName: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { skillName } = body;

    if (!skillName || typeof skillName !== 'string' || skillName.trim().length === 0) {
      return NextResponse.json(
        { error: 'skillName is required and must be a non-empty string' },
        { status: 400 }
      );
    }

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

    // Verify project belongs to student
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', params.projectId)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Normalize skill name
    const normalizedSkillName = normalizeSkill(skillName.trim());

    if (!normalizedSkillName || normalizedSkillName.length === 0) {
      return NextResponse.json(
        { error: 'Invalid skill name' },
        { status: 400 }
      );
    }

    // Format skill name (title case)
    const formatSkillName = (skill: string): string => {
      return skill
        .trim()
        .replace(/\s+/g, ' ')
        .split(/\s+/)
        .map(word => {
          if (word.length === 0) return word;
          if (/^[.#+\-]+$/.test(word)) return word;
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    };

    const formattedSkillName = formatSkillName(normalizedSkillName);

    // Find or create skill (upsert by user_id + name, case-insensitive)
    // First, check if skill exists (case-insensitive)
    const { data: allUserSkills } = await supabase
      .from('skills')
      .select('id, name')
      .eq('user_id', user.id);

    let skillId: string | undefined;
    if (allUserSkills) {
      const matchingSkill = allUserSkills.find(
        s => s.name.toLowerCase() === formattedSkillName.toLowerCase()
      );
      if (matchingSkill) {
        skillId = matchingSkill.id;
      }
    }

    if (!skillId) {
      // Create new skill
      // Use ON CONFLICT DO NOTHING to handle race conditions
      const { data: newSkill, error: skillError } = await supabase
        .from('skills')
        .insert({
          user_id: user.id,
          name: formattedSkillName,
        })
        .select('id')
        .single();

      if (skillError) {
        // Check if it's a unique constraint violation (case-insensitive)
        if (skillError.code === '23505') {
          // Skill already exists, find it
          const { data: refreshedSkills } = await supabase
            .from('skills')
            .select('id, name')
            .eq('user_id', user.id);

          if (refreshedSkills) {
            const matchingSkill = refreshedSkills.find(
              s => s.name.toLowerCase() === formattedSkillName.toLowerCase()
            );
            if (matchingSkill) {
              skillId = matchingSkill.id;
            } else {
              return NextResponse.json(
                { error: 'Failed to create skill (race condition)' },
                { status: 500 }
              );
            }
          } else {
            return NextResponse.json(
              { error: 'Failed to create skill' },
              { status: 500 }
            );
          }
        } else {
          safeLogger.error('[Project Skills API] Error creating skill', {
            userId: user.id,
            skillName: formattedSkillName,
            error: skillError.message,
          });
          return NextResponse.json(
            { error: 'Failed to create skill' },
            { status: 500 }
          );
        }
      } else if (newSkill) {
        skillId = newSkill.id;
      } else {
        return NextResponse.json(
          { error: 'Failed to create skill' },
          { status: 500 }
        );
      }
    }

    // Link skill to project
    // Use ON CONFLICT DO NOTHING to avoid duplicates
    const { error: linkError } = await supabase
      .from('project_skills')
      .insert({
        project_id: params.projectId,
        skill_id: skillId,
      });

    if (linkError) {
      // Ignore duplicate key errors (23505) - skill already linked
      if (linkError.code !== '23505') {
        safeLogger.error('[Project Skills API] Error linking skill to project', {
          userId: user.id,
          projectId: params.projectId,
          skillId,
          error: linkError.message,
        });
        return NextResponse.json(
          { error: 'Failed to add skill to project' },
          { status: 500 }
        );
      }
      // If it's a duplicate, that's fine - skill is already linked
    }

    // Fetch the skill details
    const { data: skill } = await supabase
      .from('skills')
      .select('id, name')
      .eq('id', skillId)
      .single();

    return NextResponse.json({
      success: true,
      skill: skill ? { id: skill.id, name: skill.name } : null,
    });
  } catch (error) {
    safeLogger.error('[Project Skills API] Error in POST', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portfolio/projects/[projectId]/skills
 * Remove a skill from a project
 * Body: { skillId: string } or { skillName: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { skillId, skillName } = body;

    if (!skillId && !skillName) {
      return NextResponse.json(
        { error: 'Either skillId or skillName is required' },
        { status: 400 }
      );
    }

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

    // Verify project belongs to student
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', params.projectId)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    let targetSkillId: string | undefined = skillId;

    // If skillName provided, find skill by name
    if (!targetSkillId && skillName) {
      const { data: skill } = await supabase
        .from('skills')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', skillName.trim())
        .single();

      if (!skill) {
        return NextResponse.json(
          { error: 'Skill not found' },
          { status: 404 }
        );
      }

      targetSkillId = skill.id;
    }

    if (!targetSkillId) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Remove skill from project
    const { error: deleteError } = await supabase
      .from('project_skills')
      .delete()
      .eq('project_id', params.projectId)
      .eq('skill_id', targetSkillId);

    if (deleteError) {
      safeLogger.error('[Project Skills API] Error removing skill from project', {
        userId: user.id,
        projectId: params.projectId,
        skillId: targetSkillId,
        error: deleteError.message,
      });
      return NextResponse.json(
        { error: 'Failed to remove skill from project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    safeLogger.error('[Project Skills API] Error in DELETE', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
