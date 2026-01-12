import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { syncStripeInvoicesToDatabase, getUserStripeCustomerId } from '@/lib/utils/fetch-stripe-invoices';

/**
 * POST /api/subscription/sync-invoices
 * 
 * Syncs invoices from Stripe to the database for the current user.
 * Useful when invoices aren't automatically persisted.
 */
export async function POST(request: NextRequest) {
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

    // Get user's Stripe customer ID
    const stripeCustomerId = await getUserStripeCustomerId(user.id);

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this user' },
        { status: 404 }
      );
    }

    // Sync invoices
    const result = await syncStripeInvoicesToDatabase(
      user.id,
      stripeCustomerId,
      true // upsert
    );

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      message: `Synced ${result.synced} invoice(s)${result.errors > 0 ? ` with ${result.errors} error(s)` : ''}`,
    });

  } catch (error: any) {
    console.error('Error syncing invoices:', error);
    return NextResponse.json(
      { error: 'Failed to sync invoices', message: error.message },
      { status: 500 }
    );
  }
}
