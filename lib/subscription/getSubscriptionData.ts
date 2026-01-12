/**
 * Server-side data loader for subscription page
 * 
 * Fetches complete subscription data including:
 * - Current plan details
 * - Billing information (payment method)
 * - Next invoice
 * - Invoice history
 */

import 'server-only';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';
import { getUserStripeCustomerId } from '@/lib/utils/fetch-stripe-invoices';

/**
 * Subscription page data type
 */
export type SubscriptionPageData = {
  plan: {
    name: string;
    code: string;
    status: 'active' | 'trial' | 'paused' | 'canceled';
    price: string; // Formatted currency string (e.g., "£39.00")
    interval: 'month' | 'year';
    renewsOn: string | null; // ISO date string or null
    description: string | null;
    features: Record<string, any> | null; // JSON features object
  } | null;
  billing: {
    brand: string | null;
    last4: string | null;
    expMonth: number | null;
    expYear: number | null;
    billingEmail: string;
  };
  nextInvoice: {
    amount: string; // Formatted currency string
    currency: string;
    invoiceDate: string; // ISO date string
  } | null;
  invoices: Array<{
    invoiceDate: string; // ISO date string
    invoiceNumber: string;
    amount: string; // Formatted currency string
    currency: string;
    status: 'paid' | 'open' | 'void' | 'uncollectible' | 'draft';
    downloadUrl: string | null;
  }>;
  availablePlans: Array<{
    name: string;
    tier: string;
    price: string; // Formatted currency string
    billingCycle: string;
    features?: Record<string, any> | null;
    isPopular?: boolean;
  }>;
};

/**
 * Format amount in pennies to currency string
 */
function formatCurrency(amount: number, currency: string = 'GBP'): string {
  const currencySymbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  };

  const symbol = currencySymbols[currency.toUpperCase()] || currency.toUpperCase() + ' ';
  const amountInMainUnit = amount / 100; // Convert from pennies

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInMainUnit);
}

/**
 * Map subscription status to frontend format
 */
function mapSubscriptionStatus(
  status: string | null | undefined
): 'active' | 'trial' | 'paused' | 'canceled' {
  if (!status) return 'canceled';
  
  const statusLower = status.toLowerCase();
  if (statusLower === 'active' || statusLower === 'trialing') return 'active';
  if (statusLower === 'trial') return 'trial';
  if (statusLower === 'paused') return 'paused';
  if (statusLower === 'canceled' || statusLower === 'cancelled' || statusLower === 'expired') {
    return 'canceled';
  }
  
  return 'active'; // Default
}

/**
 * Normalize billing interval to 'month' | 'year'
 * Safely handles string values from database/API
 */
function normalizeInterval(value: unknown): 'month' | 'year' {
  if (value === 'month' || value === 'year') return value;
  // Default to 'month' for any other value
  return 'month';
}

/**
 * Get subscription data for the current authenticated user
 * 
 * @returns SubscriptionPageData or null if user not authenticated
 */
export async function getSubscriptionData(): Promise<SubscriptionPageData | null> {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Get user's email (for billing email)
    const userEmail = user.email || '';

    // Get billing email override from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, billing_email')
      .eq('user_id', user.id)
      .single();

    const billingEmail = profile?.billing_email || userEmail;

    // Fetch subscription - handle both old (student_profile_id) and new (user_id) structures
    let subscription = null;
    
    // Try new structure with user_id first
    const { data: subByUserId } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (subByUserId) {
      subscription = subByUserId;
    } else {
      // Fall back to old structure with student_profile_id
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', profile?.id || '')
        .single();

      if (studentProfile) {
        const { data: subByStudentProfile } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('student_profile_id', studentProfile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        subscription = subByStudentProfile;
      }
    }

    // Get Stripe customer ID
    const stripeCustomerId = await getUserStripeCustomerId(user.id);

    // If no subscription, return empty state
    if (!subscription) {
      const availablePlans = await getAvailablePlans(supabase);
      return {
        plan: null,
        billing: {
          brand: null,
          last4: null,
          expMonth: null,
          expYear: null,
          billingEmail,
        },
        nextInvoice: null,
        invoices: [],
        availablePlans,
      };
    }

    // Get plan details
    let planData: SubscriptionPageData['plan'] = null;
    
    if (subscription.plan_id) {
      // New structure with plan_id FK
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscription.plan_id)
        .single();

      if (plan) {
        const priceInPennies = plan.price_monthly || 0;
        const currency = plan.currency || 'GBP';

        planData = {
          name: String(plan.name ?? ''),
          code: String(plan.code ?? plan.id.split('_')[0]),
          status: mapSubscriptionStatus(subscription.status),
          price: formatCurrency(priceInPennies, currency),
          interval: normalizeInterval(plan.interval),
          renewsOn: subscription.current_period_end 
            ? new Date(subscription.current_period_end).toISOString()
            : null,
          description: plan.description ? String(plan.description) : null,
          features: (plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features))
            ? (plan.features as Record<string, unknown>)
            : null,
        };
      }
    } else if (subscription.tier) {
      // Old structure with tier enum - get from subscription_tier_config
      const { data: tierConfig } = await supabase
        .from('subscription_tier_config')
        .select('*')
        .eq('tier', subscription.tier)
        .single();

      if (tierConfig) {
        const priceInPennies = Math.round((tierConfig.price_monthly || 0) * 100);
        const currency = tierConfig.currency || 'GBP';

        planData = {
          name: String(tierConfig.name ?? ''),
          code: String(subscription.tier),
          status: mapSubscriptionStatus(subscription.status),
          price: formatCurrency(priceInPennies, currency),
          interval: 'month' as const, // Default for old structure
          renewsOn: subscription.current_period_end 
            ? new Date(subscription.current_period_end).toISOString()
            : null,
          description: tierConfig.description ? String(tierConfig.description) : null,
          features: null, // Old structure doesn't have features JSON
        };
      }
    }

    // Get billing information (payment method) from Stripe
    let billingInfo = {
      brand: null as string | null,
      last4: null as string | null,
      expMonth: null as number | null,
      expYear: null as number | null,
      billingEmail,
    };

    if (stripeCustomerId) {
      try {
        const stripe = getStripeClient();
        const customer = await stripe.customers.retrieve(stripeCustomerId, {
          expand: ['invoice_settings.default_payment_method'],
        });

        if (customer && !customer.deleted) {
          const defaultPaymentMethod = 
            (customer as any).invoice_settings?.default_payment_method;

          if (defaultPaymentMethod) {
            const pm = typeof defaultPaymentMethod === 'string'
              ? await stripe.paymentMethods.retrieve(defaultPaymentMethod)
              : defaultPaymentMethod;

            if (pm && pm.type === 'card' && pm.card) {
              billingInfo = {
                brand: pm.card.brand || null,
                last4: pm.card.last4 || null,
                expMonth: pm.card.exp_month || null,
                expYear: pm.card.exp_year || null,
                billingEmail,
              };
            }
          }
        }
      } catch (stripeError: any) {
        console.warn('Error fetching payment method from Stripe:', stripeError);
        // Continue without payment method - not critical
      }
    }

    // Get next invoice from Stripe
    let nextInvoice: SubscriptionPageData['nextInvoice'] = null;

    if (stripeCustomerId) {
      try {
        const stripe = getStripeClient();
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          customer: stripeCustomerId,
        });

        if (upcomingInvoice) {
          const currency = upcomingInvoice.currency || 'gbp';
          const amount = upcomingInvoice.amount_due || 0;
          const invoiceDate = upcomingInvoice.next_payment_attempt
            ? new Date(upcomingInvoice.next_payment_attempt * 1000).toISOString()
            : new Date(upcomingInvoice.created * 1000).toISOString();

          nextInvoice = {
            amount: formatCurrency(amount, currency),
            currency: currency.toUpperCase(),
            invoiceDate,
          };
        }
      } catch (invoiceError: any) {
        // No upcoming invoice is fine (e.g., canceled subscription)
        if (invoiceError.code !== 'invoice_upcoming_none') {
          console.warn('Error fetching upcoming invoice:', invoiceError);
        }
      }
    }

    // Get invoices from database (latest first)
    const { data: dbInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('invoice_date', { ascending: false })
      .limit(50);

    const invoices: SubscriptionPageData['invoices'] = (dbInvoices || []).map((inv) => ({
      invoiceDate: new Date(inv.invoice_date).toISOString(),
      invoiceNumber: inv.invoice_number || inv.stripe_invoice_id || 'N/A',
      amount: formatCurrency(inv.amount_paid, inv.currency),
      currency: inv.currency.toUpperCase(),
      status: inv.status as SubscriptionPageData['invoices'][0]['status'],
      downloadUrl: inv.pdf_url || inv.hosted_invoice_url || null,
    }));

    // If no invoices in DB but we have Stripe customer, try fetching from Stripe
    if (invoices.length === 0 && stripeCustomerId) {
      try {
        const stripe = getStripeClient();
        const stripeInvoices = await stripe.invoices.list({
          customer: stripeCustomerId,
          limit: 50,
        });

        for (const invoice of stripeInvoices.data) {
          invoices.push({
            invoiceDate: new Date(invoice.created * 1000).toISOString(),
            invoiceNumber: invoice.number || invoice.id,
            amount: formatCurrency(invoice.amount_paid || 0, invoice.currency || 'gbp'),
            currency: (invoice.currency || 'gbp').toUpperCase(),
            status: mapInvoiceStatus(invoice.status),
            downloadUrl: invoice.invoice_pdf || invoice.hosted_invoice_url || null,
          });
        }
      } catch (stripeError: any) {
        console.warn('Error fetching invoices from Stripe:', stripeError);
        // Continue with empty invoices array
      }
    }

    // Get available plans
    const availablePlans = await getAvailablePlans(supabase);

    return {
      plan: planData,
      billing: billingInfo,
      nextInvoice,
      invoices,
      availablePlans,
    };

  } catch (error: any) {
    console.error('Error fetching subscription data:', error);
    throw new Error(`Failed to fetch subscription data: ${error.message}`);
  }
}

/**
 * Get available subscription plans
 */
async function getAvailablePlans(supabase: any): Promise<Array<{
  name: string;
  tier: string;
  price: string; // Formatted currency string
  billingCycle: string;
  features?: Record<string, any> | null;
  isPopular?: boolean;
}>> {
  // Get plans from subscription_tier_config
  const { data: tierConfigs } = await supabase
    .from('subscription_tier_config')
    .select('tier, name, price_monthly, currency, description')
    .order('price_monthly', { ascending: true });

  if (!tierConfigs) {
    return [];
  }

  // Also get from subscription_plans for billing cycle info
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('id, name, interval, stripe_price_id, features')
    .eq('active', true);

  const availablePlans: Array<{
    name: string;
    tier: string;
    price: string;
    billingCycle: string;
    features?: Record<string, any> | null;
    isPopular?: boolean;
  }> = [];

  for (const tierConfig of tierConfigs) {
    // Find matching plans for this tier
    const tierPlans = plans?.filter(p => 
      p.id.startsWith(tierConfig.tier + '_')
    ) || [];

    for (const plan of tierPlans) {
      const priceInPennies = Math.round((tierConfig.price_monthly || 0) * 100);
      const currency = tierConfig.currency || 'GBP';

      availablePlans.push({
        name: plan.name || tierConfig.name,
        tier: tierConfig.tier,
        price: formatCurrency(priceInPennies, currency),
        billingCycle: plan.interval === 'year' ? 'annual' : 'monthly',
        features: plan.features || null,
        isPopular: tierConfig.tier === 'professional',
      });
    }

    // If no plans found, add default monthly plan
    if (tierPlans.length === 0) {
      const priceInPennies = Math.round((tierConfig.price_monthly || 0) * 100);
      const currency = tierConfig.currency || 'GBP';

      availablePlans.push({
        name: tierConfig.name,
        tier: tierConfig.tier,
        price: formatCurrency(priceInPennies, currency),
        billingCycle: 'monthly',
        features: null,
        isPopular: tierConfig.tier === 'professional',
      });
    }
  }

  return availablePlans;
}

/**
 * Map Stripe invoice status to our status type
 */
function mapInvoiceStatus(
  stripeStatus: string | null
): 'paid' | 'open' | 'void' | 'uncollectible' | 'draft' {
  if (!stripeStatus) return 'draft';
  
  const status = stripeStatus.toLowerCase();
  
  switch (status) {
    case 'paid':
      return 'paid';
    case 'open':
      return 'open';
    case 'void':
      return 'void';
    case 'uncollectible':
      return 'uncollectible';
    case 'draft':
      return 'draft';
    default:
      return 'draft';
  }
}
