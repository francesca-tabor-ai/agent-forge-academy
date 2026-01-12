'use client';

import { SubscriptionPageContent } from './SubscriptionPageContent';
import type { SubscriptionPageData } from '@/lib/subscription/getSubscriptionData';
import type { SubscriptionData } from '@/lib/types/subscription';

interface SubscriptionPageProps {
  subscriptionData: SubscriptionPageData;
  userEmail: string;
  showSuccess?: boolean;
  showCanceled?: boolean;
}

/**
 * Extract numeric value from formatted currency string
 */
function parseCurrencyAmount(formatted: string): number {
  // Remove currency symbols and parse
  const cleaned = formatted.replace(/[£$€,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Extract currency code from formatted string
 */
function extractCurrencyCode(formatted: string): string {
  if (formatted.includes('£')) return 'GBP';
  if (formatted.includes('$')) return 'USD';
  if (formatted.includes('€')) return 'EUR';
  return 'GBP'; // Default
}

/**
 * Convert SubscriptionPageData to SubscriptionData format for compatibility
 */
function convertToSubscriptionData(
  data: SubscriptionPageData,
  userEmail: string
): SubscriptionData {
  return {
    plan: data.plan ? {
      name: data.plan.name,
      tier: data.plan.code,
      status: data.plan.status,
      billingCycle: data.plan.interval === 'year' ? 'annual' : 'monthly',
      price: parseCurrencyAmount(data.plan.price),
      currency: extractCurrencyCode(data.plan.price),
      renewalDate: data.plan.renewsOn ? new Date(data.plan.renewsOn).toISOString().split('T')[0] : '',
      trialEndDate: null,
      trialDaysRemaining: null,
      description: data.plan.description || undefined,
    } : null,
    benefits: data.plan?.features ? {
      courseAccess: data.plan.features.courseAccess || 'All courses',
      projectLimit: data.plan.features.projectLimit || 5,
      portfolioLimit: data.plan.features.portfolioLimit || 1,
      jobOpportunitiesAccess: data.plan.features.jobAccess !== false,
      aiAdvisorUsage: data.plan.features.aiAdvisorUsage || 'Unlimited',
      toolDiscountEligibility: data.plan.features.toolDiscounts === true,
    } : {
      courseAccess: 'No access',
      projectLimit: 0,
      portfolioLimit: 0,
      jobOpportunitiesAccess: false,
      aiAdvisorUsage: 'None',
      toolDiscountEligibility: false,
    },
    billing: {
      paymentMethod: data.billing.brand ? {
        type: 'card',
        brand: data.billing.brand,
        last4: data.billing.last4 || '****',
        expiryMonth: data.billing.expMonth || 0,
        expiryYear: data.billing.expYear || 0,
      } : null,
      billingEmail: data.billing.billingEmail,
      nextInvoiceAmount: data.nextInvoice ? parseCurrencyAmount(data.nextInvoice.amount) : null,
      nextInvoiceDate: data.nextInvoice?.invoiceDate || null,
    },
    invoices: data.invoices.map(inv => ({
      id: inv.invoiceNumber,
      date: new Date(inv.invoiceDate).toISOString().split('T')[0],
      amount: parseCurrencyAmount(inv.amount),
      status: inv.status,
      url: inv.downloadUrl || '#',
      downloadUrl: inv.downloadUrl || undefined,
    })),
    availablePlans: data.availablePlans.map(plan => ({
      name: plan.name,
      tier: plan.tier,
      price: parseCurrencyAmount(plan.price),
      billingCycle: plan.billingCycle,
      features: plan.features ? Object.keys(plan.features) : undefined,
      isPopular: plan.isPopular,
    })),
  };
}

export function SubscriptionPage({ subscriptionData, userEmail, showSuccess, showCanceled }: SubscriptionPageProps) {
  // Convert to SubscriptionData format for compatibility with existing components
  const convertedData = convertToSubscriptionData(subscriptionData, userEmail);

  return (
    <SubscriptionPageContent 
      subscriptionData={convertedData} 
      userEmail={userEmail}
      showSuccess={showSuccess}
      showCanceled={showCanceled}
    />
  );
}
