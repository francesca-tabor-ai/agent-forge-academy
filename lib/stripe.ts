import Stripe from 'stripe';

/**
 * Stripe client instance
 * 
 * Centralized Stripe client for use across the application.
 * Uses the latest API version for optimal compatibility.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});
