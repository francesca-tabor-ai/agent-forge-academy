import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateJobMatch, determineJobStatus, type StudentProfile, type PortfolioProject, type CourseEnrollment, type Job } from '@/lib/jobs/matching';

export async function GET() {
  try {
    const supabase = await createUserSupabaseClient();
    
    // Get user
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

    // Get student profile with skills
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, skills')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Get enrolled courses
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id, progress_percentage, completed_at')
      .eq('student_profile_id', studentProfile.id);

    // Get portfolio projects with tech_stack
    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('id, tech_stack, title, description')
      .eq('student_profile_id', studentProfile.id);

    // Fetch active jobs
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .limit(50); // Fetch more jobs for better matching

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    // Prepare student data for matching
    const studentProfileData: StudentProfile = {
      id: studentProfile.id,
      skills: (studentProfile.skills as string[]) || [],
    };

    const portfolioProjectsData: PortfolioProject[] = (projects || []).map((p: any) => ({
      id: p.id,
      tech_stack: (p.tech_stack as string[]) || [],
      title: p.title,
      description: p.description,
    }));

    const enrolledCoursesData: CourseEnrollment[] = (enrollments || []).map((e: any) => ({
      course_id: e.course_id,
      progress_percentage: e.progress_percentage,
      completed_at: e.completed_at,
    }));

    // Calculate matching scores for each job
    const jobsWithScores = (jobs || []).map((job: any) => {
      const jobData: Job = {
        id: job.id,
        skills: (job.skills as string[]) || [],
        recommended_for_courses: (job.recommended_for_courses as string[]) || [],
        experience_level: job.experience_level,
      };

      const matchResult = calculateJobMatch(
        jobData,
        studentProfileData,
        enrolledCoursesData,
        portfolioProjectsData
      );

      // Determine status based on calculated score
      const status = determineJobStatus(matchResult.matchingScore);

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        matchingScore: matchResult.matchingScore,
        status,
        skills: jobData.skills,
        skillsMissing: matchResult.skillsMissing,
        isLocked: status === 'locked',
        isStretch: status === 'stretch',
      };
    });

    // Sort by matching score (descending)
    jobsWithScores.sort((a, b) => b.matchingScore - a.matchingScore);

    // Limit to top 20
    const topJobs = jobsWithScores.slice(0, 20);

    return NextResponse.json({ jobs: topJobs });
  } catch (error) {
    console.error('Error in jobs API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
