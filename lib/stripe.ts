import Stripe from 'stripe';

/**
 * Stripe client instance
 * 
 * Centralized Stripe client for use across the application.
 * Uses the default API version for the installed Stripe SDK version.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
