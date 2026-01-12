import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

/**
 * GET /api/subscription/data
 * 
 * Fetches complete subscription data for the current user:
 * - Current plan (name, status, price, interval, renewal date, description, benefits)
 * - Billing info (payment method, billing email)
 * - Next invoice (amount, date)
 * - Invoice list (date, invoice number, amount, status, download URL)
 * - Available plans
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile and student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Fetch subscription - handle both old (student_profile_id) and new (user_id) structures
    // Try user_id first (new structure), then fall back to student_profile_id (old structure)
    let subscription = null;
    
    // Try new structure with user_id
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
      const { data: subByStudentProfile } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('student_profile_id', studentProfile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      subscription = subByStudentProfile;
    }

    // If no subscription, return empty state
    if (!subscription) {
      const availablePlans = await getAvailablePlans(supabase);
      return NextResponse.json({
        plan: null,
        benefits: {
          courseAccess: 'No access',
          projectLimit: 0,
          portfolioLimit: 0,
          jobOpportunitiesAccess: false,
          aiAdvisorUsage: 'None',
          toolDiscountEligibility: false,
        },
        billing: {
          billingEmail: user.email || '',
          paymentMethod: null,
          nextInvoiceAmount: null,
          nextInvoiceDate: null,
        },
        invoices: [],
        availablePlans,
      });
    }

    // Get tier config for plan details
    // Handle both old structure (tier enum) and new structure (stripe_price_id)
    let tier: string | null = null;
    
    if (subscription.tier) {
      // Old structure with tier enum
      tier = subscription.tier;
    } else if (subscription.stripe_price_id) {
      // New structure - get tier from stripe_price_id
      tier = await getTierFromPriceId(supabase, subscription.stripe_price_id);
    }

    // Default to essential if no tier found
    const tierForQuery = tier || 'essential';
    
    const { data: tierConfig } = await supabase
      .from('subscription_tier_config')
      .select('*')
      .eq('tier', tierForQuery)
      .single();

    // Determine billing cycle from subscription_plans if stripe_price_id exists
    let billingCycle: 'monthly' | 'annual' = 'monthly';
    if (subscription.stripe_price_id) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('interval')
        .eq('stripe_price_id', subscription.stripe_price_id)
        .single();
      billingCycle = plan?.interval === 'year' ? 'annual' : 'monthly';
    }

    // Calculate trial days remaining
    let trialDaysRemaining: number | null = null;
    if (subscription.trial_end_at || subscription.trial_end) {
      const trialEnd = subscription.trial_end_at || subscription.trial_end;
      if (trialEnd) {
        const days = Math.ceil(
          (new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        trialDaysRemaining = days > 0 ? days : 0;
      }
    }

    // Build plan data
    const planData = {
      name: tierConfig?.name || 'Unknown Plan',
      tier: tier || 'essential',
      status: mapSubscriptionStatus(subscription.status),
      billingCycle,
      price: subscription.price_monthly || 0,
      currency: subscription.currency || 'GBP',
      renewalDate: subscription.current_period_end 
        ? new Date(subscription.current_period_end).toISOString().split('T')[0]
        : null,
      trialEndDate: subscription.trial_end_at || subscription.trial_end || null,
      trialDaysRemaining,
      description: tierConfig?.description || null,
    };

    // Get benefits (simplified - could be enhanced)
    const benefits = {
      courseAccess: tierConfig?.has_all_access 
        ? 'All courses' 
        : 'Limited courses',
      projectLimit: 10, // TODO: Get from tier config or separate table
      portfolioLimit: 1,
      jobOpportunitiesAccess: true,
      aiAdvisorUsage: 'Unlimited',
      toolDiscountEligibility: true,
    };

    // Fetch billing information
    const billingData = await getBillingInfo(
      supabase,
      user.id,
      subscription.stripe_customer_id || null,
      user.email || ''
    );

    // Fetch invoices
    const invoices = await getInvoices(
      supabase,
      user.id,
      subscription.stripe_customer_id || null
    );

    // Get available plans
    const availablePlans = await getAvailablePlans(supabase);

    return NextResponse.json({
      plan: planData,
      benefits,
      billing: billingData,
      invoices,
      availablePlans,
    });

  } catch (error: any) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get tier from stripe_price_id by looking up subscription_plans
 */
async function getTierFromPriceId(
  supabase: any,
  stripePriceId: string
): Promise<string | null> {
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('stripe_price_id', stripePriceId)
    .single();

  if (!plan) return null;

  // Extract tier from plan ID (e.g., 'essential_monthly' -> 'essential')
  if (plan.id.startsWith('essential_')) return 'essential';
  if (plan.id.startsWith('professional_') || plan.id.startsWith('pro_')) return 'professional';
  
  return null;
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
 * Get billing information including payment method
 */
async function getBillingInfo(
  supabase: any,
  userId: string,
  stripeCustomerId: string | null,
  userEmail: string
): Promise<{
  paymentMethod: {
    type: string;
    brand: string;
    last4: string;
    expiryMonth: number | null;
    expiryYear: number | null;
  } | null;
  billingEmail: string;
  nextInvoiceAmount: number | null;
  nextInvoiceDate: string | null;
}> {
  let paymentMethod = null;
  let nextInvoiceAmount: number | null = null;
  let nextInvoiceDate: string | null = null;

  // Fetch payment method from Stripe if customer ID exists
  if (stripeCustomerId) {
    try {
      const stripe = getStripeClient();
      
      // Get customer's default payment method
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
            paymentMethod = {
              type: 'card',
              brand: pm.card.brand || 'Unknown',
              last4: pm.card.last4 || '****',
              expiryMonth: pm.card.exp_month || null,
              expiryYear: pm.card.exp_year || null,
            };
          }
        }

        // Get upcoming invoice
        try {
          const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
            customer: stripeCustomerId,
          });

          if (upcomingInvoice) {
            nextInvoiceAmount = upcomingInvoice.amount_due / 100; // Convert from cents
            nextInvoiceDate = upcomingInvoice.next_payment_attempt
              ? new Date(upcomingInvoice.next_payment_attempt * 1000).toISOString().split('T')[0]
              : null;
          }
        } catch (invoiceError: any) {
          // No upcoming invoice is fine (e.g., canceled subscription)
          if (invoiceError.code !== 'invoice_upcoming_none') {
            console.warn('Error fetching upcoming invoice:', invoiceError);
          }
        }
      }
    } catch (stripeError: any) {
      console.warn('Error fetching Stripe customer data:', stripeError);
      // Continue without payment method - not critical
    }
  }

  return {
    paymentMethod,
    billingEmail: userEmail,
    nextInvoiceAmount,
    nextInvoiceDate,
  };
}

/**
 * Get invoices from payments table and Stripe
 */
async function getInvoices(
  supabase: any,
  userId: string,
  stripeCustomerId: string | null
): Promise<Array<{
  id: string;
  date: string;
  amount: number;
  status: string;
  url: string;
  downloadUrl?: string;
}>> {
  const invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    url: string;
    downloadUrl?: string;
  }> = [];

  // Fetch from payments table (local records)
  const { data: payments } = await supabase
    .from('payments')
    .select('id, stripe_invoice_id, amount, currency, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (payments && payments.length > 0) {
    for (const payment of payments) {
      invoices.push({
        id: payment.stripe_invoice_id || payment.id,
        date: new Date(payment.created_at).toISOString().split('T')[0],
        amount: payment.amount / 100, // Convert from smallest currency unit
        status: payment.status === 'succeeded' ? 'paid' : payment.status,
        url: payment.stripe_invoice_id 
          ? `https://dashboard.stripe.com/invoices/${payment.stripe_invoice_id}`
          : '#',
        downloadUrl: payment.stripe_invoice_id
          ? await getInvoiceDownloadUrl(payment.stripe_invoice_id)
          : undefined,
      });
    }
  }

  // If we have Stripe customer ID, also fetch from Stripe for completeness
  if (stripeCustomerId && invoices.length === 0) {
    try {
      const stripe = getStripeClient();
      const stripeInvoices = await stripe.invoices.list({
        customer: stripeCustomerId,
        limit: 20,
      });

      for (const invoice of stripeInvoices.data) {
        invoices.push({
          id: invoice.number || invoice.id,
          date: new Date(invoice.created * 1000).toISOString().split('T')[0],
          amount: invoice.amount_paid / 100,
          status: invoice.status === 'paid' ? 'paid' : (invoice.status || 'unknown'),
          url: invoice.hosted_invoice_url || invoice.invoice_pdf || '#',
          downloadUrl: invoice.invoice_pdf || undefined,
        });
      }
    } catch (stripeError: any) {
      console.warn('Error fetching Stripe invoices:', stripeError);
      // Continue with payments table data
    }
  }

  // Sort by date descending
  return invoices.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get invoice download URL from Stripe
 */
async function getInvoiceDownloadUrl(invoiceId: string): Promise<string | undefined> {
  try {
    const stripe = getStripeClient();
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return invoice.invoice_pdf || undefined;
  } catch (error) {
    console.warn('Error fetching invoice PDF:', error);
    return undefined;
  }
}

/**
 * Get available subscription plans
 */
async function getAvailablePlans(supabase: any): Promise<Array<{
  name: string;
  tier: string;
  price: number;
  billingCycle: string;
  features?: string[];
  isPopular?: boolean;
}>> {
  // Get plans from subscription_tier_config (no active field, get all)
  const { data: tierConfigs } = await supabase
    .from('subscription_tier_config')
    .select('tier, name, price_monthly, description')
    .order('price_monthly', { ascending: true });

  if (!tierConfigs) {
    return [];
  }

  // Also get from subscription_plans for billing cycle info
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('id, name, interval, stripe_price_id')
    .eq('active', true);

  const availablePlans: Array<{
    name: string;
    tier: string;
    price: number;
    billingCycle: string;
    features?: string[];
    isPopular?: boolean;
  }> = [];

  for (const tierConfig of tierConfigs) {
    // Find matching plans for this tier
    const tierPlans = plans?.filter((p: { id: string; name: string | null; interval: string; stripe_price_id: string | null }) => 
      p.id.startsWith(tierConfig.tier + '_')
    ) || [];

    for (const plan of tierPlans) {
      availablePlans.push({
        name: plan.name || tierConfig.name,
        tier: tierConfig.tier,
        price: tierConfig.price_monthly,
        billingCycle: plan.interval === 'year' ? 'annual' : 'monthly',
        isPopular: tierConfig.tier === 'professional',
      });
    }

    // If no plans found, add default monthly plan
    if (tierPlans.length === 0) {
      availablePlans.push({
        name: tierConfig.name,
        tier: tierConfig.tier,
        price: tierConfig.price_monthly,
        billingCycle: 'monthly',
        isPopular: tierConfig.tier === 'professional',
      });
    }
  }

  return availablePlans;
}
