-- Add Stripe integration fields to subscriptions table

-- Add stripe_customer_id to subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
ON subscriptions(stripe_customer_id);

-- Create index for stripe_subscription_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
ON subscriptions(stripe_subscription_id);

-- Add stripe_price_id to subscription_tier_config
ALTER TABLE subscription_tier_config
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe Customer ID for payment processing';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe Subscription ID for payment processing';
COMMENT ON COLUMN subscription_tier_config.stripe_price_id IS 'Stripe Price ID for this subscription tier';
