'use client';

interface Plan {
  name: string;
  tier: string;
  status: 'active' | 'trial' | 'paused' | 'canceled';
  billingCycle: 'monthly' | 'annual';
  price: number;
  currency: string;
  renewalDate: string | null;
  trialEndDate: string | null;
  trialDaysRemaining: number | null;
  valueSummary?: string;
}

interface AvailablePlan {
  name: string;
  tier: string;
  price: number;
  billingCycle: string;
}

interface Usage {
  projectsUsed: number;
  portfoliosUsed: number;
  aiAdvisorUsed?: number;
  jobsApplied?: number;
}

interface Benefits {
  projectLimit: number;
  portfolioLimit: number;
  toolDiscountEligibility: boolean;
}

interface CurrentPlanCardProps {
  plan: Plan;
  onUpgrade: () => void;
  onManagePlan: () => void;
  onCancel: () => void;
  availablePlans: AvailablePlan[];
  usage?: Usage;
  benefits?: Benefits;
}

export function CurrentPlanCard({
  plan,
  onUpgrade,
  onManagePlan,
  onCancel,
  availablePlans,
  usage,
  benefits,
}: CurrentPlanCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // Format: "D MMMM YYYY" (e.g., "15 February 2024")
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = () => {
    switch (plan.status) {
      case 'active':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Active
          </span>
        );
      case 'trial':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Trial ({plan.trialDaysRemaining} days remaining)
          </span>
        );
      case 'paused':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            Paused
          </span>
        );
      case 'canceled':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            Canceled
          </span>
        );
      default:
        return null;
    }
  };

  const hasHigherTier = () => {
    // Check if there are any plans with higher tier than current
    // This should ideally come from availablePlans, but for now we check if current tier is not the highest
    // In a real implementation, this would compare plan prices or tier levels from availablePlans
    return availablePlans.some((p) => {
      // Simple check: if there are plans with different tier, assume upgrade is possible
      // This is a fallback - ideally tier hierarchy would come from plan data
      return p.tier !== plan.tier;
    });
  };

  const getNextBillingDate = () => {
    if (plan.status === 'trial' && plan.trialEndDate) {
      return formatDate(plan.trialEndDate);
    }
    return plan.renewalDate ? formatDate(plan.renewalDate) : 'N/A';
  };

  const getValueSummary = () => {
    // Use plan description if available, otherwise use valueSummary, otherwise generic message
    // Note: plan.description comes from subscription_tier_config or subscription_plans
    return plan.valueSummary || 'Your current subscription plan.';
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 card-interactive">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>

      <div className="space-y-4">
        {/* Plan Details */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              {getStatusBadge()}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                {formatCurrency(plan.price, plan.currency)}/{plan.billingCycle}
              </p>
              <p className="text-xs text-gray-500">
                {plan.status === 'trial' ? 'Trial ends' : 'Renews'} on {getNextBillingDate()}
              </p>
            </div>
            {/* Value Summary */}
            <p className="text-sm text-gray-700 mt-3 italic">{getValueSummary()}</p>
          </div>
        </div>

        {/* Usage Indicators */}
        {usage && benefits && (
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Usage</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Projects</span>
                <span className={`text-sm font-medium ${getUsageColor(usage.projectsUsed, benefits.projectLimit)}`}>
                  {usage.projectsUsed} / {benefits.projectLimit} used
                </span>
              </div>
              {usage.projectsUsed > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      getUsagePercentage(usage.projectsUsed, benefits.projectLimit) >= 90
                        ? 'bg-red-500'
                        : getUsagePercentage(usage.projectsUsed, benefits.projectLimit) >= 70
                          ? 'bg-yellow-500'
                          : 'bg-brand-light'
                    }`}
                    style={{
                      width: `${getUsagePercentage(usage.projectsUsed, benefits.projectLimit)}%`,
                    }}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Portfolios</span>
                <span className={`text-sm font-medium ${getUsageColor(usage.portfoliosUsed, benefits.portfolioLimit)}`}>
                  {usage.portfoliosUsed} / {benefits.portfolioLimit} used
                </span>
              </div>
              {usage.portfoliosUsed > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      getUsagePercentage(usage.portfoliosUsed, benefits.portfolioLimit) >= 90
                        ? 'bg-red-500'
                        : getUsagePercentage(usage.portfoliosUsed, benefits.portfolioLimit) >= 70
                          ? 'bg-yellow-500'
                          : 'bg-brand-light'
                    }`}
                    style={{
                      width: `${getUsagePercentage(usage.portfoliosUsed, benefits.portfolioLimit)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Missing Features Highlight */}
        {benefits && !benefits.toolDiscountEligibility && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-red-500">❌</span>
              <span>Tool discounts: Not included</span>
              <span className="text-gray-500">(available on Pro)</span>
            </div>
          </div>
        )}

        {/* Primary Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          {hasHigherTier() && plan.status === 'active' && (
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-brand-light text-white text-sm font-medium rounded-lg hover:opacity-90 hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-200 ease-out"
            >
              Upgrade Plan
            </button>
          )}
          {plan.status === 'active' && (
            <button
              onClick={onManagePlan}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:scale-105 active:scale-95 hover:shadow-sm transition-all duration-200 ease-out"
            >
              Manage Plan
            </button>
          )}
          {plan.status === 'active' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
