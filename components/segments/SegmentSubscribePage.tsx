'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Segment } from '@/lib/types/segment';
import type { SegmentSubscriptionConfig } from '@/lib/utils/segment-subscriptions';
import { formatPrice, calculateAnnualSavings } from '@/lib/utils/segment-subscriptions';

interface SegmentSubscribePageProps {
  segment: Segment;
  config: SegmentSubscriptionConfig;
}

export default function SegmentSubscribePage({ segment, config }: SegmentSubscribePageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-segment-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segmentType: segment.type,
          segmentKey: segment.key,
          billingCycle,
          successUrl: `${window.location.origin}/segments/${segment.type}/${segment.key}?success=true`,
          cancelUrl: `${window.location.origin}/segments/${segment.type}/${segment.key}/subscribe?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  const monthlyPrice = config.monthlyPrice;
  const annualPrice = config.annualPrice;
  const annualSavings = calculateAnnualSavings(monthlyPrice, annualPrice);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Back Link */}
        <Link
          href={`/segments/${segment.type}/${segment.key}`}
          className="text-brand-dark hover:text-brand-yellow mb-8 inline-block"
        >
          ← Back to {segment.displayName}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
            Subscribe to {segment.displayName}
          </h1>
          <p className="text-xl text-gray-700">
            Get access to {segment.includedCourseSlugs.length} course{segment.includedCourseSlugs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-brand-dark text-white'
                  : 'text-gray-700 hover:text-brand-dark'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-brand-dark text-white'
                  : 'text-gray-700 hover:text-brand-dark'
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-brand-dark mb-2">
              {billingCycle === 'annual' ? formatPrice(annualPrice) : formatPrice(monthlyPrice)}
            </div>
            <div className="text-gray-600">
              {billingCycle === 'annual' ? '/ year' : '/ month'}
            </div>
            {billingCycle === 'annual' && annualSavings > 0 && (
              <div className="mt-4">
                <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full">
                  Save {formatPrice(annualSavings)} per year
                </span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-brand-dark mb-4">What's included:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">
                  Access to {segment.includedCourseSlugs.length} course{segment.includedCourseSlugs.length !== 1 ? 's' : ''} in {segment.displayName}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">
                  All course materials, lessons, and resources
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">
                  {billingCycle === 'annual' ? '12 months' : 'Ongoing'} access with updates
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">
                  Cancel anytime
                </span>
              </li>
            </ul>
          </div>

          {/* Marketing Copy */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 italic">{config.marketingCopy}</p>
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : `Subscribe to ${segment.displayName}`}
          </button>

          {/* Terms */}
          <p className="mt-6 text-sm text-gray-500 text-center">
            By subscribing, you agree to our terms of service. You can cancel your subscription at any time.
          </p>
        </div>

        {/* FAQ or Additional Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-brand-dark mb-4">Questions?</h3>
          <p className="text-gray-700">
            If you have questions about this subscription, please{' '}
            <Link href="/contact" className="text-brand-dark hover:text-brand-yellow underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
