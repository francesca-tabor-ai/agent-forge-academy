/**
 * Fetch invoices from Stripe and map them to the invoices table structure
 * 
 * This function can be used to sync invoices from Stripe when they're not
 * persisted in the database, or to refresh invoice data.
 */

import 'server-only';
import { getStripeClient } from '@/lib/stripe';
import { createUserSupabaseClient } from '@/lib/supabase/server';

export interface InvoiceData {
  id: string;
  userId: string;
  stripeInvoiceId: string;
  invoiceNumber: string;
  amountPaid: number; // in pennies
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible' | 'draft';
  invoiceDate: string; // ISO string
  pdfUrl?: string;
  hostedInvoiceUrl?: string;
}

/**
 * Fetch invoices from Stripe for a user and map to our schema
 * 
 * @param userId - The user's UUID
 * @param stripeCustomerId - The Stripe customer ID
 * @param limit - Maximum number of invoices to fetch (default: 100)
 * @returns Array of invoice data matching our schema
 */
export async function fetchStripeInvoicesForUser(
  userId: string,
  stripeCustomerId: string,
  limit: number = 100
): Promise<InvoiceData[]> {
  try {
    const stripe = getStripeClient();
    
    // Fetch invoices from Stripe
    const stripeInvoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit,
    });

    // Map Stripe invoices to our schema
    const invoices: InvoiceData[] = stripeInvoices.data.map((invoice) => ({
      id: '', // Will be set when inserting into DB
      userId,
      stripeInvoiceId: invoice.id,
      invoiceNumber: invoice.number || invoice.id,
      amountPaid: invoice.amount_paid || 0, // Already in smallest currency unit
      currency: invoice.currency || 'gbp',
      status: mapStripeInvoiceStatus(invoice.status),
      invoiceDate: new Date(invoice.created * 1000).toISOString(),
      pdfUrl: invoice.invoice_pdf || undefined,
      hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
    }));

    return invoices;
  } catch (error: any) {
    console.error('Error fetching Stripe invoices:', error);
    throw new Error(`Failed to fetch invoices from Stripe: ${error.message}`);
  }
}

/**
 * Sync invoices from Stripe to database
 * 
 * @param userId - The user's UUID
 * @param stripeCustomerId - The Stripe customer ID
 * @param upsert - Whether to upsert existing invoices (default: true)
 */
export async function syncStripeInvoicesToDatabase(
  userId: string,
  stripeCustomerId: string,
  upsert: boolean = true
): Promise<{ synced: number; errors: number }> {
  try {
    const invoices = await fetchStripeInvoicesForUser(userId, stripeCustomerId);
    const supabase = await createUserSupabaseClient();
    
    let synced = 0;
    let errors = 0;

    for (const invoice of invoices) {
      try {
        const { error } = await supabase
          .from('invoices')
          .upsert(
            {
              user_id: invoice.userId,
              stripe_invoice_id: invoice.stripeInvoiceId,
              invoice_number: invoice.invoiceNumber,
              amount_paid: invoice.amountPaid,
              currency: invoice.currency,
              status: invoice.status,
              invoice_date: invoice.invoiceDate,
              pdf_url: invoice.pdfUrl || null,
              hosted_invoice_url: invoice.hostedInvoiceUrl || null,
            },
            {
              onConflict: 'stripe_invoice_id',
              ignoreDuplicates: !upsert,
            }
          );

        if (error) {
          console.error(`Error syncing invoice ${invoice.stripeInvoiceId}:`, error);
          errors++;
        } else {
          synced++;
        }
      } catch (err: any) {
        console.error(`Error processing invoice ${invoice.stripeInvoiceId}:`, err);
        errors++;
      }
    }

    return { synced, errors };
  } catch (error: any) {
    console.error('Error syncing Stripe invoices:', error);
    throw error;
  }
}

/**
 * Map Stripe invoice status to our status enum
 */
function mapStripeInvoiceStatus(
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

/**
 * Get user's Stripe customer ID from database
 */
export async function getUserStripeCustomerId(userId: string): Promise<string | null> {
  try {
    const supabase = await createUserSupabaseClient();
    
    // Try stripe_customers table first
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (customer?.stripe_customer_id) {
      return customer.stripe_customer_id;
    }

    // Fall back to subscriptions table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .maybeSingle();

    return subscription?.stripe_customer_id || null;
  } catch (error) {
    console.error('Error fetching Stripe customer ID:', error);
    return null;
  }
}
