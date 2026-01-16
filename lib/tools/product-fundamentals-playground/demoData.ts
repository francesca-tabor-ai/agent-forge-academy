import type { PlaygroundState } from './types';

/**
 * Generate demo data for review mode testing
 */
export function generateDemoCaseData(): PlaygroundState {
  return {
    scenario: {
      id: 'demo-scenario-1',
      title: 'E-commerce Mobile App for Small Retailers',
      prompt: 'Build a mobile-first e-commerce platform that helps small retailers compete with large marketplaces by providing easy setup, low fees, and local customer connection.',
      constraints: ['Must work on iOS and Android', 'Budget: $50k initial development', 'Launch in 3 months'],
      targetUser: 'Small retail business owners (1-10 employees) selling physical products locally and online',
    },
    research: {
      rawNotes: 'Interviewed 15 small retailers. Key findings: 80% struggle with inventory management, 70% want mobile-first experience, 60% cite high marketplace fees as pain point. Survey of 200 retailers shows average monthly revenue of $15k, with 40% coming from online sales.',
      sourceType: 'interview',
    },
    personas: [
      {
        id: 'persona-1',
        name: 'Sarah the Shop Owner',
        archetype: 'Small Business Owner',
        goals: ['Increase online sales', 'Reduce operational overhead', 'Connect with local customers'],
        painPoints: ['High marketplace fees (15-20%)', 'Complex inventory systems', 'Limited mobile presence'],
        quotes: ['"I spend more time managing listings than actually selling"', '"The fees are eating into my margins"'],
      },
      {
        id: 'persona-2',
        name: 'Mike the Multi-Location Manager',
        archetype: 'Retail Operations Manager',
        goals: ['Unify inventory across locations', 'Track sales performance', 'Optimize stock levels'],
        painPoints: ['Manual inventory tracking', 'No real-time visibility', 'Stockouts and overstock'],
        quotes: ['"I need to see what\'s happening across all my stores in real-time"'],
      },
    ],
    problems: [
      {
        id: 'problem-1',
        who: 'Small retailers',
        need: 'a cost-effective way to sell online',
        because: 'marketplace fees (15-20%) significantly reduce profit margins',
        evidence: '80% of interviewed retailers cited fees as primary concern',
        successMetric: 'Reduce online selling costs by 50% compared to major marketplaces',
        rationale: 'High fees prevent small retailers from scaling online sales profitably. This is the core barrier to growth.',
        linkedPersonaIds: ['persona-1'],
      },
      {
        id: 'problem-2',
        who: 'Retail operations managers',
        need: 'real-time inventory visibility across locations',
        because: 'current manual systems lead to stockouts and overstock',
        evidence: 'Survey shows 60% experience stockouts monthly, 40% have excess inventory',
        successMetric: 'Reduce stockouts by 70% and excess inventory by 50%',
        rationale: 'Inventory management is critical for profitability. Real-time visibility enables data-driven decisions.',
        linkedPersonaIds: ['persona-2'],
      },
      {
        id: 'problem-3',
        who: 'Small business owners',
        need: 'mobile-first selling experience',
        because: '70% of customers prefer mobile shopping but current solutions are desktop-focused',
        evidence: 'Mobile traffic accounts for 65% of visits but only 40% of conversions',
        successMetric: 'Increase mobile conversion rate to 55%',
        rationale: 'Mobile is where customers are. Optimizing for mobile directly addresses user behavior and increases sales potential.',
        linkedPersonaIds: ['persona-1'],
      },
    ],
    journey: [
      {
        id: 'stage-1',
        name: 'Discovery',
        userGoal: 'Find a better online selling solution',
        actions: ['Search for alternatives', 'Compare pricing', 'Read reviews'],
        painPoints: ['Too many options to compare', 'Unclear pricing structures'],
        highFrictionPainPoints: ['Too many options to compare'],
        opportunities: ['Clear comparison tool', 'Transparent pricing'],
      },
      {
        id: 'stage-2',
        name: 'Evaluation',
        userGoal: 'Understand if solution fits their needs',
        actions: ['Sign up for trial', 'Test key features', 'Calculate costs'],
        painPoints: ['Complex onboarding', 'Hard to estimate total cost'],
        highFrictionPainPoints: ['Complex onboarding'],
        opportunities: ['Quick setup wizard', 'Cost calculator'],
      },
      {
        id: 'stage-3',
        name: 'Adoption',
        userGoal: 'Start selling online successfully',
        actions: ['Upload products', 'Set up payment', 'Launch store'],
        painPoints: ['Time-consuming setup', 'Learning curve'],
        highFrictionPainPoints: [],
        opportunities: ['Bulk import tools', 'Templates', 'Onboarding support'],
      },
    ],
    roadmap: [
      {
        id: 'roadmap-1',
        title: 'Mobile-First Store Builder',
        linkedProblemIds: ['problem-3'],
        impact: 5,
        effort: 4,
        quadrant: 'major-project',
        rationale: 'Mobile optimization addresses the largest conversion gap and aligns with user behavior. This is foundational for success.',
        horizon: 'short',
      },
      {
        id: 'roadmap-2',
        title: 'Low-Fee Payment Processing',
        linkedProblemIds: ['problem-1'],
        impact: 5,
        effort: 2,
        quadrant: 'quick-win',
        rationale: 'Immediate competitive advantage. Low fees directly address primary pain point and can be implemented quickly through payment partner integration.',
        horizon: 'short',
      },
      {
        id: 'roadmap-3',
        title: 'Real-Time Inventory Management',
        linkedProblemIds: ['problem-2'],
        impact: 4,
        effort: 4,
        quadrant: 'major-project',
        rationale: 'Critical for operations managers. Enables data-driven inventory decisions and reduces costly stockouts/overstock.',
        horizon: 'long',
      },
    ],
    sprints: [
      {
        goal: 'Launch MVP with core mobile store and low-fee payments',
        capacityPoints: 20,
      },
    ],
    stories: [
      {
        id: 'story-1',
        title: 'User can create mobile-optimized product listings',
        acceptanceCriteria: [
          'User can upload product images from mobile device',
          'Product forms are optimized for mobile input',
          'Preview shows mobile view',
          'Listings save and publish successfully',
        ],
        points: 5,
        linkedRoadmapItemId: 'roadmap-1',
        rationale: 'Core functionality for mobile-first experience. Enables users to manage store from mobile devices.',
      },
      {
        id: 'story-2',
        title: 'User can accept payments with 3% fee (vs 15-20% marketplaces)',
        acceptanceCriteria: [
          'Payment processing integrated',
          'Fee structure clearly displayed',
          'Transactions process successfully',
          'Fee calculation is accurate',
        ],
        points: 3,
        linkedRoadmapItemId: 'roadmap-2',
        rationale: 'Directly addresses primary pain point. Low fees provide immediate competitive advantage.',
      },
    ],
    uatScenarios: [
      {
        id: 'uat-1',
        title: 'User Registration Flow',
        steps: [
          'Navigate to registration page',
          'Enter email address',
          'Enter password (min 8 characters)',
          'Click "Create Account" button',
          'Verify email confirmation message appears',
        ],
        expected: 'User account is created successfully and confirmation email is sent',
      },
    ],
    bugs: [
      {
        id: 'bug-1',
        title: 'Payment processing fails on mobile Safari',
        severity: 'blocker',
        reproSteps: [
          'Open store on mobile Safari',
          'Add item to cart',
          'Proceed to checkout',
          'Attempt to complete payment',
        ],
        expected: 'Payment processes successfully',
        actual: 'Payment form does not submit, error message appears',
        linkedUATScenarioId: 'uat-1',
        decision: 'fix-now',
        rationale: 'Blocks core functionality on primary platform. Must be fixed before launch.',
      },
    ],
    auditLog: [
      {
        timestamp: new Date().toISOString(),
        step: 'scenario',
        action: 'SET_SCENARIO',
        metadata: { scenarioId: 'demo-scenario-1' },
      },
    ],
  };
}
