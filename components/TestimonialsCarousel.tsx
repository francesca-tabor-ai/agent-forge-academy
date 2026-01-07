'use client';

import { useRef } from 'react';
import TestimonialCard from './TestimonialCard';
import { testimonials } from '@/lib/testimonials';

export default function TestimonialsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-brand-dark py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12 sm:mb-16 font-playfair tracking-tight">
          What Students Say
        </h2>
        <div
          ref={scrollContainerRef}
          className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              style={{ scrollSnapAlign: 'start' }}
              className="flex-shrink-0"
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

