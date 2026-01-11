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
}

export function SubscriptionPageContent({ subscriptionData, userEmail }: SubscriptionPageContentProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showComparePlansModal, setShowComparePlansModal] = useState(false);
  const [subscription, setSubscription] = useState(subscriptionData);
  const [paymentError, setPaymentError] = useState<'failed_payment' | 'expired_card' | 'trial_ending_soon' | null>(null);

  // Check for payment errors (this would come from the API in production)
  // For now, we'll check if there's a payment issue based on subscription status
  const checkPaymentErrors = () => {
    // TODO: Check actual payment status from API
    // This is a placeholder - in production, this would come from the subscription data
    if (subscription.plan.status === 'trial' && subscription.plan.trialDaysRemaining && subscription.plan.trialDaysRemaining <= 7) {
      return 'trial_ending_soon';
    }
    // Add other error checks here
    return null;
  };

  const currentPaymentError = paymentError || checkPaymentErrors();

  const handleCancelSubscription = async (reason?: string) => {
    // TODO: Implement cancellation API call
    console.log('Canceling subscription', reason);
    setSubscription({
      ...subscription,
      plan: { ...subscription.plan, status: 'canceled' },
    });
    setShowCancelModal(false);
  };

  const handleChangePlan = async (newPlanTier: string) => {
    // TODO: Implement plan change API call
    console.log('Changing plan to', newPlanTier);
    const newPlan = subscription.availablePlans.find((p) => p.tier === newPlanTier);
    if (newPlan) {
      setSubscription({
        ...subscription,
        plan: {
          ...subscription.plan,
          name: newPlan.name,
          tier: newPlan.tier,
          price: newPlan.price,
        },
      });
    }
    setShowChangePlanModal(false);
  };

  const handleUpdatePayment = () => {
    // TODO: Open payment method update modal/page
    console.log('Update payment method');
  };

  return (
    <div className="space-y-8 authenticated-app">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your plan and billing</p>
      </div>

      {/* Payment Error Banner */}
      {currentPaymentError && (
        <PaymentErrorBanner
          errorType={currentPaymentError}
          onDismiss={() => setPaymentError(null)}
          onUpdatePayment={handleUpdatePayment}
          trialDaysRemaining={subscription.plan.trialDaysRemaining || undefined}
        />
      )}

      {/* Plan Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan</h2>
          <CurrentPlanCard
            plan={subscription.plan}
            onUpgrade={() => setShowChangePlanModal(true)}
            onManagePlan={() => setShowChangePlanModal(true)}
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
      {showCancelModal && (
        <CancelSubscriptionModal
          onConfirm={handleCancelSubscription}
          onClose={() => setShowCancelModal(false)}
          renewalDate={subscription.plan.renewalDate}
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
          currentPlanTier={subscription.plan.tier}
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
