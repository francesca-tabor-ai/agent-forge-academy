'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Segment } from '@/lib/types/segment';
import type { CourseMetadata } from '@/lib/course-metadata';
import { getSegmentSubscriptionConfig, formatPrice, calculateAnnualSavings } from '@/lib/utils/segment-subscriptions';

interface PublicSegmentLandingPageProps {
  segment: Segment;
  courses: Array<CourseMetadata & { slug: string }>;
}

export default function PublicSegmentLandingPage({ segment, courses }: PublicSegmentLandingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const config = getSegmentSubscriptionConfig(segment);
  const monthlyPrice = config?.monthlyPrice || 4900;
  const annualPrice = config?.annualPrice || 49000;
  const annualSavings = calculateAnnualSavings(monthlyPrice, annualPrice);

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
          successUrl: `${window.location.origin}/landing/${segment.type}/${segment.key}?success=true`,
          cancelUrl: `${window.location.origin}/landing/${segment.type}/${segment.key}?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check if auth is required
        if (response.status === 401 && errorData.requiresAuth) {
          window.location.href = `/auth/signup?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      // If it's a network error or other issue, show alert
      alert('Failed to start checkout. Please sign up or log in to continue.');
      // Redirect to signup as fallback
      window.location.href = `/auth/signup?redirect=${encodeURIComponent(window.location.pathname)}`;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Full-bleed Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center">
        {/* Background Image */}
        <Image
          src={segment.heroImageUrl}
          alt={`${segment.displayName} hero image`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
        
        {/* Hero Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 pt-16 pb-24">
              {/* Segment Type Badge */}
              <div className="inline-block">
                <span className="bg-brand-yellow/90 text-brand-dark text-sm font-semibold px-4 py-2 rounded-full uppercase tracking-wide">
                  {segment.type === 'track' ? 'Track' : segment.type === 'industry' ? 'Industry' : 'Role'}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight font-playfair">
                {segment.displayName}
              </h1>
              
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-100 leading-relaxed max-w-3xl font-light">
                {segment.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      {config && (
        <section className="bg-brand-dark py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 font-playfair">
                Start Learning Today
              </h2>
              <p className="text-xl sm:text-2xl text-gray-200 font-light">
                Get access to {courses.length} live course{courses.length !== 1 ? 's' : ''} in {segment.displayName}
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
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
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
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">
                    Access to {courses.length} live course{courses.length !== 1 ? 's' : ''} in {segment.displayName}
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

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : `Subscribe to ${segment.displayName}`}
              </button>

              <p className="mt-6 text-sm text-gray-500 text-center">
                By subscribing, you agree to our terms of service. You can cancel your subscription at any time.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Courses Section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
              Live Courses in {segment.displayName}
            </h2>
            <p className="text-xl text-gray-700">
              {courses.length} course{courses.length !== 1 ? 's' : ''} available with subscription
            </p>
          </div>

          {/* Course Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.slug}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow card-interactive"
              >
                <h3 className="text-xl font-bold text-brand-dark mb-2 font-playfair">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.outcome}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{course.time}</span>
                  <span className="capitalize">{course.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-8 text-center font-playfair">
            What You'll Learn
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-4">Key Outcomes</h3>
              <ul className="space-y-3 text-gray-700">
                {courses.slice(0, 5).map((course, idx) => (
                  <li key={course.slug} className="flex items-start gap-3">
                    <span className="text-brand-yellow mt-1">→</span>
                    <span>{course.outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-4">What You'll Build</h3>
              <ul className="space-y-3 text-gray-700">
                {courses.slice(0, 5).map((course, idx) => (
                  <li key={course.slug} className="flex items-start gap-3">
                    <span className="text-brand-yellow mt-1">→</span>
                    <span>{course.build}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section Placeholder */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-12 text-center font-playfair">
            What Students Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Placeholder testimonials */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 italic mb-4">
                "The {segment.displayName} courses have transformed how I approach my work. Highly recommended!"
              </p>
              <p className="text-sm text-gray-600 font-medium">— Student</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 italic mb-4">
                "Practical, actionable content that I could apply immediately. Worth every penny."
              </p>
              <p className="text-sm text-gray-600 font-medium">— Professional</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 italic mb-4">
                "The best investment I've made in my career development. The courses are constantly updated."
              </p>
              <p className="text-sm text-gray-600 font-medium">— Learner</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-brand-dark py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-12 text-center font-playfair">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                What courses are included in {segment.displayName}?
              </h3>
              <p className="text-gray-200">
                You'll have access to {courses.length} live course{courses.length !== 1 ? 's' : ''} specifically curated for {segment.displayName}. All courses are regularly updated with the latest content and best practices.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-200">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                What's the difference between monthly and annual billing?
              </h3>
              <p className="text-gray-200">
                Annual billing saves you {formatPrice(annualSavings)} per year compared to monthly billing. Both plans give you the same access to all courses.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Do I need any prerequisites?
              </h3>
              <p className="text-gray-200">
                Most courses are designed to be accessible, but some may have prerequisites. Check individual course descriptions for specific requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-6 font-playfair">
            Ready to Start Learning?
          </h2>
          <p className="text-xl sm:text-2xl text-gray-700 mb-8 font-light">
            Join thousands of professionals learning {segment.displayName}
          </p>
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Get Started Now'}
          </button>
        </div>
      </section>
    </div>
  );
}
