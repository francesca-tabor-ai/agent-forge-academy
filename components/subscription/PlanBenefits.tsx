'use client';

interface PlanBenefitsProps {
  benefits: {
    courseAccess: string;
    projectLimit: number;
    portfolioLimit: number;
    jobOpportunitiesAccess: boolean;
    aiAdvisorUsage: string;
    toolDiscountEligibility: boolean;
  };
}

export function PlanBenefits({ benefits }: PlanBenefitsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Benefits</h2>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <span className="text-sm text-gray-700">Course access: {benefits.courseAccess}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <span className="text-sm text-gray-700">
            Project limit: {benefits.projectLimit} projects
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <span className="text-sm text-gray-700">
            Portfolio limit: {benefits.portfolioLimit} portfolio{benefits.portfolioLimit !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <span className="text-sm text-gray-700">
            Job opportunities: {benefits.jobOpportunitiesAccess ? 'Access enabled' : 'Not available'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <span className="text-sm text-gray-700">AI Advisor usage: {benefits.aiAdvisorUsage}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <span className="text-sm text-gray-700">
            Tool discount eligibility: {benefits.toolDiscountEligibility ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
}
