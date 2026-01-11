/**
 * Subscription Access Error Messages
 * 
 * Centralized error messages for subscription-based access control.
 * Ensures consistent messaging across the application.
 */

export interface AccessErrorDetails {
  message: string;
  status: number;
  actionRequired?: string;
  redirectTo?: string;
  retryAfter?: number;
}

/**
 * Error messages for subscription access scenarios
 */
export const SUBSCRIPTION_ERROR_MESSAGES = {
  // No Subscription
  NO_SUBSCRIPTION: {
    message: 'A subscription is required to access this course. Please choose a subscription plan to get started.',
    status: 403,
    actionRequired: 'subscribe',
    redirectTo: '/student/subscription',
  },

  // Expired Subscription
  EXPIRED_SUBSCRIPTION: {
    message: 'Your subscription has expired. Please renew your subscription to continue accessing courses.',
    status: 403,
    actionRequired: 'renew',
    redirectTo: '/student/subscription',
  },

  // Payment Failures
  PAYMENT_FAILED: {
    message: 'Your payment failed. Please update your payment method to avoid losing access.',
    status: 403,
    actionRequired: 'update_payment',
    redirectTo: '/student/subscription',
  },

  PAYMENT_FAILED_GRACE_PERIOD: {
    message: (daysRemaining: number) =>
      `Your payment failed. Please update your payment method. You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} before access is suspended.`,
    status: 200, // Still has access during grace period
    actionRequired: 'update_payment',
    redirectTo: '/student/subscription',
  },

  // Subscription Status
  PAUSED_SUBSCRIPTION: {
    message: 'Your subscription is paused. Please resume your subscription to access courses.',
    status: 403,
    actionRequired: 'resume',
    redirectTo: '/student/subscription',
  },

  CANCELED_SUBSCRIPTION: {
    message: 'Your subscription has been canceled. Access is no longer available.',
    status: 403,
    actionRequired: 'reactivate',
    redirectTo: '/student/subscription',
  },

  CANCELED_SUBSCRIPTION_GRACE_PERIOD: {
    message: (endDate: string) =>
      `Your subscription has been canceled. You'll continue to have access until ${endDate}. After that, access will be restricted.`,
    status: 200, // Still has access during grace period
    actionRequired: 'reactivate',
    redirectTo: '/student/subscription',
  },

  TRIAL_EXPIRED: {
    message: 'Your trial has expired. Please subscribe to continue accessing courses.',
    status: 403,
    actionRequired: 'subscribe',
    redirectTo: '/student/subscription',
  },

  TRIAL_ENDING_SOON: {
    message: (daysRemaining: number) =>
      `Your trial ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Add a payment method to continue your subscription and avoid interruption.`,
    status: 200, // Still has access
    actionRequired: 'add_payment_method',
    redirectTo: '/student/subscription',
  },

  // Insufficient Tier
  INSUFFICIENT_TIER: {
    message: 'This course requires Professional Access. Please upgrade your subscription to access this course.',
    status: 403,
    actionRequired: 'upgrade',
    redirectTo: '/student/subscription',
  },

  // Course Issues
  COURSE_NOT_FOUND: {
    message: "The course you're looking for doesn't exist or has been removed. Please browse our available courses.",
    status: 404,
    redirectTo: '/student/courses',
  },

  COURSE_UNPUBLISHED: {
    message: 'This course is no longer available.',
    status: 403,
    redirectTo: '/student/courses',
  },

  COURSE_RENAMED: {
    message: 'This course has been moved. Redirecting you to the updated course...',
    status: 301, // Redirect
    redirectTo: undefined, // Will be set dynamically
  },

  // System Errors
  DATABASE_ERROR: {
    message: "We're experiencing technical difficulties. Please try again in a few moments.",
    status: 503,
    retryAfter: 60,
  },

  CONFIGURATION_ERROR: {
    message: 'A configuration error occurred. Our team has been notified. Please try again later.',
    status: 500,
  },

  UNEXPECTED_ERROR: {
    message: 'An unexpected error occurred. Please try again later.',
    status: 500,
  },
} as const;

/**
 * Gets error message for subscription status
 */
export function getSubscriptionStatusError(
  status: 'active' | 'trial' | 'paused' | 'canceled' | 'expired',
  periodEnd?: Date,
  trialEnd?: Date
): AccessErrorDetails | null {
  const now = new Date();

  switch (status) {
    case 'expired':
      return SUBSCRIPTION_ERROR_MESSAGES.EXPIRED_SUBSCRIPTION;

    case 'paused':
      return SUBSCRIPTION_ERROR_MESSAGES.PAUSED_SUBSCRIPTION;

    case 'canceled':
      if (periodEnd && periodEnd > now) {
        // Still in grace period
        return {
          ...SUBSCRIPTION_ERROR_MESSAGES.CANCELED_SUBSCRIPTION_GRACE_PERIOD,
          message: SUBSCRIPTION_ERROR_MESSAGES.CANCELED_SUBSCRIPTION_GRACE_PERIOD.message(
            periodEnd.toLocaleDateString()
          ),
        };
      }
      return SUBSCRIPTION_ERROR_MESSAGES.CANCELED_SUBSCRIPTION;

    case 'trial':
      if (trialEnd && trialEnd <= now) {
        return SUBSCRIPTION_ERROR_MESSAGES.TRIAL_EXPIRED;
      }
      if (trialEnd) {
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 7) {
          return {
            ...SUBSCRIPTION_ERROR_MESSAGES.TRIAL_ENDING_SOON,
            message: SUBSCRIPTION_ERROR_MESSAGES.TRIAL_ENDING_SOON.message(daysRemaining),
          };
        }
      }
      return null; // Trial active, no error

    case 'active':
      return null; // Active, no error

    default:
      return SUBSCRIPTION_ERROR_MESSAGES.UNEXPECTED_ERROR;
  }
}

/**
 * Gets error message for expired subscription period
 */
export function getExpiredPeriodError(periodEnd: Date): AccessErrorDetails {
  return SUBSCRIPTION_ERROR_MESSAGES.EXPIRED_SUBSCRIPTION;
}

/**
 * Gets error message for payment failure
 */
export function getPaymentFailureError(gracePeriodEnd?: Date): AccessErrorDetails {
  if (gracePeriodEnd) {
    const now = new Date();
    if (gracePeriodEnd > now) {
      const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...SUBSCRIPTION_ERROR_MESSAGES.PAYMENT_FAILED_GRACE_PERIOD,
        message: SUBSCRIPTION_ERROR_MESSAGES.PAYMENT_FAILED_GRACE_PERIOD.message(daysRemaining),
      };
    }
  }
  return SUBSCRIPTION_ERROR_MESSAGES.PAYMENT_FAILED;
}

/**
 * Gets error message for insufficient tier
 */
export function getInsufficientTierError(): AccessErrorDetails {
  return SUBSCRIPTION_ERROR_MESSAGES.INSUFFICIENT_TIER;
}

/**
 * Gets error message for course not found
 */
export function getCourseNotFoundError(): AccessErrorDetails {
  return SUBSCRIPTION_ERROR_MESSAGES.COURSE_NOT_FOUND;
}

/**
 * Gets error message for unpublished course
 */
export function getCourseUnpublishedError(): AccessErrorDetails {
  return SUBSCRIPTION_ERROR_MESSAGES.COURSE_UNPUBLISHED;
}
