export interface SubscriptionPlan {
  name: string;
  tier: string;
  status: 'active' | 'trial' | 'paused' | 'canceled';
  billingCycle: 'monthly' | 'annual';
  price: number;
  currency: string;
  renewalDate: string | null;
  trialEndDate: string | null;
  trialDaysRemaining: number | null;
  description?: string | null;
  valueSummary?: string; // e.g., "Best for builders actively shipping AI projects"
}

export interface SubscriptionBenefits {
  courseAccess: string;
  projectLimit: number;
  portfolioLimit: number;
  jobOpportunitiesAccess: boolean;
  aiAdvisorUsage: string;
  toolDiscountEligibility: boolean;
}

export interface PaymentMethod {
  type: string;
  brand: string;
  last4: string;
  expiryMonth: number | null;
  expiryYear: number | null;
}

export interface BillingInfo {
  paymentMethod: PaymentMethod | null;
  billingEmail: string;
  nextInvoiceAmount: number | null;
  nextInvoiceDate: string | null;
  taxNote?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  url: string;
  downloadUrl?: string;
}

export interface AvailablePlan {
  name: string;
  tier: string;
  price: number;
  billingCycle: string;
  features?: string[];
  isPopular?: boolean;
}

export interface SubscriptionUsage {
  projectsUsed: number;
  portfoliosUsed: number;
  aiAdvisorUsed: number;
  jobsApplied: number;
}

export interface SubscriptionData {
  plan: SubscriptionPlan | null;
  usage?: SubscriptionUsage;
  benefits: SubscriptionBenefits;
  billing: BillingInfo;
  invoices: Invoice[];
  availablePlans: AvailablePlan[];
}
