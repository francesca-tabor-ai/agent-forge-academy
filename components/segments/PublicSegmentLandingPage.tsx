'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Segment } from '@/lib/types/segment';
import type { CourseMetadata } from '@/lib/course-metadata';
import type { SegmentSubscriptionConfig } from '@/lib/utils/segment-subscriptions';
import { formatPrice, calculateAnnualSavings } from '@/lib/utils/subscription-utils';
import { LandingCourseCard } from './LandingCourseCard';

interface PublicSegmentLandingPageProps {
  segment: Segment;
  courses: Array<CourseMetadata & { slug: string }>;
  config: SegmentSubscriptionConfig | null;
}

export default function PublicSegmentLandingPage({ segment, courses, config }: PublicSegmentLandingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const monthlyPrice = config?.monthlyPrice || 4900;
  const annualPrice = config?.annualPrice || 49000;
  const annualSavings = calculateAnnualSavings(monthlyPrice, annualPrice);

  const handleSubscribe = async (cycle: 'monthly' | 'annual') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segment_type: segment.type,
          segment_key: segment.key,
          billing_period: cycle,
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

  const savingsPercent = annualSavings > 0 
    ? Math.round((annualSavings / (monthlyPrice * 12)) * 100)
    : 0;

  const handleStartMonthly = () => {
    setBillingCycle('monthly');
    handleSubscribe('monthly');
  };

  const handleStartAnnual = () => {
    setBillingCycle('annual');
    handleSubscribe('annual');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Full-bleed Hero Section */}
      <section className="relative w-full h-screen min-h-[600px] flex items-end">
        {/* Background Image */}
        <Image
          src={segment.heroImageUrl}
          alt={`${segment.displayName} hero image`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        
        {/* Gradient Overlay - Dark bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40" />
        
        {/* Hero Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Title and Subtitle */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight font-playfair">
                  {segment.displayName}
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-white leading-relaxed max-w-3xl font-light">
                  {segment.description}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleStartMonthly}
                  disabled={isLoading}
                  className="btn-primary bg-white text-brand-dark hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                  {isLoading && billingCycle === 'monthly' ? 'Processing...' : `Start monthly`}
                </button>
                <button
                  onClick={handleStartAnnual}
                  disabled={isLoading}
                  className="btn-primary bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                  {isLoading && billingCycle === 'annual' ? 'Processing...' : `Start annual${savingsPercent > 0 ? ` (save ${savingsPercent}%)` : ''}`}
                </button>
              </div>

              {/* Trust Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 text-white/90 text-sm sm:text-base">
                <span className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  <span>Cancel anytime</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  <span>Access {courses.length} matching course{courses.length !== 1 ? 's' : ''}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  <span>New courses added</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Included Courses Section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
              Included Courses
            </h2>
            <p className="text-xl text-gray-700">
              {courses.length} live course{courses.length !== 1 ? 's' : ''} included with subscription
            </p>
          </div>

          {/* Course Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <LandingCourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Details Section */}
      {config && (
        <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
                Pricing
              </h2>
              <p className="text-xl text-gray-700">
                Choose the plan that works for you
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Monthly Plan */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-brand-dark mb-2">
                    {formatPrice(monthlyPrice)}
                  </div>
                  <div className="text-gray-600">/ month</div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">
                      Access to {courses.length} live course{courses.length !== 1 ? 's' : ''}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">
                      All course materials and resources
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">
                      Ongoing access with updates
                    </span>
                  </li>
                </ul>
                <button
                  onClick={handleStartMonthly}
                  disabled={isLoading}
                  className="w-full btn-primary bg-brand-dark text-white hover:bg-brand-dark/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && billingCycle === 'monthly' ? 'Processing...' : 'Start monthly'}
                </button>
              </div>

              {/* Annual Plan */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-brand-yellow relative">
                {savingsPercent > 0 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-brand-yellow text-brand-dark text-sm font-semibold px-4 py-1 rounded-full">
                      Save {savingsPercent}%
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-brand-dark mb-2">
                    {formatPrice(annualPrice)}
                  </div>
                  <div className="text-gray-600">/ year</div>
                  {savingsPercent > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Save {formatPrice(annualSavings)} per year
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">
                      Access to {courses.length} live course{courses.length !== 1 ? 's' : ''}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">
                      All course materials and resources
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">
                      12 months access with updates
                    </span>
                  </li>
                </ul>
                <button
                  onClick={handleStartAnnual}
                  disabled={isLoading}
                  className="w-full btn-primary bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && billingCycle === 'annual' ? 'Processing...' : `Start annual${savingsPercent > 0 ? ` (save ${savingsPercent}%)` : ''}`}
                </button>
              </div>
            </div>

            <p className="mt-8 text-sm text-gray-500 text-center">
              By subscribing, you agree to our terms of service. You can cancel your subscription at any time.
            </p>
          </div>
        </section>
      )}


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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartMonthly}
              disabled={isLoading}
              className="btn-primary bg-brand-dark text-white hover:bg-brand-dark/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && billingCycle === 'monthly' ? 'Processing...' : 'Start monthly'}
            </button>
            <button
              onClick={handleStartAnnual}
              disabled={isLoading}
              className="btn-primary bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && billingCycle === 'annual' ? 'Processing...' : `Start annual${savingsPercent > 0 ? ` (save ${savingsPercent}%)` : ''}`}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
