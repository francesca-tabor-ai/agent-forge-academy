import Link from 'next/link';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  discountValue: number;
  category: 'api' | 'hosting' | 'monitoring' | 'tools' | 'services';
  recommendedFor?: string;
  expirationDate?: string;
  usageCount?: number;
  maxUsage?: number;
  provider: string;
  originalPrice?: string;
  discountedPrice?: string;
  features?: string[];
}

export function OffersSection() {
  // Mock offers - in production, these would come from a database
  const offers: Offer[] = [
    {
      id: '1',
      title: 'Supabase Pro',
      description: 'Database, authentication, and hosting for your projects. Perfect for building full-stack applications.',
      discount: '20% off first 3 months',
      discountValue: 20,
      category: 'hosting',
      recommendedFor: 'vibe-coding-cursor-supabase',
      expirationDate: '2024-03-31',
      usageCount: 45,
      maxUsage: 100,
      provider: 'Supabase',
      originalPrice: '$25/month',
      discountedPrice: '$20/month',
      features: ['Unlimited API requests', '500GB database', '50GB file storage', 'Priority support'],
    },
    {
      id: '2',
      title: 'OpenAI API Credits',
      description: 'Additional API credits for development and testing. Perfect for AI-powered projects.',
      discount: '15% bonus credits',
      discountValue: 15,
      category: 'api',
      expirationDate: '2024-04-30',
      usageCount: 12,
      maxUsage: 50,
      provider: 'OpenAI',
      originalPrice: '$100',
      discountedPrice: '$115 value',
      features: ['GPT-4 access', 'Whisper API', 'Embeddings API', 'DALL-E credits'],
    },
    {
      id: '3',
      title: 'Sentry Monitoring',
      description: 'Error tracking and performance monitoring for production applications.',
      discount: 'Free tier upgrade',
      discountValue: 100,
      category: 'monitoring',
      expirationDate: '2024-06-30',
      usageCount: 8,
      maxUsage: 25,
      provider: 'Sentry',
      originalPrice: '$26/month',
      discountedPrice: 'Free (3 months)',
      features: ['50K events/month', 'Performance monitoring', 'Release tracking', 'Team collaboration'],
    },
    {
      id: '4',
      title: 'Vercel Pro',
      description: 'Deploy and host your projects with zero configuration. Perfect for Next.js and React apps.',
      discount: '30% off first month',
      discountValue: 30,
      category: 'hosting',
      expirationDate: '2024-05-31',
      usageCount: 23,
      maxUsage: 75,
      provider: 'Vercel',
      originalPrice: '$20/month',
      discountedPrice: '$14/month',
      features: ['Unlimited deployments', '100GB bandwidth', 'Team collaboration', 'Analytics'],
    },
  ];

  const categoryIcons: Record<string, string> = {
    api: '🔌',
    hosting: '☁️',
    monitoring: '📊',
    tools: '🛠️',
    services: '⚙️',
  };

  const categoryColors: Record<string, string> = {
    api: 'bg-purple-50 border-purple-200',
    hosting: 'bg-blue-50 border-blue-200',
    monitoring: 'bg-green-50 border-green-200',
    tools: 'bg-orange-50 border-orange-200',
    services: 'bg-pink-50 border-pink-200',
  };

  const getDaysUntilExpiration = (dateString?: string) => {
    if (!dateString) return null;
    const expiration = new Date(dateString);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tool Discounts</h2>
          <p className="text-xs text-gray-500 mt-1">Exclusive offers for students</p>
        </div>
        <Link
          href="/student/offers"
          className="text-xs font-medium text-brand-light hover:text-brand-light/90"
        >
          View All →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {offers.map((offer) => {
          const daysUntilExpiration = getDaysUntilExpiration(offer.expirationDate);
          const isRecommended = !!offer.recommendedFor;
          const usagePercentage = offer.maxUsage 
            ? Math.round((offer.usageCount || 0) / offer.maxUsage * 100)
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
                  <span className="text-xs font-medium text-green-800">{offer.discount}</span>
                  {offer.discountValue >= 50 && (
                    <span className="text-xs font-bold text-green-600">🔥 Hot Deal</span>
                  )}
                </div>
                {offer.originalPrice && offer.discountedPrice && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 line-through">{offer.originalPrice}</span>
                    <span className="text-xs font-semibold text-green-700">{offer.discountedPrice}</span>
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
                {offer.maxUsage && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Available:</span>
                      <span className="font-medium text-gray-700">
                        {offer.maxUsage - (offer.usageCount || 0)} remaining
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

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <span className="font-medium">💡 Tip:</span> These offers are exclusive to students and may have limited availability. 
          Claim them while they last!
        </p>
      </div>
    </section>
  );
}
