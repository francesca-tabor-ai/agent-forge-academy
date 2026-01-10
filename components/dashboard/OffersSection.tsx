import Link from 'next/link';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  category: 'api' | 'hosting' | 'monitoring';
  recommendedFor?: string;
}

export function OffersSection() {
  // Mock offers - in production, these would come from a database
  const offers: Offer[] = [
    {
      id: '1',
      title: 'Supabase Pro',
      description: 'Database and hosting for your projects',
      discount: '20% off first 3 months',
      category: 'hosting',
      recommendedFor: 'vibe-coding-cursor-supabase',
    },
    {
      id: '2',
      title: 'OpenAI API Credits',
      description: 'Additional API credits for development',
      discount: '15% bonus credits',
      category: 'api',
    },
    {
      id: '3',
      title: 'Sentry Monitoring',
      description: 'Error tracking and performance monitoring',
      discount: 'Free tier upgrade',
      category: 'monitoring',
    },
  ];

  const categoryIcons: Record<string, string> = {
    api: '🔌',
    hosting: '☁️',
    monitoring: '📊',
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Tool Discounts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-light transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryIcons[offer.category]}</span>
                <h3 className="text-sm font-semibold text-gray-900">{offer.title}</h3>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">{offer.description}</p>
            
            {offer.recommendedFor && (
              <div className="mb-2">
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  Recommended for your current project
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">{offer.discount}</span>
              <Link
                href={`/student/offers/${offer.id}`}
                className="text-xs font-medium text-brand-light hover:text-brand-light/90"
              >
                Claim →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
