// Gap Detection Engine

import { GRD, Gap, GovernanceSignals } from './types';

export class GapDetector {
  /**
   * Detect gaps in GRD completeness
   */
  detectGaps(grd: GRD, signals: GovernanceSignals): Gap[] {
    const gaps: Gap[] = [];

    // Ownership gaps
    gaps.push(...this.detectOwnershipGaps(grd));

    // Evaluation gaps
    gaps.push(...this.detectEvaluationGaps(grd, signals));

    // Guardrail gaps
    gaps.push(...this.detectGuardrailGaps(grd, signals));

    // Regulatory gaps
    gaps.push(...this.detectRegulatoryGaps(grd));

    // Escalation gaps
    gaps.push(...this.detectEscalationGaps(grd, signals));

    return gaps;
  }

  private detectOwnershipGaps(grd: GRD): Gap[] {
    const gaps: Gap[] = [];
    const requiredRoles: (keyof typeof grd.ownership)[] = [
      'productOwner',
      'modelOwner',
      'riskOwner',
    ];

    // Class 3+ requires additional owners
    if (grd.classification.aiClass >= 3) {
      requiredRoles.push('legalOwner', 'businessOwner');
    }

    requiredRoles.forEach(role => {
      if (!grd.ownership[role] || grd.ownership[role] === 'TBD') {
        gaps.push({
          severity: 'blocker',
          category: 'ownership',
          description: `No ${role} assigned`,
          owner: 'productOwner',
        });
      }
    });

    return gaps;
  }

  private detectEvaluationGaps(grd: GRD, signals: GovernanceSignals): Gap[] {
    const gaps: Gap[] = [];

    // Check if evaluation dataset is mentioned in PRD
    if (grd.prdText && !grd.prdText.toLowerCase().includes('evaluation') && 
        !grd.prdText.toLowerCase().includes('test dataset') &&
        !grd.prdText.toLowerCase().includes('ground truth')) {
      gaps.push({
        severity: 'critical',
        category: 'evaluation',
        description: 'No evaluation dataset specified in PRD',
        remediation: 'Define ground truth dataset in PRD Section X',
      });
    }

    // Check if required tests have thresholds
    grd.evaluationRequirements.mandatoryTests.forEach(test => {
      if (!grd.evaluationRequirements.thresholds[test]) {
        gaps.push({
          severity: 'high',
          category: 'evaluation',
          description: `No threshold defined for ${test}`,
        });
      }
    });

    return gaps;
  }

  private detectGuardrailGaps(grd: GRD, signals: GovernanceSignals): Gap[] {
    const gaps: Gap[] = [];

    // Check if disallowed intents have refusal patterns
    grd.guardrails.disallowedIntents.forEach(intent => {
      const hasRefusalPattern = grd.guardrails.refusalPatterns.some(pattern =>
        pattern.toLowerCase().includes(intent.toLowerCase().split('_')[0])
      );

      if (!hasRefusalPattern) {
        gaps.push({
          severity: 'high',
          category: 'guardrails',
          description: `No refusal pattern defined for: ${intent}`,
        });
      }
    });

    // Check if high-risk domains have appropriate guardrails
    if (signals.domainSensitivity === 'high' && grd.guardrails.disallowedIntents.length === 0) {
      gaps.push({
        severity: 'critical',
        category: 'guardrails',
        description: 'High-sensitivity domain requires explicit guardrails',
      });
    }

    return gaps;
  }

  private detectRegulatoryGaps(grd: GRD): Gap[] {
    const gaps: Gap[] = [];

    // Check if regulatory triggers have compliance plans
    Object.keys(grd.regulatoryMapping).forEach(regulation => {
      const mapping = grd.regulatoryMapping[regulation];
      if (mapping && mapping !== 'not_applicable' && !mapping.includes('plan')) {
        // Check if PRD mentions compliance
        if (grd.prdText && !grd.prdText.toLowerCase().includes(regulation.toLowerCase())) {
          gaps.push({
            severity: 'blocker',
            category: 'regulatory',
            description: `No compliance plan documented for ${regulation}`,
            owner: 'legalOwner',
          });
        }
      }
    });

    return gaps;
  }

  private detectEscalationGaps(grd: GRD, signals: GovernanceSignals): Gap[] {
    const gaps: Gap[] = [];

    // Class 2+ requires escalation rules
    if (grd.classification.aiClass >= 2 && grd.guardrails.escalationRules.length === 0) {
      gaps.push({
        severity: 'blocker',
        category: 'escalation',
        description: 'No human escalation path defined',
        prdSection: 'User Stories',
        owner: 'productOwner',
      });
    }

    // High autonomy requires escalation
    if (signals.autonomyLevel === 'high' && grd.guardrails.escalationRules.length < 2) {
      gaps.push({
        severity: 'critical',
        category: 'escalation',
        description: 'High autonomy systems require multiple escalation paths',
      });
    }

    return gaps;
  }
}
