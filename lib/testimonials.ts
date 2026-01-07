export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  imageUrl: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Engineer at TechCorp',
    quote: 'The hands-on approach helped me build real production systems. Best investment in my career.',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'AI Systems Architect',
    quote: 'Finally, a course that focuses on production-grade systems, not just theory.',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Emily Watson',
    role: 'Lead Developer',
    quote: 'The multi-agent patterns I learned here are now powering our core infrastructure.',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Founder, AI Startup',
    quote: 'Went from concept to production in weeks. The portfolio showcase opened doors.',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    role: 'Engineering Manager',
    quote: 'Our team uses the frameworks taught here. Game-changing for autonomous systems.',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
  },
];

