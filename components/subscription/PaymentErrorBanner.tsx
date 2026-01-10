'use client';

interface PaymentErrorBannerProps {
  errorType: 'failed_payment' | 'expired_card' | 'trial_ending_soon';
  onDismiss?: () => void;
  onUpdatePayment?: () => void;
  trialDaysRemaining?: number;
}

export function PaymentErrorBanner({
  errorType,
  onDismiss,
  onUpdatePayment,
  trialDaysRemaining,
}: PaymentErrorBannerProps) {
  const getErrorContent = () => {
    switch (errorType) {
      case 'failed_payment':
        return {
          title: 'Payment Failed',
          message: "We couldn't process your last payment. Please update your payment method to avoid interruption.",
          actionLabel: 'Update Payment Method',
          action: onUpdatePayment,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
        };
      case 'expired_card':
        return {
          title: 'Expired Payment Method',
          message: 'Your payment method has expired. Please update it to continue your subscription.',
          actionLabel: 'Update Payment Method',
          action: onUpdatePayment,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
        };
      case 'trial_ending_soon':
        return {
          title: 'Trial Ending Soon',
          message: `Your trial ends in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''}. Add a payment method to continue your subscription.`,
          actionLabel: 'Add Payment Method',
          action: onUpdatePayment,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
        };
      default:
        return null;
    }
  };

  const content = getErrorContent();
  if (!content) return null;

  return (
    <div
      className={`${content.bgColor} ${content.borderColor} border rounded-lg p-4 mb-6`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${content.textColor} mb-1`}>
            {content.title}
          </h3>
          <p className={`text-sm ${content.textColor} opacity-90`}>
            {content.message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-4 text-sm font-medium ${content.textColor} hover:opacity-80`}
          >
            Dismiss
          </button>
        )}
      </div>
      {content.action && (
        <div className="mt-3">
          <button
            onClick={content.action}
            className="px-4 py-2 bg-brand-light text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
          >
            {content.actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
