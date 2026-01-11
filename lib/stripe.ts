import Stripe from 'stripe';

/**
 * Get Stripe client instance (lazy initialization)
 * 
 * Centralized Stripe client for use across the application.
 * Uses lazy initialization to avoid top-level code execution during build.
 * 
 * @returns Stripe client instance
 * @throws Error if STRIPE_SECRET_KEY is not set
 */
let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }
  return stripeInstance;
}

/**
 * @deprecated Use getStripeClient() instead to avoid build-time errors
 * This export is kept for backward compatibility but will throw at runtime if env var is missing
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripeClient()[prop as keyof Stripe];
  },
});
