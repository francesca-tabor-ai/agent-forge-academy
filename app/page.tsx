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
      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex items-center">
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
            {/* Intentional spacing: title, subtitle, CTA with proper vertical rhythm */}
            <div className="space-y-8 sm:space-y-10 md:space-y-12 pt-16 pb-24 sm:pt-24 sm:pb-32">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight font-playfair max-w-3xl">
                Build Production-Grade AI Agent Systems
              </h1>
              <p className="text-lg sm:text-xl md:text-xl lg:text-2xl text-gray-100 leading-relaxed max-w-2xl font-light">
                A hands-on program for engineers building autonomous, multi-agent systems
              </p>
              <div className="pt-2">
                <Link 
                  href="/auth/signup"
                  className="btn-primary inline-block focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-brand-dark focus-visible:outline-none"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsCarousel />
    </>
  );
}
