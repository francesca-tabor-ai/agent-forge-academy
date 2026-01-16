import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ToolLogo } from '@/components/offers/ToolLogo';
import { OfferDetailClient } from '@/components/offers/OfferDetailClient';
import { ProjectsUsingTool } from '@/components/offers/ProjectsUsingTool';
import { ToolProficiencyDisplay } from '@/components/offers/ToolProficiencyDisplay';

interface Offer {
  id: string;
  title: string;
  provider: string;
  description: string;
  category: 'api' | 'hosting' | 'monitoring' | 'data' | 'tools' | 'services' | 'database' | 'vector_database' | 'ai_llm' | 'observability' | 'analytics' | 'ml_tools';
  discount_text: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_credits' | 'extended_trial' | 'tier_upgrade';
  discount_value: number | null;
  discount_code: string | null;
  external_url: string | null;
  eligibility: string | null;
  recommended_for_courses: string[] | null;
  original_price: string | null;
  discounted_price: string | null;
  features: string[] | null;
  is_recommended: boolean;
  expiration_date: string | null;
  usage_count: number;
  max_usage: number | null;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  // Get student profile ID for enrollment checks
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  const studentProfileId = studentProfile?.id || null;

  // Convert slug to tool name (provider name) - normalize for matching
  // Slug format: "supabase" -> "Supabase", "open-ai" -> "Open AI"
  const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ');
  
  // Fetch all active offers and filter by provider matching the slug
  const { data: allOffers, error: offersError } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .order('is_recommended', { ascending: false })
    .order('created_at', { ascending: false });

  if (offersError || !allOffers) {
    notFound();
  }

  // Find offers where provider matches the slug (case-insensitive, normalized)
  const toolOffers: Offer[] = (allOffers as Offer[]).filter(offer => {
    const normalizedProvider = offer.provider.toLowerCase().replace(/\s+/g, ' ');
    return normalizedProvider === normalizedSlug || 
           normalizedProvider.replace(/\s+/g, '-') === slug.toLowerCase();
  });

  if (toolOffers.length === 0) {
    notFound();
  }

  // Get the actual tool name from the first offer
  const toolName = toolOffers[0].provider;

  // Get tool description from first offer
  const toolDescription = toolOffers[0].description;
  const toolCategory = toolOffers[0].category;

  // Collect all unique course slugs from offers
  const courseSlugs = new Set<string>();
  toolOffers.forEach(offer => {
    if (offer.recommended_for_courses) {
      offer.recommended_for_courses.forEach(slug => courseSlugs.add(slug));
    }
  });

  // Fetch courses that teach this tool
  let courses: Course[] = [];
  if (courseSlugs.size > 0) {
    const { data: coursesData } = await supabase
      .from('courses')
      .select('id, slug, title, description')
      .in('slug', Array.from(courseSlugs));

    courses = (coursesData || []) as Course[];
  }

  // Get enrolled courses and completion status for this student
  let enrolledCourseSlugs: string[] = [];
  let completedCourseSlugs: string[] = [];
  let completedCourseIds: Set<string> = new Set();
  
  if (studentProfileId) {
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id, progress_percentage, completed_at')
      .eq('student_profile_id', studentProfileId);

    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map(e => e.course_id);
      const { data: enrolledCourses } = await supabase
        .from('courses')
        .select('id, slug')
        .in('id', courseIds);
      
      enrolledCourseSlugs = (enrolledCourses || []).map(c => c.slug).filter(Boolean);
      
      // Check which courses are completed
      enrollments.forEach(enrollment => {
        const isCompleted = enrollment.completed_at !== null || 
                           (enrollment.progress_percentage !== null && enrollment.progress_percentage >= 100);
        if (isCompleted) {
          completedCourseIds.add(enrollment.course_id);
        }
      });
      
      // Get slugs for completed courses
      completedCourseSlugs = (enrolledCourses || [])
        .filter(c => completedCourseIds.has(c.id))
        .map(c => c.slug)
        .filter(Boolean);
    }
  }

  // Get claimed offers
  const claimedOfferIds: Record<string, 'claimed' | 'not_claimed' | 'requires_verification'> = {};
  if (studentProfileId) {
    const { data: claims } = await supabase
      .from('offer_claims')
      .select('offer_id, status')
      .eq('student_profile_id', studentProfileId)
      .in('offer_id', toolOffers.map(o => o.id));

    (claims || []).forEach(claim => {
      claimedOfferIds[claim.offer_id] = claim.status as 'claimed' | 'not_claimed' | 'requires_verification';
    });
  }

  // Get website URL from first offer or generate
  const websiteUrl = toolOffers[0].external_url || `https://${toolName.toLowerCase().replace(/\s+/g, '')}.com`;

  const categoryLabels: Record<string, string> = {
    api: 'API',
    hosting: 'Deploy',
    monitoring: 'Monitoring',
    data: 'Data',
    tools: 'Tools',
    services: 'Services',
    database: 'DB & Auth',
    vector_database: 'Vector DB',
    ai_llm: 'LLM APIs',
    observability: 'Observability',
    analytics: 'Analytics',
    ml_tools: 'Experiment Tracking',
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/student/tools"
        className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        ← Back to Tools
      </Link>

      {/* Header with Logo + Name */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-6">
          <ToolLogo
            toolName={toolName}
            logoUrl={null}
            size={80}
            className="flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{toolName}</h1>
              <ToolProficiencyDisplay toolName={toolName} toolSlug={slug} />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {categoryLabels[toolCategory] || toolCategory}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{toolDescription}</p>
            <div className="flex items-center gap-4">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-light hover:text-brand-light/90 font-medium inline-flex items-center gap-1"
              >
                Website →
              </a>
              {/* Docs link - placeholder for now */}
              <a
                href={`${websiteUrl}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1"
              >
                Documentation →
              </a>
            </div>
          </div>
        </div>
        </div>

      {/* Courses Section */}
      {courses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Courses that teach this tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/student/courses/${course.slug}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand-light hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                )}
                <div className="mt-2 text-sm text-brand-light">View course →</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Videos & Walkthroughs</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Video content coming soon. Check back for tutorials and walkthroughs.</p>
        </div>
      </div>

      {/* Projects Using This Tool Section */}
      {studentProfileId && (
        <ProjectsUsingTool toolName={toolName} studentProfileId={studentProfileId} />
      )}

      {/* Offers Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Offers</h2>
        {toolOffers.length > 0 ? (
          <div className="space-y-4">
            {toolOffers.map((offer) => {
              // Check if offer is gated by course completion
              // For now, we'll check if it has recommended_for_courses
              // In the future, this will use tool_offers.requires_course_completion
              const isGated = offer.recommended_for_courses && offer.recommended_for_courses.length > 0;
              const requiredCourseSlug = offer.recommended_for_courses?.[0] || null;
              
              // Check if user has completed the required course
              const hasCompletedCourse = requiredCourseSlug 
                ? completedCourseSlugs.includes(requiredCourseSlug)
                : true;
              
              // Find the course title for display
              const requiredCourse = requiredCourseSlug 
                ? courses.find(c => c.slug === requiredCourseSlug)
                : null;
              const requiredCourseTitle = requiredCourse?.title || 
                (requiredCourseSlug 
                  ? requiredCourseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                  : null);
              
              const isUnlocked = !isGated || hasCompletedCourse;
              const claimStatus = claimedOfferIds[offer.id];

              const getDaysUntilExpiration = (dateString: string | null) => {
                if (!dateString) return null;
                const expiration = new Date(dateString);
                const now = new Date();
                const diffTime = expiration.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 ? diffDays : 0;
              };

              const daysUntilExpiration = getDaysUntilExpiration(offer.expiration_date);

              return (
                <div
                  key={offer.id}
                  className={`p-5 border rounded-lg ${
                    isUnlocked ? 'border-gray-200' : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{offer.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                          {offer.discount_text}
                        </span>
                        {daysUntilExpiration !== null && daysUntilExpiration > 0 && (
                          <span className={`px-2.5 py-1 text-xs font-medium rounded ${
                            daysUntilExpiration <= 7 
                              ? 'bg-red-50 text-red-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            Expires in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                  </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Locked Offer Message */}
                  {!isUnlocked && requiredCourseSlug && requiredCourseTitle && (
                    <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">🔒</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 mb-2">
                            Complete <em>{requiredCourseTitle}</em> to unlock this offer.
                          </p>
                          <Link
                            href={`/student/courses/${requiredCourseSlug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                          >
                            Go to Course →
                          </Link>
                        </div>
                      </div>
            </div>
          )}

                  {/* Unlocked Offer Content */}
                  {isUnlocked && (
                    <>
                      {offer.discount_code && (
                        <div className="mb-4">
                          <OfferDetailClient discountCode={offer.discount_code} />
        </div>
                      )}

                      {offer.features && offer.features.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Includes:</p>
                          <ul className="space-y-1">
                            {offer.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-600 mt-0.5">✓</span>
                                <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

                      {/* Setup Guide */}
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">Setup Guide:</p>
                        <ol className="space-y-1 text-xs text-gray-600 list-decimal list-inside">
                          {offer.discount_code ? (
              <>
                <li>Copy the discount code above</li>
                              <li>Click "Claim Offer" to visit the provider's website</li>
                <li>Apply the code during checkout or signup</li>
              </>
            ) : (
              <>
                              <li>Click "Claim Offer" below</li>
                <li>Follow the provider's signup or checkout process</li>
                <li>The discount will be applied automatically if eligible</li>
              </>
            )}
          </ol>
        </div>

                      {/* Claim Status */}
                      {claimStatus && (
                        <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                          <div className="flex items-center gap-2">
                            {claimStatus === 'claimed' && <span className="text-green-600">✅</span>}
                            {claimStatus === 'requires_verification' && <span className="text-yellow-600">⏳</span>}
                            <span className="font-medium text-gray-700">
                              {claimStatus === 'claimed' && 'Claimed'}
                              {claimStatus === 'requires_verification' && 'Requires verification'}
                              {claimStatus === 'not_claimed' && 'Not claimed'}
                  </span>
                </div>
              </div>
            )}

                      {/* Claim Button */}
                      <div className="pt-4 border-t border-gray-200">
                        {offer.external_url ? (
                          <a
                            href={offer.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-light text-white rounded-md hover:bg-brand-light/90 transition-colors font-medium"
            >
              Claim Offer →
            </a>
          ) : (
                          <div className="text-sm text-gray-500">No claim URL available</div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Disabled Claim Button for Locked Offers */}
                  {!isUnlocked && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        disabled
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed font-medium"
                      >
                        Claim Offer (Locked)
                      </button>
                    </div>
                  )}
                    </>
          )}
        </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No offers available for this tool at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
