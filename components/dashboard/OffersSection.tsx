import Link from 'next/link';
import { createUserSupabaseClient } from '@/lib/supabase/server';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_text: string;
  discount_value: number | null;
  category: 'api' | 'hosting' | 'monitoring' | 'data' | 'tools' | 'services';
  recommended_for_courses: string[] | null;
  expiration_date: string | null;
  usage_count: number;
  max_usage: number | null;
  provider: string;
  original_price: string | null;
  discounted_price: string | null;
  features: string[] | null;
  is_recommended: boolean;
}

interface OffersSectionProps {
  studentProfileId: string | null;
  enrolledCourseSlugs: string[];
}

export async function OffersSection({ studentProfileId, enrolledCourseSlugs }: OffersSectionProps) {
  const supabase = await createUserSupabaseClient();

  // Fetch active offers
  const { data: offers, error } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .order('is_recommended', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(4);

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

  // Show up to 4 offers, prioritizing recommended ones
  const displayOffers = [
    ...recommendedOffers.slice(0, 4),
    ...otherOffers.slice(0, 4 - recommendedOffers.length)
  ].slice(0, 4);

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

  // Don't show section if no offers
  if (displayOffers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tool Discounts</h2>
          <p className="text-xs text-gray-500 mt-1">Exclusive tools to help you build and ship faster</p>
        </div>
        <Link
          href="/student/offers"
          className="text-xs font-medium text-brand-light hover:text-brand-light/90"
        >
          View All →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayOffers.map((offer) => {
          const daysUntilExpiration = getDaysUntilExpiration(offer.expiration_date);
          const isRecommended = offer.is_recommended || 
            (offer.recommended_for_courses && 
             offer.recommended_for_courses.some(slug => enrolledCourseSlugs.includes(slug)));
          const usagePercentage = offer.max_usage 
            ? Math.round((offer.usage_count || 0) / offer.max_usage * 100)
            : 0;

          return (
            <div
              key={offer.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-lg transition-all ${
                isRecommended ? categoryColors[offer.category] : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{categoryIcons[offer.category]}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{offer.title}</h3>
                    <p className="text-xs text-gray-500">{offer.provider}</p>
                  </div>
                </div>
                {isRecommended && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    ⭐ Recommended
                  </span>
                )}
              </div>
              
              {/* Description */}
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
              
              {/* Discount Badge */}
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-green-800">{offer.discount_text}</span>
                  {offer.discount_value && offer.discount_value >= 50 && (
                    <span className="text-xs font-bold text-green-600">🔥 Hot Deal</span>
                  )}
                </div>
                {offer.original_price && offer.discounted_price && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 line-through">{offer.original_price}</span>
                    <span className="text-xs font-semibold text-green-700">{offer.discounted_price}</span>
                  </div>
                )}
              </div>

              {/* Features */}
              {offer.features && offer.features.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Includes:</p>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {offer.features.slice(0, 2).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-600">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {offer.features.length > 2 && (
                      <li className="text-gray-400">+{offer.features.length - 2} more</li>
                    )}
                  </ul>
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
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <Link
                  href={`/student/offers/${offer.id}`}
                  className="text-xs font-medium text-brand-light hover:text-brand-light/90"
                >
                  Claim Offer →
                </Link>
                {isRecommended && (
                  <span className="text-xs text-blue-600">For your project</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
