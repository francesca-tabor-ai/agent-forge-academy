import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location: string | null;
  is_remote: boolean;
  salary_range: string | null;
  status: 'new' | 'unlocked' | 'recommended' | 'locked' | 'stretch';
  matching_score: number;
  skills: string[];
  skills_missing: string[] | null;
  recommended_for_courses: string[] | null;
  external_url: string | null;
  application_deadline: string | null;
  is_featured: boolean;
}

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get student profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  const { id } = await params;

  // Fetch the job from API (uses computed matching fields)
  // Get auth cookies to forward to API
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Determine base URL for API call
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  let jobData: Job;
  try {
    const response = await fetch(`${baseUrl}/api/jobs/${id}`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store', // Always get fresh computed values
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('Failed to fetch job');
    }

    jobData = (await response.json()) as Job;
  } catch (error) {
    console.error('Error fetching job from API:', error);
    // Fallback: if API fails, still try to show the job (but without computed fields)
    // This ensures the page doesn't break if API is temporarily unavailable
    const { data: job, error: dbError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (dbError || !job) {
      notFound();
    }

    // Use static values as fallback (not ideal, but better than breaking)
    jobData = {
      ...job,
      status: (job.status as any) || 'new',
      matching_score: job.matching_score || 0,
      skills_missing: (job.skills_missing as string[]) || [],
    } as Job;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return { label: 'New', className: 'bg-green-100 text-green-700' };
      case 'unlocked':
        return { label: 'Unlocked', className: 'bg-blue-100 text-blue-700' };
      case 'recommended':
        return { label: 'Recommended', className: 'bg-purple-100 text-purple-700' };
      case 'stretch':
        return { label: 'Stretch Role', className: 'bg-yellow-100 text-yellow-700' };
      case 'locked':
        return { label: 'Locked', className: 'bg-gray-100 text-gray-700' };
      default:
        return null;
    }
  };

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      internship: 'Internship',
      freelance: 'Freelance',
    };
    return labels[type] || type;
  };

  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior',
      lead: 'Lead',
      executive: 'Executive',
    };
    return labels[level] || level;
  };

  const getMatchingColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getDaysUntilDeadline = (dateString: string | null) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const statusBadge = getStatusBadge(jobData.status);
  const daysUntilDeadline = getDaysUntilDeadline(jobData.application_deadline);

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/student/jobs"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
      >
        ← Back to Job Opportunities
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">{jobData.title}</h1>
              {statusBadge && (
                <span className={`px-3 py-1 text-sm font-medium rounded ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              )}
              {jobData.is_featured && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                  ⭐ Featured
                </span>
              )}
            </div>
            <p className="text-lg text-gray-600 mb-4">{jobData.company}</p>

            {/* Job Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="font-medium">{getJobTypeLabel(jobData.job_type)}</span>
              <span>•</span>
              <span>{getExperienceLabel(jobData.experience_level)}</span>
              {jobData.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {jobData.is_remote && <span className="text-green-600">🌐</span>}
                    {jobData.location}
                  </span>
                </>
              )}
              {jobData.salary_range && (
                <>
                  <span>•</span>
                  <span className="font-medium text-gray-900">{jobData.salary_range}</span>
                </>
              )}
            </div>

            {/* Match Score */}
            <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getMatchingColor(jobData.matching_score)}`}>
              <span className="text-sm font-semibold">
                {jobData.matching_score}% Match
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">{jobData.description}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {jobData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Match Explanation (computed from API) */}
        {(jobData as any).explanation && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Match Breakdown</h3>
            <pre className="text-xs text-blue-800 whitespace-pre-wrap font-sans">
              {(jobData as any).explanation}
            </pre>
          </div>
        )}

        {/* Missing Skills (computed from API) */}
        {jobData.skills_missing && jobData.skills_missing.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              {jobData.status === 'locked' ? '🔒 One step away' : jobData.status === 'stretch' ? '🎯 Close match' : '⚠️ Missing Skills'}
            </p>
            <p className="text-xs text-yellow-700 mb-2">
              {jobData.status === 'locked' || jobData.status === 'stretch' 
                ? 'Complete these skills to improve your match:' 
                : 'These skills are required for this role:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {jobData.skills_missing.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Courses */}
        {jobData.recommended_for_courses && jobData.recommended_for_courses.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Recommended Courses</h3>
            <p className="text-xs text-blue-700 mb-2">
              These courses will help you prepare for this role:
            </p>
            <div className="flex flex-wrap gap-2">
              {jobData.recommended_for_courses.map((slug, idx) => (
                <Link
                  key={slug}
                  href={`/student/courses/${slug}`}
                  className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                >
                  {slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Application Deadline */}
        {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Application Deadline:</span>
              <span className={`text-sm font-medium ${
                daysUntilDeadline <= 7 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-secondary text-sm">
              Generate CV
            </button>
            <button className="btn-secondary text-sm">
              Cover Letter
            </button>
            <button className="btn-secondary text-sm">
              Tailor Portfolio
            </button>
          </div>

          {jobData.external_url ? (
            <a
              href={jobData.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              Apply Now →
            </a>
          ) : (
            <button className="btn-primary">
              Save Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
