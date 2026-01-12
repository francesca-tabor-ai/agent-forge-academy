'use client';

import { useState } from 'react';

interface Plan {
  name: string;
  tier: string;
  price: number;
  billingCycle: string;
  features?: string[];
  isPopular?: boolean;
}

interface ComparePlansModalProps {
  currentPlanTier: string;
  availablePlans: Plan[];
  onClose: () => void;
  onSelectPlan?: (tier: string) => void;
}

/**
 * Generate plan features from plan data
 * Falls back to default features if plan data not available
 */
function getPlanFeatures(plan: Plan | null): string[] {
  if (!plan) return [];
  
  // Try to get features from plan.features if available
  // This would need to be passed from availablePlans
  // For now, generate from tier name as fallback
  const features: string[] = [];
  
  // This is a fallback - ideally features would come from plan.features JSON
  // In production, features should be passed from subscription data
  return features;
}

export function ComparePlansModal({
  currentPlanTier,
  availablePlans,
  onClose,
  onSelectPlan,
}: ComparePlansModalProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get tiers from available plans (dynamic, not hard-coded)
  const allTiers = Array.from(new Set(availablePlans.map(p => p.tier)));
  // Generate feature list from available plans
  // In production, this should come from plan.features JSON
  const allFeatures = [
    'Course access',
    'Projects',
    'Portfolios',
    'Job opportunities',
    'AI Advisor',
    'Tool discounts',
  ];

  // Build planFeatures object from availablePlans
  const planFeatures: Record<string, string[]> = {};
  availablePlans.forEach(plan => {
    planFeatures[plan.tier] = plan.features || [];
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Compare Plans</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-700">Features</th>
                  {availablePlans.map((plan) => (
                    <th key={plan.tier} className="text-center p-3 min-w-[150px]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg font-semibold text-gray-900">{plan.name}</span>
                          {plan.isPopular && (
                            <span className="px-2 py-0.5 bg-brand-light text-white text-xs font-medium rounded-full">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(plan.price)}/{plan.billingCycle}
                        </div>
                        {plan.tier === currentPlanTier && (
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Current Plan
                          </span>
                        )}
                        {plan.tier !== currentPlanTier && onSelectPlan && (
                          <button
                            onClick={() => {
                              setSelectedTier(plan.tier);
                              onSelectPlan(plan.tier);
                            }}
                            className="w-full px-3 py-1.5 bg-brand-light text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                          >
                            {plan.tier === 'career' || (currentPlanTier === 'starter' && plan.tier === 'pro')
                              ? 'Upgrade'
                              : 'Switch'}
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allFeatures.map((feature) => (
                  <tr key={feature}>
                    <td className="p-3 text-sm font-medium text-gray-900">{feature}</td>
                    {availablePlans.map((plan) => {
                      const planFeatureList = planFeatures[plan.tier] || [];
                      const featureMatch = planFeatureList.find((f) => f.startsWith(feature));
                      const hasFeature = featureMatch && !featureMatch.includes('❌');
                      const isHighlight = plan.tier === currentPlanTier;

                      return (
                        <td
                          key={`${plan.tier}-${feature}`}
                          className={`p-3 text-center text-sm ${
                            isHighlight ? 'bg-blue-50' : ''
                          }`}
                        >
                          {featureMatch ? (
                            <span className={hasFeature ? 'text-green-600' : 'text-gray-400'}>
                              {hasFeature ? '✔' : '❌'}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
