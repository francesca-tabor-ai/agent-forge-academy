-- Add Stripe Product ID field to subscription_tier_config
-- This allows us to store both Product IDs and Price IDs for better tracking

-- Add stripe_product_id column if it doesn't exist
ALTER TABLE subscription_tier_config
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN subscription_tier_config.stripe_product_id IS 'Stripe Product ID for this subscription tier';

-- Note: Price IDs are still required in stripe_price_id for checkout sessions
-- Product IDs are useful for tracking and webhook processing
