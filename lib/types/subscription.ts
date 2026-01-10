export interface SubscriptionData {
  plan: {
    name: string;
    tier: string;
    status: 'active' | 'trial' | 'paused' | 'canceled';
    billingCycle: 'monthly' | 'annual';
    price: number;
    currency: string;
    renewalDate: string;
    trialEndDate: string | null;
    trialDaysRemaining: number | null;
  };
  benefits: {
    courseAccess: string;
    projectLimit: number;
    portfolioLimit: number;
    jobOpportunitiesAccess: boolean;
    aiAdvisorUsage: string;
    toolDiscountEligibility: boolean;
  };
  billing: {
    paymentMethod: {
      type: string;
      brand: string;
      last4: string;
      expiryMonth: number;
      expiryYear: number;
    };
    billingEmail: string;
    nextInvoiceAmount: number;
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    url: string;
  }>;
  availablePlans: Array<{
    name: string;
    tier: string;
    price: number;
    billingCycle: string;
  }>;
}
