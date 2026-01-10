import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { OfferDetailClient } from '@/components/offers/OfferDetailClient';

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

export default async function OfferDetailPage({ params }: { params: { id: string } }) {
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

  // Fetch the offer
  const { data: offer, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (error || !offer) {
    notFound();
  }

  const offerData = offer as Offer;

  const categoryIcons: Record<string, string> = {
    api: '🔌',
    hosting: '☁️',
    monitoring: '📊',
    data: '💾',
    tools: '🛠️',
    services: '⚙️',
    database: '🗄️',
    vector_database: '🔍',
    ai_llm: '🤖',
    observability: '👁️',
    analytics: '📈',
    ml_tools: '🧪',
  };

  const categoryColors: Record<string, string> = {
    api: 'bg-purple-50 border-purple-200',
    hosting: 'bg-blue-50 border-blue-200',
    monitoring: 'bg-green-50 border-green-200',
    data: 'bg-yellow-50 border-yellow-200',
    tools: 'bg-orange-50 border-orange-200',
    services: 'bg-pink-50 border-pink-200',
    database: 'bg-indigo-50 border-indigo-200',
    vector_database: 'bg-cyan-50 border-cyan-200',
    ai_llm: 'bg-violet-50 border-violet-200',
    observability: 'bg-emerald-50 border-emerald-200',
    analytics: 'bg-rose-50 border-rose-200',
    ml_tools: 'bg-amber-50 border-amber-200',
  };

  const getDaysUntilExpiration = (dateString: string | null) => {
    if (!dateString) return null;
    const expiration = new Date(dateString);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysUntilExpiration = getDaysUntilExpiration(offerData.expiration_date);
  const usagePercentage = offerData.max_usage 
    ? Math.round((offerData.usage_count || 0) / offerData.max_usage * 100)
    : 0;

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/student/offers"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
      >
        ← Back to Tool Discounts
      </Link>

      <div className="bg-white border rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{categoryIcons[offerData.category] || '🛠️'}</span>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{offerData.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{offerData.provider}</p>
            </div>
          </div>
          {offerData.is_recommended && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
              ⭐ Recommended
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Overview</h2>
          <p className="text-sm text-gray-600">{offerData.description}</p>
        </div>

        {/* Discount Information */}
        <div className={`mb-6 p-4 rounded-lg border ${categoryColors[offerData.category] || 'bg-gray-50 border-gray-200'}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Discount Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Benefit</p>
              <p className="text-lg font-semibold text-green-700">{offerData.discount_text}</p>
            </div>
            {offerData.original_price && offerData.discounted_price && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 line-through">{offerData.original_price}</span>
                <span className="text-sm font-semibold text-green-700">{offerData.discounted_price}</span>
              </div>
            )}
            {offerData.discount_code && (
              <OfferDetailClient discountCode={offerData.discount_code} />
            )}
            {offerData.eligibility && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Eligibility</p>
                <p className="text-sm text-gray-600">{offerData.eligibility}</p>
              </div>
            )}
          </div>
        </div>

        {/* How It Helps */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">How It Helps AI Projects</h2>
          <p className="text-sm text-gray-600 mb-3">
            This tool is commonly used by students to build, deploy, and monitor AI-powered applications.
            It integrates seamlessly with modern development workflows and helps reduce infrastructure costs.
          </p>
          {offerData.recommended_for_courses && offerData.recommended_for_courses.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs font-medium text-blue-800 mb-1">Used in:</p>
              <p className="text-xs text-blue-700">
                {offerData.recommended_for_courses.map((slug, idx) => (
                  <span key={slug}>
                    {slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    {idx < offerData.recommended_for_courses!.length - 1 && ', '}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        {offerData.features && offerData.features.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h2>
            <ul className="space-y-2">
              {offerData.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Redemption Steps */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">How to Redeem</h2>
          <ol className="space-y-2 list-decimal list-inside text-sm text-gray-600">
            {offerData.discount_code ? (
              <>
                <li>Copy the discount code above</li>
                <li>Click the "Claim Offer" button below to visit the provider's website</li>
                <li>Apply the code during checkout or signup</li>
              </>
            ) : (
              <>
                <li>Click the "Claim Offer" button below</li>
                <li>Follow the provider's signup or checkout process</li>
                <li>The discount will be applied automatically if eligible</li>
              </>
            )}
          </ol>
        </div>

        {/* Expiration & Usage Info */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="space-y-3">
            {daysUntilExpiration !== null && daysUntilExpiration > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expires in:</span>
                <span className={`text-sm font-medium ${
                  daysUntilExpiration <= 7 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {offerData.max_usage && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-gray-900">
                    {offerData.max_usage - (offerData.usage_count || 0)} remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-light h-2 rounded-full transition-all"
                    style={{ width: `${100 - usagePercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-6 border-t border-gray-200">
          {offerData.external_url ? (
            <a
              href={offerData.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-light text-white rounded-md hover:bg-brand-light/90 transition-colors font-medium"
            >
              Claim Offer →
            </a>
          ) : (
            <Link
              href="/student/offers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-light text-white rounded-md hover:bg-brand-light/90 transition-colors font-medium"
            >
              Back to Offers
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
