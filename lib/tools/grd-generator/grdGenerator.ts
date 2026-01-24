// GRD Generation Engine

import {
  GRD,
  GovernanceSignals,
  AIClassification,
  LineageRequirements,
  EvaluationRequirements,
  Guardrails,
  ReleaseControls,
  Ownership,
  RegulatoryMapping,
  EscalationRule,
} from './types';

export class GRDGenerator {
  /**
   * Generate a complete GRD from PRD, signals, and classification
   */
  generate(
    prdReference: string,
    prdText: string,
    signals: GovernanceSignals,
    classification: AIClassification
  ): GRD {
    const now = new Date().toISOString();

    return {
      version: '1.0',
      prdReference,
      prdText,
      classification,
      lineageRequirements: this.generateLineageRequirements(classification),
      evaluationRequirements: this.generateEvaluationRequirements(classification, signals),
      guardrails: this.generateGuardrails(signals, classification),
      releaseControls: this.generateReleaseControls(classification, signals),
      ownership: this.generateOwnership(),
      regulatoryMapping: this.generateRegulatoryMapping(classification, signals),
      gaps: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  private generateLineageRequirements(classification: AIClassification): LineageRequirements {
    const baseFields = ['timestamp', 'user_id', 'session_id'];

    switch (classification.aiClass) {
      case 1:
        return {
          requiredFields: [...baseFields, 'action_type'],
          retentionPeriodMonths: 6,
          auditAccess: ['Security'],
        };
      case 2:
        return {
          requiredFields: [...baseFields, 'model_version', 'prompt_version', 'retrieval_source_ids'],
          retentionPeriodMonths: 24,
          auditAccess: ['Risk', 'Legal', 'Security'],
        };
      case 3:
        return {
          requiredFields: [
            ...baseFields,
            'model_version',
            'prompt_version',
            'retrieval_source_ids',
            'decision_inputs',
            'decision_outputs',
            'confidence_scores',
          ],
          retentionPeriodMonths: 36,
          auditAccess: ['Risk', 'Legal', 'Security', 'Compliance'],
        };
      case 4:
        return {
          requiredFields: [
            ...baseFields,
            'model_version',
            'prompt_version',
            'retrieval_source_ids',
            'decision_inputs',
            'decision_outputs',
            'confidence_scores',
            'escalation_events',
            'human_review_flags',
          ],
          retentionPeriodMonths: 60,
          auditAccess: ['Risk', 'Legal', 'Security', 'Compliance', 'Executive'],
        };
    }
  }

  private generateEvaluationRequirements(
    classification: AIClassification,
    signals: GovernanceSignals
  ): EvaluationRequirements {
    const mandatoryTests: string[] = [];
    const thresholds: Record<string, string> = {};

    if (classification.aiClass >= 2) {
      mandatoryTests.push('accuracy', 'hallucination_detection');
      thresholds['accuracy'] = '>=97%';
      thresholds['unsupported_claims'] = '<=0.5%';
    }

    if (signals.domainSensitivity === 'high') {
      mandatoryTests.push('bias_evaluation', 'fairness_metrics');
      thresholds['bias_score'] = '<=0.1';
      thresholds['fairness_ratio'] = '>=0.9';
    }

    if (signals.autonomyLevel === 'high') {
      mandatoryTests.push('adversarial_testing', 'safety_benchmarks');
      thresholds['adversarial_robustness'] = '>=95%';
    }

    if (classification.aiClass >= 3) {
      mandatoryTests.push('regulatory_compliance_test', 'audit_trail_verification');
    }

    return {
      mandatoryTests,
      thresholds,
      cadence: classification.aiClass >= 3 
        ? 'on_model_change + weekly_in_prod' 
        : 'on_model_change + monthly_in_prod',
    };
  }

  private generateGuardrails(
    signals: GovernanceSignals,
    classification: AIClassification
  ): Guardrails {
    const allowedIntents: string[] = [];
    const disallowedIntents: string[] = [];
    const escalationRules: EscalationRule[] = [];
    const refusalPatterns: string[] = [];

    // Generate allowed intents based on PRD signals
    if (signals.decisionLanguage.informs > 0) {
      allowedIntents.push('informational', 'data_retrieval');
    }
    if (signals.decisionLanguage.recommends > 0) {
      allowedIntents.push('recommendation_non_binding', 'suggestion');
    }

    // Generate disallowed intents based on domain and autonomy
    if (signals.domainSensitivity === 'high') {
      if (signals.dataSources.some(ds => ds.includes('health') || ds.includes('medical'))) {
        disallowedIntents.push('medical_diagnosis', 'treatment_planning', 'prescription');
        refusalPatterns.push('I cannot provide medical advice or diagnoses');
      }
      if (signals.dataSources.some(ds => ds.includes('financial') || ds.includes('credit'))) {
        disallowedIntents.push('credit_approval', 'loan_decision', 'investment_advice');
        refusalPatterns.push('I cannot make financial decisions or provide investment advice');
      }
      if (signals.dataSources.some(ds => ds.includes('employment') || ds.includes('hiring'))) {
        disallowedIntents.push('hiring_decision', 'termination', 'promotion_decision');
        refusalPatterns.push('I cannot make employment decisions');
      }
    }

    if (classification.aiClass >= 3) {
      disallowedIntents.push('legal_advice', 'final_approval', 'autonomous_execution');
      refusalPatterns.push('This requires human review and approval');
    }

    // Generate escalation rules
    if (classification.aiClass >= 2) {
      escalationRules.push({
        condition: 'confidence < 0.8',
        action: 'human_review',
      });
    }

    if (classification.aiClass >= 3) {
      escalationRules.push({
        condition: 'detected_bias_score > 0.1',
        action: 'escalate_to_risk_team',
      });
      escalationRules.push({
        condition: 'regulatory_trigger_detected',
        action: 'escalate_to_legal',
      });
    }

    return {
      allowedIntents,
      disallowedIntents,
      escalationRules,
      refusalPatterns,
    };
  }

  private generateReleaseControls(
    classification: AIClassification,
    signals: GovernanceSignals
  ): ReleaseControls {
    let stage: 'internal' | 'guarded_ga' | 'public_ga' = 'internal';
    let userCap: number | undefined = undefined;
    const killSwitchRequired = classification.aiClass >= 3;

    if (classification.aiClass === 1) {
      stage = 'public_ga';
    } else if (classification.aiClass === 2) {
      stage = 'guarded_ga';
      userCap = 1000;
    } else {
      stage = 'guarded_ga';
      userCap = 500;
    }

    return {
      stage,
      userCap,
      geography: signals.geography.length > 0 ? signals.geography : ['Global'],
      killSwitchRequired,
    };
  }

  private generateOwnership(): Ownership {
    // Default ownership - to be filled by user
    return {
      productOwner: 'TBD',
      modelOwner: 'TBD',
      riskOwner: 'TBD',
      businessOwner: 'TBD',
      legalOwner: 'TBD',
    };
  }

  private generateRegulatoryMapping(
    classification: AIClassification,
    signals: GovernanceSignals
  ): RegulatoryMapping {
    const mapping: RegulatoryMapping = {};

    classification.regulatoryTriggers.forEach(trigger => {
      if (trigger.includes('EU AI Act')) {
        mapping.eu_ai_act = classification.aiClass >= 3 ? 'high_risk' : 'limited_risk';
      }
      if (trigger.includes('GDPR')) {
        mapping.gdpr = 'personal_data_present';
      }
      if (trigger.includes('HIPAA')) {
        mapping.hipaa = 'applicable';
      }
      if (trigger.includes('MDR')) {
        mapping.mdr = 'applicable';
      }
      if (trigger.includes('FCA')) {
        mapping.fca = 'consumer_duty_relevant';
      }
    });

    return mapping;
  }
}
