'use client';

import { useState } from 'react';
import { Copy, Check, FileText, Target, AlertTriangle, Users, Code, Lightbulb } from 'lucide-react';
import { logToolRunSafe } from '@/lib/tools/logToolRun';

interface StrategyToTechnicalPromptClientProps {
  toolId: string;
  studentProfileId: string;
}

const PROMPT_TEMPLATE = `You are an expert product strategist and technical requirements analyst. Your role is to transform vague business ideas into comprehensive, structured Product Requirements Documents (PRDs) that bridge the gap between strategic vision and technical execution.

## Your Mission
Transform the following business idea into a detailed PRD that includes:
1. Clear problem statement and business objectives
2. Specific, measurable success metrics
3. Comprehensive risk analysis
4. User stories and personas
5. Technical constraints and considerations
6. Implementation priorities and roadmap

## Business Idea to Transform
[Paste the vague business idea here]

## Required PRD Structure

### 1. Executive Summary
- Problem statement: What problem does this solve?
- Business objectives: What are the primary goals?
- Target market: Who is this for?
- Value proposition: Why should users care?

### 2. Success Metrics (Specific & Measurable)
For each objective, provide:
- Primary metric: [Metric name] - Target: [Specific number/percentage] by [Timeframe]
- Secondary metrics: [List 2-3 supporting metrics]
- Leading indicators: [Early signals of success]
- How metrics will be measured: [Data sources, tracking methods]

Example format:
- User Acquisition: Target 10,000 active users within 6 months
- Engagement: Target 40% weekly active user rate
- Revenue: Target $50K MRR by month 12
- Customer Satisfaction: Target NPS score of 50+

### 3. Risk Analysis
For each identified risk, provide:
- Risk description: [What could go wrong?]
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation strategy: [How to prevent or minimize]
- Contingency plan: [What to do if it occurs]

Categories to consider:
- Technical risks (scalability, performance, security)
- Market risks (competition, adoption, timing)
- Resource risks (team capacity, budget, dependencies)
- Regulatory/compliance risks
- User experience risks

### 4. User Personas & Stories
For each persona:
- Name and role
- Demographics and context
- Goals and pain points
- How this solution helps them

User stories format:
- As a [persona], I want [goal] so that [benefit]
- Acceptance criteria: [Specific, testable conditions]

### 5. Functional Requirements
- Core features: [Must-have features]
- Nice-to-have features: [Future enhancements]
- Out of scope: [Explicitly excluded items]

For each feature:
- Feature name
- Description
- User value
- Priority: [P0/P1/P2]
- Dependencies

### 6. Non-Functional Requirements
- Performance: [Response times, throughput, capacity]
- Security: [Authentication, authorization, data protection]
- Scalability: [Expected growth, infrastructure needs]
- Usability: [Accessibility, mobile support, browser compatibility]
- Compliance: [Regulatory requirements, standards]

### 7. Technical Constraints & Considerations
- Technology stack preferences/limitations
- Integration requirements
- Data requirements
- Infrastructure constraints
- Third-party dependencies
- Legacy system considerations

### 8. Implementation Roadmap
Phase 1 (MVP - Months 1-3):
- Features: [List]
- Success criteria: [How to know it's done]
- Risks: [Top 3 risks for this phase]

Phase 2 (Growth - Months 4-6):
- Features: [List]
- Success criteria: [How to know it's done]
- Risks: [Top 3 risks for this phase]

Phase 3+ (Scale - Months 7+):
- Features: [List]
- Success criteria: [How to know it's done]
- Risks: [Top 3 risks for this phase]

### 9. Open Questions & Assumptions
- Questions that need answers before implementation
- Assumptions being made (and how to validate them)
- Decisions needed from stakeholders

## Output Requirements
1. Be specific and actionable - avoid vague language
2. Use concrete numbers and timeframes for metrics
3. Identify at least 5-7 distinct risks with mitigation plans
4. Create 3-5 user personas with detailed stories
5. Prioritize requirements (P0 = critical, P1 = important, P2 = nice-to-have)
6. Include technical feasibility assessment
7. Provide realistic timeline estimates

## Quality Checklist
Before finalizing, ensure:
- [ ] All success metrics are specific, measurable, and time-bound
- [ ] Risks are categorized and have mitigation strategies
- [ ] User stories have clear acceptance criteria
- [ ] Technical constraints are explicitly documented
- [ ] Implementation phases are realistic and prioritized
- [ ] Open questions are identified for stakeholder resolution

Now, transform the business idea provided above into a comprehensive PRD following this structure.`;

export function StrategyToTechnicalPromptClient({ 
  toolId, 
  studentProfileId 
}: StrategyToTechnicalPromptClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_TEMPLATE);
      setCopied(true);
      
      // Log tool usage
      await logToolRunSafe({
        toolId,
        studentProfileId,
        inputs: {
          action: 'copied_prompt',
        },
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          How to Use This Prompt
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Click the &quot;Copy Prompt&quot; button below to copy the entire prompt template</li>
          <li>Open ChatGPT (or your preferred AI assistant)</li>
          <li>Paste the prompt into the chat</li>
          <li>Replace the placeholder text &quot;[Paste the vague business idea here]&quot; with your actual business idea</li>
          <li>Submit and let the AI transform your idea into a structured PRD</li>
          <li>Review and refine the output to match your specific needs</li>
        </ol>
      </div>

      {/* Prompt Display */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">ChatGPT Prompt Template</h2>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Prompt
              </>
            )}
          </button>
        </div>
        
        <div className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-x-auto">
            {PROMPT_TEMPLATE}
          </pre>
        </div>
      </div>

      {/* What This Prompt Does */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Success Metrics</h3>
          </div>
          <p className="text-sm text-gray-600">
            The prompt ensures you get specific, measurable success metrics with targets, timeframes, and measurement methods. No vague goals—only actionable KPIs.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Risk Analysis</h3>
          </div>
          <p className="text-sm text-gray-600">
            Comprehensive risk identification across technical, market, resource, and compliance categories—each with likelihood, impact, and mitigation strategies.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">User Stories</h3>
          </div>
          <p className="text-sm text-gray-600">
            Detailed user personas with goals, pain points, and user stories that include clear acceptance criteria for development teams.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Code className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Technical Requirements</h3>
          </div>
          <p className="text-sm text-gray-600">
            Structured technical constraints, infrastructure needs, integration requirements, and implementation roadmap with phased approach.
          </p>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Best Practices for Using This Prompt</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <span><strong>Be specific:</strong> Include as much context as possible about your business idea, target market, and constraints</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <span><strong>Iterate:</strong> Use the AI&apos;s output as a starting point, then refine based on your domain expertise</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <span><strong>Validate metrics:</strong> Ensure success metrics align with your business model and are realistically achievable</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <span><strong>Review risks:</strong> Add domain-specific risks that the AI might miss, especially regulatory or industry-specific concerns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <span><strong>Share with stakeholders:</strong> Use the PRD to align your team, investors, and technical leads on vision and requirements</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
