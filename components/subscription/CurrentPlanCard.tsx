'use client';

interface Plan {
  name: string;
  tier: string;
  status: 'active' | 'trial' | 'paused' | 'canceled';
  billingCycle: 'monthly' | 'annual';
  price: number;
  currency: string;
  renewalDate: string;
  trialEndDate: string | null;
  trialDaysRemaining: number | null;
}

interface AvailablePlan {
  name: string;
  tier: string;
  price: number;
  billingCycle: string;
}

interface CurrentPlanCardProps {
  plan: Plan;
  onUpgrade: () => void;
  onChangePlan: () => void;
  onCancel: () => void;
  availablePlans: AvailablePlan[];
}

export function CurrentPlanCard({
  plan,
  onUpgrade,
  onChangePlan,
  onCancel,
  availablePlans,
}: CurrentPlanCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
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
    const tierOrder = ['starter', 'pro', 'career'];
    const currentIndex = tierOrder.indexOf(plan.tier);
    return currentIndex < tierOrder.length - 1;
  };

  const getNextBillingDate = () => {
    if (plan.status === 'trial' && plan.trialEndDate) {
      return formatDate(plan.trialEndDate);
    }
    return formatDate(plan.renewalDate);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>

      <div className="space-y-4">
        {/* Plan Details */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
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
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          {hasHigherTier() && plan.status === 'active' && (
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-brand-light text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
            >
              Upgrade Plan
            </button>
          )}
          {plan.status === 'active' && (
            <button
              onClick={onChangePlan}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Change Plan
            </button>
          )}
          {plan.status === 'active' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
