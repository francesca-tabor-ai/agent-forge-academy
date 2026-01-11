'use client';

import Link from 'next/link';

interface PlanBenefitsProps {
  benefits: {
    courseAccess: string;
    projectLimit: number;
    portfolioLimit: number;
    jobOpportunitiesAccess: boolean;
    aiAdvisorUsage: string;
    toolDiscountEligibility: boolean;
  };
  usage?: {
    aiAdvisorUsed?: number;
    jobsApplied?: number;
  };
  onUpgrade?: () => void;
}

interface PlanBenefitsProps {
  benefits: {
    courseAccess: string;
    projectLimit: number;
    portfolioLimit: number;
    jobOpportunitiesAccess: boolean;
    aiAdvisorUsage: string;
    toolDiscountEligibility: boolean;
  };
  usage?: {
    aiAdvisorUsed?: number;
    jobsApplied?: number;
  };
  onUpgrade?: () => void;
  onComparePlans?: () => void;
}

export function PlanBenefits({ benefits, usage, onUpgrade, onComparePlans }: PlanBenefitsProps) {

  const getJobOpportunitiesHint = () => {
    if (!benefits.jobOpportunitiesAccess) return null;
    if (usage?.jobsApplied && usage.jobsApplied > 0) {
      return '→ matched roles visible';
    }
    return '→ matched roles visible';
  };

  const getAiAdvisorHint = () => {
    if (benefits.aiAdvisorUsage === 'Unlimited') {
      if (usage?.aiAdvisorUsed === 0 || !usage?.aiAdvisorUsed) {
        return '→ You haven\'t used AI Advisor yet. Try it!';
      }
      return '→ architecture + CV support';
    }
    return null;
  };

  const getToolDiscountAction = () => {
    if (benefits.toolDiscountEligibility) {
      return (
        <Link
          href="/student/offers"
          className="text-sm font-medium text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1"
        >
          View offers →
        </Link>
      );
    }
    return (
      <button
        onClick={onUpgrade}
        className="text-sm font-medium text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1"
      >
        Upgrade to unlock →
      </button>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Plan Benefits</h2>
        {onComparePlans && (
          <button
            onClick={onComparePlans}
            className="text-sm font-medium text-brand-light hover:text-brand-light/90"
          >
            Compare plans →
          </button>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-green-600 mt-0.5">✓</span>
            <div>
              <span className="text-sm text-gray-700">Course access: {benefits.courseAccess}</span>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-green-600 mt-0.5">✓</span>
            <div>
              <span className="text-sm text-gray-700">
                Project limit: {benefits.projectLimit} projects
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-green-600 mt-0.5">✓</span>
            <div>
              <span className="text-sm text-gray-700">
                Portfolio limit: {benefits.portfolioLimit} portfolio{benefits.portfolioLimit !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-green-600 mt-0.5">✓</span>
            <div>
              <span className="text-sm text-gray-700">
                Job opportunities: {benefits.jobOpportunitiesAccess ? 'Access enabled' : 'Not available'}
              </span>
              {getJobOpportunitiesHint() && (
                <span className="text-xs text-gray-500 block mt-0.5">{getJobOpportunitiesHint()}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-green-600 mt-0.5">✓</span>
            <div>
              <span className="text-sm text-gray-700">AI Advisor usage: {benefits.aiAdvisorUsage}</span>
              {getAiAdvisorHint() && (
                <span className="text-xs text-gray-500 block mt-0.5">{getAiAdvisorHint()}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <span className={benefits.toolDiscountEligibility ? 'text-green-600 mt-0.5' : 'text-gray-400 mt-0.5'}>
              {benefits.toolDiscountEligibility ? '✓' : '❌'}
            </span>
            <div>
              <span className="text-sm text-gray-700">
                Tool discounts: {benefits.toolDiscountEligibility ? 'Included' : 'Not included'}
              </span>
              {!benefits.toolDiscountEligibility && (
                <span className="text-xs text-gray-500 block mt-0.5">(available on Pro)</span>
              )}
            </div>
          </div>
          <div>{getToolDiscountAction()}</div>
        </div>
      </div>
    </div>
  );
}
