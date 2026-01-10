'use client';

import { useState } from 'react';

interface Plan {
  name: string;
  tier: string;
  status: string;
  billingCycle: 'monthly' | 'annual';
  price: number;
  currency: string;
  renewalDate: string;
}

interface AvailablePlan {
  name: string;
  tier: string;
  price: number;
  billingCycle: string;
}

interface ChangePlanModalProps {
  currentPlan: Plan;
  availablePlans: AvailablePlan[];
  onConfirm: (newPlanTier: string) => void;
  onClose: () => void;
}

export function ChangePlanModal({
  currentPlan,
  availablePlans,
  onConfirm,
  onClose,
}: ChangePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const otherPlans = availablePlans.filter((p) => p.tier !== currentPlan.tier);
  const selectedPlanData = availablePlans.find((p) => p.tier === selectedPlan);

  const calculatePriceDifference = () => {
    if (!selectedPlanData) return 0;
    return selectedPlanData.price - currentPlan.price;
  };

  const priceDiff = calculatePriceDifference();

  if (!showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-900">Change Plan</h2>
          <p className="text-sm text-gray-600">Select a new plan for your subscription.</p>
          <div className="space-y-2">
            {otherPlans.map((plan) => (
              <label
                key={plan.tier}
                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedPlan === plan.tier
                    ? 'border-brand-light bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="plan"
                    value={plan.tier}
                    checked={selectedPlan === plan.tier}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="text-brand-light"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(plan.price)}/{plan.billingCycle}
                    </div>
                  </div>
                </div>
                {priceDiff !== 0 && selectedPlan === plan.tier && (
                  <div className="text-sm font-medium text-gray-700">
                    {priceDiff > 0 ? '+' : ''}
                    {formatCurrency(priceDiff)}/{plan.billingCycle}
                  </div>
                )}
              </label>
            ))}
          </div>
          {selectedPlan && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>Proration:</strong> You'll be charged a prorated amount based on the
                remaining time in your billing cycle. The difference will be applied immediately.
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedPlan && setShowConfirmation(true)}
              disabled={!selectedPlan}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedPlan
                  ? 'bg-brand-light text-white hover:opacity-90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Confirm Plan Change</h2>
        {selectedPlanData && (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Plan:</span>
                <span className="font-medium text-gray-900">
                  {currentPlan.name} ({formatCurrency(currentPlan.price)}/{currentPlan.billingCycle})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Plan:</span>
                <span className="font-medium text-gray-900">
                  {selectedPlanData.name} ({formatCurrency(selectedPlanData.price)}/
                  {selectedPlanData.billingCycle})
                </span>
              </div>
              {priceDiff !== 0 && (
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Price Difference:</span>
                  <span className={`font-medium ${priceDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {priceDiff > 0 ? '+' : ''}
                    {formatCurrency(priceDiff)}/{selectedPlanData.billingCycle}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Your plan will change immediately. {priceDiff > 0 ? 'You will be charged' : 'You will receive a credit of'}{' '}
              {formatCurrency(Math.abs(priceDiff))} prorated for the remainder of your billing cycle.
            </p>
          </div>
        )}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setShowConfirmation(false)}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => selectedPlan && onConfirm(selectedPlan)}
            className="flex-1 px-4 py-2 bg-brand-light text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}
