import type { CaseScenario } from './types';

export const PRELOADED_SCENARIOS: CaseScenario[] = [
  {
    id: 'scenario-1',
    title: 'E-commerce Mobile App for Small Retailers',
    prompt: 'Build a mobile-first e-commerce platform that helps small retailers compete with large marketplaces by providing easy setup, low fees, and local customer connection.',
    constraints: ['Must work on iOS and Android', 'Budget: $50k initial development', 'Launch in 3 months'],
    targetUser: 'Small retail business owners (1-10 employees) selling physical products locally and online',
  },
  {
    id: 'scenario-2',
    title: 'AI-Powered Learning Management System',
    prompt: 'Create an LMS that uses AI to personalize learning paths, generate adaptive assessments, and provide real-time feedback to both students and instructors.',
    constraints: ['Must integrate with existing student information systems', 'GDPR compliant', 'Support 10,000+ concurrent users'],
    targetUser: 'Educational institutions (K-12 and higher ed) looking to modernize their learning platforms',
  },
  {
    id: 'scenario-3',
    title: 'Healthcare Appointment Scheduling Platform',
    prompt: 'Develop a patient-friendly appointment scheduling system that reduces no-shows, optimizes provider schedules, and integrates with electronic health records.',
    constraints: ['HIPAA compliant', 'Must support multiple provider types', 'Real-time availability updates'],
    targetUser: 'Healthcare practices (clinics, hospitals) managing patient appointments and provider schedules',
  },
  {
    id: 'scenario-4',
    title: 'Remote Team Collaboration Tool',
    prompt: 'Build a collaboration platform that combines video calls, document sharing, and project management specifically designed for distributed teams.',
    constraints: ['Works across time zones', 'End-to-end encryption', 'Free tier for teams under 10'],
    targetUser: 'Remote and hybrid teams (5-100 members) needing seamless collaboration across locations',
  },
  {
    id: 'scenario-5',
    title: 'Sustainable Food Delivery Service',
    prompt: 'Create a food delivery app that connects consumers with local restaurants, prioritizes eco-friendly packaging, and offers carbon-neutral delivery options.',
    constraints: ['Partner with local restaurants only', 'Zero-waste packaging requirement', 'Competitive with major delivery apps'],
    targetUser: 'Environmentally conscious consumers (ages 25-45) who want convenient food delivery with sustainability focus',
  },
];
