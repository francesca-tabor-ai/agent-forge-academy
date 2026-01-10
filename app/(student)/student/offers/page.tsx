import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { courseMetadata } from '@/lib/course-metadata';

interface Offer {
  id: string;
  title: string;
  provider: string;
  description: string;
  category: 'api' | 'hosting' | 'monitoring' | 'data' | 'tools' | 'services';
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

export default async function OffersPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get student profile to check enrollments
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  // Get student profile ID
  let studentProfileId: string | null = null;
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .single();
  studentProfileId = studentProfile?.id || null;

  // Get active courses for recommendations
  let enrolledCourseSlugs: string[] = [];
  if (studentProfileId) {
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('student_profile_id', studentProfileId);

    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map(e => e.course_id);
      const { data: courses } = await supabase
        .from('courses')
        .select('slug')
        .in('id', courseIds);
      
      enrolledCourseSlugs = (courses || []).map(c => c.slug).filter(Boolean);
    }
  }

  // Fetch all active offers
  const { data: offers, error } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .order('is_recommended', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching offers:', error);
  }

  const allOffers: Offer[] = (offers || []) as Offer[];

  // Determine which offers are recommended for this student
  const recommendedOffers: Offer[] = [];
  const otherOffers: Offer[] = [];

  allOffers.forEach(offer => {
    const isRecommended = offer.is_recommended || 
      (offer.recommended_for_courses && 
       offer.recommended_for_courses.some(slug => enrolledCourseSlugs.includes(slug)));
    
    if (isRecommended) {
      recommendedOffers.push(offer);
    } else {
      otherOffers.push(offer);
    }
  });

  // Get context for recommended offers
  const getRecommendationContext = (offer: Offer): string | null => {
    if (!offer.recommended_for_courses || offer.recommended_for_courses.length === 0) {
      return null;
    }
    
    const matchingCourses = offer.recommended_for_courses
      .filter(slug => enrolledCourseSlugs.includes(slug))
      .map(slug => courseMetadata[slug]?.title || slug)
      .slice(0, 2);
    
    if (matchingCourses.length > 0) {
      return `Recommended because you're building: ${matchingCourses.join(', ')}`;
    }
    
    return null;
  };

  const categoryIcons: Record<string, string> = {
    api: '🔌',
    hosting: '☁️',
    monitoring: '📊',
    data: '💾',
    tools: '🛠️',
    services: '⚙️',
  };

  const categoryColors: Record<string, string> = {
    api: 'bg-purple-50 border-purple-200',
    hosting: 'bg-blue-50 border-blue-200',
    monitoring: 'bg-green-50 border-green-200',
    data: 'bg-yellow-50 border-yellow-200',
    tools: 'bg-orange-50 border-orange-200',
    services: 'bg-pink-50 border-pink-200',
  };

  const getDaysUntilExpiration = (dateString: string | null) => {
    if (!dateString) return null;
    const expiration = new Date(dateString);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tool Discounts</h1>
        <p className="text-sm text-gray-500 mt-2">
          Exclusive tools to help you build and ship faster
        </p>
      </div>

      {/* Recommended Offers Section */}
      {recommendedOffers.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              Recommended for your current project
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedOffers.map((offer) => {
              const daysUntilExpiration = getDaysUntilExpiration(offer.expiration_date);
              const usagePercentage = offer.max_usage 
                ? Math.round((offer.usage_count || 0) / offer.max_usage * 100)
                : 0;
              const recommendationContext = getRecommendationContext(offer);

              return (
                <div
                  key={offer.id}
                  className={`bg-white border rounded-lg p-4 hover:shadow-lg transition-all ${
                    categoryColors[offer.category] || 'border-gray-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{categoryIcons[offer.category] || '🛠️'}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{offer.title}</h3>
                        <p className="text-xs text-gray-500">{offer.provider}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      ⭐ Recommended
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-3">{offer.description}</p>
                  
                  {/* Recommendation Context */}
                  {recommendationContext && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                      {recommendationContext}
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-800">{offer.discount_text}</span>
                    </div>
                    {offer.original_price && offer.discounted_price && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 line-through">{offer.original_price}</span>
                        <span className="text-xs font-semibold text-green-700">{offer.discounted_price}</span>
                      </div>
                    )}
                  </div>

                  {/* Eligibility */}
                  {offer.eligibility && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">{offer.eligibility}</p>
                    </div>
                  )}

                  {/* Usage/Expiration Info */}
                  <div className="mb-3 space-y-2">
                    {daysUntilExpiration !== null && daysUntilExpiration > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Expires in:</span>
                        <span className={`font-medium ${
                          daysUntilExpiration <= 7 ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {offer.max_usage && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Available:</span>
                          <span className="font-medium text-gray-700">
                            {offer.max_usage - (offer.usage_count || 0)} remaining
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-brand-light h-1.5 rounded-full transition-all"
                            style={{ width: `${100 - usagePercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* CTA */}
                  <div className="pt-3 border-t border-gray-200">
                    <Link
                      href={`/student/offers/${offer.id}`}
                      className="text-xs font-medium text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1"
                    >
                      Claim Offer →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Offers Section */}
      {otherOffers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherOffers.map((offer) => {
              const daysUntilExpiration = getDaysUntilExpiration(offer.expiration_date);
              const usagePercentage = offer.max_usage 
                ? Math.round((offer.usage_count || 0) / offer.max_usage * 100)
                : 0;

              return (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{categoryIcons[offer.category] || '🛠️'}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{offer.title}</h3>
                        <p className="text-xs text-gray-500">{offer.provider}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-3">{offer.description}</p>
                  
                  {/* Discount Badge */}
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-800">{offer.discount_text}</span>
                    </div>
                    {offer.original_price && offer.discounted_price && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 line-through">{offer.original_price}</span>
                        <span className="text-xs font-semibold text-green-700">{offer.discounted_price}</span>
                      </div>
                    )}
                  </div>

                  {/* Eligibility */}
                  {offer.eligibility && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">{offer.eligibility}</p>
                    </div>
                  )}

                  {/* Usage/Expiration Info */}
                  <div className="mb-3 space-y-2">
                    {daysUntilExpiration !== null && daysUntilExpiration > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Expires in:</span>
                        <span className={`font-medium ${
                          daysUntilExpiration <= 7 ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {offer.max_usage && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Available:</span>
                          <span className="font-medium text-gray-700">
                            {offer.max_usage - (offer.usage_count || 0)} remaining
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-brand-light h-1.5 rounded-full transition-all"
                            style={{ width: `${100 - usagePercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* CTA */}
                  <div className="pt-3 border-t border-gray-200">
                    <Link
                      href={`/student/offers/${offer.id}`}
                      className="text-xs font-medium text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1"
                    >
                      Claim Offer →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allOffers.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">
            No active discounts right now. New tools are added regularly.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/student/courses"
              className="text-sm font-medium text-brand-light hover:text-brand-light/90"
            >
              Browse Courses →
            </Link>
            <Link
              href="/student/ai-advisor"
              className="text-sm font-medium text-brand-light hover:text-brand-light/90"
            >
              Ask AI Advisor for tool recommendations →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
