import Image from 'next/image';
import { Testimonial } from '@/lib/testimonials';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-brand-yellow' : 'text-gray-700'}
        aria-hidden="true"
      >
        ★
      </span>
    ));
  };

  return (
    <div className="flex-shrink-0 w-[300px] sm:w-[340px] bg-brand-dark/40 rounded-lg p-6 sm:p-8 card-interactive">
      <div className="flex items-start gap-4 mb-5">
        <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={testimonial.imageUrl}
            alt={`${testimonial.name}, ${testimonial.role}`}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-base mb-0.5">{testimonial.name}</p>
          <p className="text-gray-400 text-sm leading-snug">{testimonial.role}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-4 text-base opacity-60" aria-label={`${testimonial.rating} out of 5 stars`}>
        {renderStars(testimonial.rating)}
      </div>
      <p className="text-gray-200 leading-relaxed text-[15px] sm:text-base">{testimonial.quote}</p>
    </div>
  );
}

