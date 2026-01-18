import { redirect } from 'next/navigation';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';

export default async function Home() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, redirect to /app
  if (user) {
    redirect('/app');
  }

  return (
    <>
      {/* Hero Section - Full-page image */}
      <section className="relative min-h-screen w-full flex items-center animate-fade-in">
        {/* Background Image */}
        <Image
          src="/hero-bg.png"
          alt="Abstract technology background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        
        {/* Layered Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/85 via-brand-dark/75 to-brand-dark/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-50" />
        
        {/* Hero Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8 sm:space-y-10 md:space-y-12 pt-16 pb-24 sm:pt-24 sm:pb-32">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight font-playfair max-w-3xl">
                AI Growth Hub
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-brand-yellow leading-tight max-w-3xl">
                Relearn for the AI Era
              </h2>
              <p className="text-lg sm:text-xl md:text-xl lg:text-2xl text-gray-100 leading-relaxed max-w-2xl font-light">
                Practical, continuously updated AI education to future-proof your career.
                Learn the skills that matter as AI reshapes work, commerce, and software — from fundamentals to advanced agentic systems.
              </p>
              <div className="pt-2 animate-slide-up">
                <Link 
                  href="/auth/signup"
                  className="btn-primary inline-block focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-brand-dark focus-visible:outline-none"
                >
                  → Learn AI the way the future demands
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signal / Sub-Hero */}
      <section className="bg-brand-dark py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 leading-relaxed font-light">
            Built for professionals, builders, marketers, and leaders who know static skills won&apos;t survive the AI shift.
          </p>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
            AI Growth Hub isn&apos;t about trends or theory.<br />
            It&apos;s about relearning how work gets done in an AI-first world.
          </p>
        </div>
      </section>

      {/* Why AI Growth Hub */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
            Why relearning matters now
          </h2>
          <p className="text-xl sm:text-2xl text-gray-700 mb-12 font-light">
            AI isn&apos;t just a new tool — it&apos;s changing:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="text-gray-700">
              <p className="text-lg font-medium mb-2">How software is built</p>
            </div>
            <div className="text-gray-700">
              <p className="text-lg font-medium mb-2">How content is created</p>
            </div>
            <div className="text-gray-700">
              <p className="text-lg font-medium mb-2">How products are discovered</p>
            </div>
            <div className="text-gray-700">
              <p className="text-lg font-medium mb-2">How careers remain relevant</p>
            </div>
          </div>

          <p className="text-lg text-gray-600 mb-12">
            Traditional education can&apos;t keep up.<br />
            AI Growth Hub exists to fill that gap.
          </p>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-8 font-playfair">
              What makes us different
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <p className="text-gray-700">Applied, real-world AI — not abstract theory</p>
              </div>
              <div className="flex items-start gap-3">
                <p className="text-gray-700">Courses updated as models, platforms, and regulations change</p>
              </div>
              <div className="flex items-start gap-3">
                <p className="text-gray-700">Designed for career longevity, not short-term hacks</p>
              </div>
              <div className="flex items-start gap-3">
                <p className="text-gray-700">Learn once, then keep relearning as AI evolves</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Overview Section */}
      <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
            A curriculum built for the AI economy
          </h2>
          <p className="text-xl sm:text-2xl text-gray-700 mb-12 font-light">
            Our courses are structured to take you from AI literacy → AI fluency → AI leadership, across three pillars:
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-sm card-interactive">
              <h3 className="text-xl font-bold text-brand-dark mb-3 font-playfair">Foundations & Literacy</h3>
              <p className="text-gray-700">
                Understand how AI works, how it&apos;s governed, and how to use it responsibly and effectively.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm card-interactive">
              <h3 className="text-xl font-bold text-brand-dark mb-3 font-playfair">Applied Systems & Workflows</h3>
              <p className="text-gray-700">
                Learn how AI is actually used in production — across software, content, commerce, and marketing.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm card-interactive">
              <h3 className="text-xl font-bold text-brand-dark mb-3 font-playfair">Agentic & Advanced AI</h3>
              <p className="text-gray-700">
                Design, deploy, and reason about autonomous systems that represent the future of work.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-8 font-playfair">
              Example Courses You&apos;ll Learn
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Prompt Engineering',
                'AI Content Pipelines',
                'SEO → AEO (Search to AI Engine Optimisation)',
                'AI Governance & EU AI Act',
                'Multi-Agent Systems',
                'Agentic RAG',
                'Agentic Commerce',
                'AI-Native Software Delivery Pipelines',
                'Conversational Commerce Intelligence',
                'Hyper-Personalised Marketing & Advertising',
                'AI-Driven Video & Synthetic Media',
                'AI Recommender Systems',
                'Amazon Rufus Optimisation',
                '3D for E-commerce',
                'Vibe Coding with Cursor & Supabase',
              ].map((course) => (
                <div key={course} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 card-interactive">
                  <p className="text-gray-700">{course}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-gray-600 italic">…and more added continuously.</p>
          </div>
        </div>
      </section>

      {/* Subscription Pricing */}
      <section className="bg-brand-dark py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 font-playfair">
              Simple subscription. Continuous relearning.
            </h2>
            <p className="text-xl sm:text-2xl text-gray-200 mb-2 font-light">
              No one-off courses.
            </p>
            <p className="text-xl sm:text-2xl text-gray-200 mb-2 font-light">
              No outdated material.
            </p>
            <p className="text-xl sm:text-2xl text-gray-200 font-light">
              Just ongoing access to skills that evolve with AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Essential Access */}
            <div className="bg-white rounded-lg p-8 shadow-lg card-interactive">
              <div className="mb-6">
                <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  Essential Access
                </span>
                <div className="text-4xl font-bold text-brand-dark mb-2">£39</div>
                <div className="text-gray-600">/ month</div>
              </div>
              <p className="text-gray-700 mb-6 font-medium">
                For learners building strong AI foundations
              </p>
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">Includes access to core courses:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Prompt Engineering</li>
                  <li>• AI Content Pipelines</li>
                  <li>• Reddit AI Visibility</li>
                  <li>• SEO → AEO</li>
                  <li>• AI Governance & EU AI Act</li>
                </ul>
              </div>
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">Best for:</p>
                <p className="text-sm text-gray-600">
                  Beginners, non-technical professionals, marketers, and leaders building AI literacy and confidence.
                </p>
              </div>
            </div>

            {/* Professional Access */}
            <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-brand-light relative card-interactive">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-brand-light text-white text-sm font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  Professional Access
                </span>
                <div className="text-4xl font-bold text-brand-dark mb-2">£79</div>
                <div className="text-gray-600">/ month</div>
              </div>
              <p className="text-gray-700 mb-6 font-medium">
                Full access to the entire AI Growth Hub curriculum
              </p>
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">Includes everything in Essential, plus:</p>
                <ul className="space-y-2 text-sm text-gray-700 max-h-48 overflow-y-auto">
                  <li>• Multi-Agent Systems</li>
                  <li>• AI-Native Software Delivery Pipelines</li>
                  <li>• Spec-Driven Development</li>
                  <li>• Agentic RAG</li>
                  <li>• Agentic Commerce</li>
                  <li>• AI-Driven Video & Synthetic Media</li>
                  <li>• AI Recommender Systems</li>
                  <li>• Conversational Commerce Intelligence</li>
                  <li>• Hyper-Personalised Marketing & Advertising</li>
                  <li>• 3D for E-commerce</li>
                  <li>• Amazon Rufus Optimisation</li>
                  <li>• Vibe Coding with Cursor & Supabase</li>
                </ul>
              </div>
              <div className="mb-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">Plus professional perks:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Certificate of Completion</li>
                  <li>Monthly Live Q&A / AMA with instructors</li>
                  <li>Community access (Slack / Discord)</li>
                </ul>
              </div>
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">Best for:</p>
                <p className="text-sm text-gray-600">
                  Career upskilling, consultants, founders, developers, product teams, and professionals who want to stay employable long-term.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-12 text-center font-playfair">
            Trusted by professionals adapting to the AI shift
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg card-interactive">
              <p className="text-gray-700 italic mb-4">
                &quot;This isn&apos;t another AI course — it&apos;s a way to keep my skills relevant as my role changes.&quot;
              </p>
              <p className="text-sm text-gray-600 font-medium">— Product Manager</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg card-interactive">
              <p className="text-gray-700 italic mb-4">
                &quot;AI Growth Hub helped me move from curiosity to confidently applying AI in real client work.&quot;
              </p>
              <p className="text-sm text-gray-600 font-medium">— Consultant</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg card-interactive">
              <p className="text-gray-700 italic mb-4">
                &quot;The agentic systems content alone paid for the subscription.&quot;
              </p>
              <p className="text-sm text-gray-600 font-medium">— Software Engineer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark mb-8 text-center font-playfair">
            AI Growth Hub is for you if:
          </h2>
          <div className="space-y-6 mb-12">
            <div className="flex items-start gap-4">
              <span className="text-2xl mt-1">✓</span>
              <p className="text-lg text-gray-700">You feel your current skills won&apos;t last the next 5 years</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl mt-1">✓</span>
              <p className="text-lg text-gray-700">You want practical AI skills, not academic theory</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl mt-1">✓</span>
              <p className="text-lg text-gray-700">You&apos;re tired of one-off courses that go stale</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl mt-1">✓</span>
              <p className="text-lg text-gray-700">You want to relearn continuously, not start over</p>
            </div>
          </div>
          <p className="text-xl text-gray-700 text-center font-light italic">
            This is education for the long game.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-dark py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 font-playfair">
            Relearn once. Keep relearning forever.
          </h2>
          <p className="text-xl sm:text-2xl text-gray-200 mb-8 font-light">
            AI isn&apos;t slowing down — and neither should your education.
          </p>
          <p className="text-xl sm:text-2xl text-gray-200 mb-12 font-light">
            Join AI Growth Hub today and future-proof your career.
          </p>
          <Link 
            href="/auth/signup"
            className="btn-primary inline-block focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-brand-dark focus-visible:outline-none animate-bounce-subtle"
          >
            Start learning now
          </Link>
        </div>
      </section>
    </>
  );
}
