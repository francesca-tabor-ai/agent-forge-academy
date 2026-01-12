'use client';

import { useState } from 'react';
import { CurrentPlanCard } from './CurrentPlanCard';
import { PlanBenefits } from './PlanBenefits';
import { BillingInformation } from './BillingInformation';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';
import { ChangePlanModal } from './ChangePlanModal';
import { ComparePlansModal } from './ComparePlansModal';
import { PaymentErrorBanner } from './PaymentErrorBanner';
import { InvoicesList } from './InvoicesList';
import type { SubscriptionData } from '@/lib/types/subscription';

interface SubscriptionPageContentProps {
  subscriptionData: SubscriptionData;
  userEmail: string;
  showSuccess?: boolean;
  showCanceled?: boolean;
}

export function SubscriptionPageContent({ subscriptionData, userEmail, showSuccess, showCanceled }: SubscriptionPageContentProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showComparePlansModal, setShowComparePlansModal] = useState(false);
  const [subscription, setSubscription] = useState(subscriptionData);
  const [paymentError, setPaymentError] = useState<'failed_payment' | 'expired_card' | 'trial_ending_soon' | null>(null);

  // Check for payment errors (this would come from the API in production)
  // For now, we'll check if there's a payment issue based on subscription status
  const checkPaymentErrors = () => {
    if (!subscription.plan) return null;
    
    // Check actual payment status from API
    if (subscription.plan.status === 'trial' && subscription.plan.trialDaysRemaining && subscription.plan.trialDaysRemaining <= 7) {
      return 'trial_ending_soon';
    }
    // Add other error checks here
    return null;
  };

  const currentPaymentError = paymentError || checkPaymentErrors();

  const handleCancelSubscription = async (reason?: string) => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelImmediately: false, // Cancel at period end by default
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Revalidate and reload page to show updated data
      window.location.reload();
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      alert(err.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setShowCancelModal(false);
    }
  };

  const handleChangePlan = async (newPlanTier: string) => {
    try {
      // Find the plan by tier
      const newPlan = subscription.availablePlans.find((p) => p.tier === newPlanTier);
      if (!newPlan) {
        throw new Error('Plan not found');
      }

      // Get plan_id from subscription_plans table
      // For now, construct plan_id from tier and billingCycle
      const planId = `${newPlan.tier}_${newPlan.billingCycle}`;

      const response = await fetch('/api/subscription/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          proration_behavior: 'create_prorations',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription');
      }

      // Revalidate and reload page to show updated data
      window.location.reload();
    } catch (err: any) {
      console.error('Error changing plan:', err);
      alert(err.message || 'Failed to change plan. Please try again.');
    } finally {
      setShowChangePlanModal(false);
    }
  };

  const handleUpgradePlan = async () => {
    try {
      // Find a higher tier plan (for upgrade, we'll use checkout)
      const currentTier = subscription.plan?.tier;
      const higherPlans = subscription.availablePlans.filter((p) => {
        const tierOrder = ['essential', 'professional', 'pro'];
        const currentIndex = tierOrder.indexOf(currentTier || '');
        const planIndex = tierOrder.indexOf(p.tier);
        return planIndex > currentIndex;
      });

      if (higherPlans.length === 0) {
        // No higher tier, open change plan modal instead
        setShowChangePlanModal(true);
        return;
      }

      // Use the first higher tier plan
      const upgradePlan = higherPlans[0];
      const planId = `${upgradePlan.tier}_${upgradePlan.billingCycle}`;

      // Create checkout session for upgrade
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          successUrl: `${window.location.origin}/student/subscription?success=true`,
          cancelUrl: `${window.location.origin}/student/subscription?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.checkoutUrl) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Error upgrading plan:', err);
      alert(err.message || 'Failed to start upgrade. Please try again.');
    }
  };

  const handleUpdatePayment = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/student/subscription`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (!data.portalUrl) {
        throw new Error('No portal URL returned');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.portalUrl;
    } catch (err: any) {
      console.error('Error opening billing portal:', err);
      // Show error to user - could use a toast notification here
      alert(
        err.message === 'No active subscription found' || err.message === 'NO_STRIPE_CUSTOMER'
          ? 'No active subscription found. Please contact support.'
          : 'We couldn\'t open billing settings. Please try again.'
      );
    }
  };

  return (
    <div className="space-y-8 authenticated-app">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your plan and billing</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-green-800">
              Subscription updated successfully!
            </p>
          </div>
        </div>
      )}

      {/* Canceled Message */}
      {showCanceled && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium text-yellow-800">
              Checkout was canceled. No changes were made.
            </p>
          </div>
        </div>
      )}

      {/* Payment Error Banner */}
      {currentPaymentError && subscription.plan && (
        <PaymentErrorBanner
          errorType={currentPaymentError}
          onDismiss={() => setPaymentError(null)}
          onUpdatePayment={handleUpdatePayment}
          trialDaysRemaining={subscription.plan.trialDaysRemaining || undefined}
        />
      )}

      {/* Plan Section */}
      {subscription.plan ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan</h2>
          <CurrentPlanCard
            plan={subscription.plan}
            onUpgrade={handleUpgradePlan}
            onManagePlan={handleUpdatePayment}
            onCancel={() => setShowCancelModal(true)}
            availablePlans={subscription.availablePlans}
            usage={subscription.usage}
            benefits={subscription.benefits}
          />
          </div>

          <PlanBenefits
            benefits={subscription.benefits}
            usage={subscription.usage}
            onUpgrade={() => setShowChangePlanModal(true)}
            onComparePlans={() => setShowComparePlansModal(true)}
          />
        </div>
      ) : (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h2>
          <p className="text-sm text-gray-600 mb-4">
            You don't have an active subscription. Choose a plan to get started.
          </p>
          <button
            onClick={() => setShowChangePlanModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            View Plans
          </button>
        </div>
      )}

      {/* Billing Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing</h2>
          <BillingInformation
            billing={subscription.billing}
            invoices={subscription.invoices}
            userEmail={userEmail}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice History</h2>
          <InvoicesList invoices={subscription.invoices} />
        </div>
      </div>

      {/* Modals */}
      {showCancelModal && subscription.plan && (
        <CancelSubscriptionModal
          onConfirm={handleCancelSubscription}
          onClose={() => setShowCancelModal(false)}
          renewalDate={subscription.plan.renewalDate || ''}
          onDowngrade={() => {
            setShowCancelModal(false);
            setShowChangePlanModal(true);
          }}
        />
      )}

      {showChangePlanModal && (
        <ChangePlanModal
          currentPlan={subscription.plan}
          availablePlans={subscription.availablePlans}
          onConfirm={handleChangePlan}
          onClose={() => setShowChangePlanModal(false)}
        />
      )}

      {showComparePlansModal && (
        <ComparePlansModal
          currentPlanTier={subscription.plan?.tier || ''}
          availablePlans={subscription.availablePlans}
          onClose={() => setShowComparePlansModal(false)}
          onSelectPlan={(tier) => {
            setShowComparePlansModal(false);
            handleChangePlan(tier);
          }}
        />
      )}
    </div>
  );
}
