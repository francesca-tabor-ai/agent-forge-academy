#!/usr/bin/env node

/**
 * Helper script to fetch Stripe Price IDs for products
 * 
 * Usage:
 *   node scripts/get-stripe-price-ids.js
 * 
 * Requires STRIPE_SECRET_KEY environment variable
 */

const Stripe = require('stripe');

const PRODUCT_IDS = {
  essential: {
    monthly: 'prod_Tly7fWmByUigSA',
    annual: 'prod_Tly9xah25V3791',
  },
  professional: {
    monthly: 'prod_Tly7hTXuqPVic4',
    annual: 'prod_TlyAaxUClcCq9n',
  },
};

async function getPriceIds() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
    console.log('\nSet it with:');
    console.log('  export STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });

  console.log('🔍 Fetching Price IDs from Stripe...\n');

  const results = {};

  for (const [tier, products] of Object.entries(PRODUCT_IDS)) {
    results[tier] = {};
    
    for (const [period, productId] of Object.entries(products)) {
      try {
        // Get product
        const product = await stripe.products.retrieve(productId);
        
        // Get prices for this product
        const prices = await stripe.prices.list({
          product: productId,
          active: true,
        });

        if (prices.data.length === 0) {
          console.warn(`⚠️  No active prices found for ${tier} ${period} (${productId})`);
          results[tier][period] = null;
        } else {
          // Find monthly or annual price
          const price = prices.data.find(p => {
            if (period === 'monthly') {
              return p.recurring?.interval === 'month';
            } else if (period === 'annual') {
              return p.recurring?.interval === 'year';
            }
            return true;
          }) || prices.data[0];

          results[tier][period] = {
            priceId: price.id,
            amount: price.unit_amount ? price.unit_amount / 100 : null,
            currency: price.currency,
            interval: price.recurring?.interval,
            productName: product.name,
          };

          console.log(`✅ ${tier} ${period}:`);
          console.log(`   Product: ${product.name} (${productId})`);
          console.log(`   Price ID: ${price.id}`);
          console.log(`   Amount: ${price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A'} ${price.currency.toUpperCase()}`);
          console.log(`   Interval: ${price.recurring?.interval || 'N/A'}\n`);
        }
      } catch (error) {
        console.error(`❌ Error fetching ${tier} ${period} (${productId}):`, error.message);
        results[tier][period] = null;
      }
    }
  }

  console.log('\n📋 SQL Update Script:');
  console.log('-- Update stripe_price_id in subscription_tier_config\n');
  
  if (results.essential?.monthly?.priceId) {
    console.log(`UPDATE subscription_tier_config`);
    console.log(`SET stripe_price_id = '${results.essential.monthly.priceId}'`);
    console.log(`WHERE tier = 'essential';\n`);
  }
  
  if (results.professional?.monthly?.priceId) {
    console.log(`UPDATE subscription_tier_config`);
    console.log(`SET stripe_price_id = '${results.professional.monthly.priceId}'`);
    console.log(`WHERE tier = 'professional';\n`);
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  getPriceIds()
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { getPriceIds, PRODUCT_IDS };
