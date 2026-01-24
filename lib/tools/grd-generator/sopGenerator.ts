// SOP (Standard Operating Procedures) Generator

import { GovernanceSignals, AIClassification } from './types';

export interface SOPStep {
  title: string;
  substeps: string[];
}

export interface SOP {
  jobRole: string;
  tools: string[];
  steps: SOPStep[];
  deliverables: string[];
}

export class SOPGenerator {
  /**
   * Generate Standard Operating Procedures for all governance requirements
   */
  generateSOPs(signals: GovernanceSignals, classification: AIClassification): {
    lineage: SOP;
    evaluation: SOP;
    guardrails: SOP;
    release: SOP;
    ownership: SOP;
    regulatory: SOP;
  } {
    return {
      lineage: this.generateLineageSOP(classification),
      evaluation: this.generateEvaluationSOP(signals, classification),
      guardrails: this.generateGuardrailsSOP(signals, classification),
      release: this.generateReleaseSOP(signals, classification),
      ownership: this.generateOwnershipSOP(classification),
      regulatory: this.generateRegulatorySOP(signals, classification),
    };
  }

  private generateLineageSOP(classification: AIClassification): SOP {
    const retentionMonths = classification.aiClass === 1 ? 6 : classification.aiClass === 2 ? 24 : classification.aiClass === 3 ? 36 : 60;
    
    return {
      jobRole: 'ML Operations Engineer',
      tools: [
        'Observability Platform (Datadog/New Relic)',
        'Log aggregation system (Splunk/ELK)',
        'Version control (Git)',
        'Model registry (MLflow/W&B)',
      ],
      steps: [
        {
          title: 'Configure Logging Infrastructure',
          substeps: [
            'Set up structured logging pipeline in observability platform',
            `Define log schema with required fields: ${this.getRequiredFields(classification).join(', ')}`,
            `Configure log retention policy to ${retentionMonths} months in storage settings`,
            'Set up automated archival to cold storage after 6 months',
          ],
        },
        {
          title: 'Implement Traceability Tags',
          substeps: [
            'Add model version tagging to every inference call',
            'Implement prompt version tracking with Git commit SHA',
            'Tag retrieval source IDs for every RAG query',
            'Capture user context (user_id, session_id, timestamp)',
          ],
        },
        {
          title: 'Set Up Audit Access Controls',
          substeps: [
            'Create read-only audit access groups for Risk, Legal, Security teams',
            'Configure RBAC policies in observability platform',
            'Set up audit trail for who accessed what logs and when',
            'Document access request process in wiki',
          ],
        },
        {
          title: 'Validate Lineage Tracking',
          substeps: [
            'Run test inference and verify all required fields are logged',
            'Check log query performance for audit queries',
            'Validate retention policy is enforced',
            'Document troubleshooting runbook',
          ],
        },
      ],
      deliverables: [
        'Logging infrastructure dashboard',
        'Audit access documentation',
        'Lineage validation report',
      ],
    };
  }

  private generateEvaluationSOP(signals: GovernanceSignals, classification: AIClassification): SOP {
    const baseAccuracy = signals.domainSensitivity === 'high' ? 98 : 97;
    const cadence = classification.aiClass >= 3 ? 'on_model_change + weekly_in_prod' : 'on_model_change + monthly_in_prod';
    
    return {
      jobRole: 'ML Quality Assurance Engineer',
      tools: [
        'Evaluation framework (MLflow/TruLens)',
        'Ground truth dataset repository',
        'CI/CD pipeline (GitHub Actions/Jenkins)',
        'Bias detection toolkit (AI Fairness 360/Fairlearn)',
      ],
      steps: [
        {
          title: 'Build Ground Truth Dataset',
          substeps: [
            'Collect representative samples across all use cases',
            'Label samples with correct outputs (minimum 500 samples)',
            'Include edge cases and failure scenarios',
            'Version and store dataset in model registry',
            'Document dataset composition and labeling criteria',
          ],
        },
        {
          title: 'Implement Accuracy Testing',
          substeps: [
            'Write evaluation script comparing model output to ground truth',
            `Set accuracy threshold to ${baseAccuracy}%`,
            'Implement statistical significance tests',
            'Add evaluation to CI/CD pipeline on every model change',
          ],
        },
        {
          title: 'Configure Hallucination Detection',
          substeps: [
            'Implement citation verification (all claims must have sources)',
            'Set up unsupported claims detector (threshold ≤ 0.5%)',
            'Add hallucination checks to evaluation pipeline',
            'Flag responses with low confidence scores for review',
          ],
        },
        {
          title: 'Set Up Bias Monitoring',
          substeps: [
            'Define protected attributes relevant to use case',
            'Run bias detection across demographic groups',
            'Set bias score threshold (< 0.15)',
            'Generate bias report for each evaluation run',
          ],
        },
        {
          title: 'Schedule Production Evaluations',
          substeps: [
            `Configure ${cadence.includes('weekly') ? 'weekly' : 'monthly'} automated evaluation runs in production`,
            'Set up alerting when thresholds are breached',
            'Create dashboard showing evaluation metrics over time',
            'Document investigation process for failed evaluations',
          ],
        },
      ],
      deliverables: [
        'Ground truth dataset',
        'Evaluation test suite',
        `${cadence.includes('weekly') ? 'Weekly' : 'Monthly'} evaluation reports`,
        'Bias analysis dashboard',
      ],
    };
  }

  private generateGuardrailsSOP(signals: GovernanceSignals, classification: AIClassification): SOP {
    return {
      jobRole: 'AI Safety Engineer',
      tools: [
        'Guardrail framework (NeMo Guardrails/Guardrails AI)',
        'Prompt firewall',
        'Intent classifier',
        'Content moderation API',
      ],
      steps: [
        {
          title: 'Define Allowed Intents',
          substeps: [
            'Document all legitimate use cases and intents',
            'Create intent classification taxonomy',
            'Build training dataset for intent classifier',
            'Set confidence threshold for intent detection (≥ 0.85)',
          ],
        },
        {
          title: 'Configure Disallowed Intents',
          substeps: [
            'List prohibited intents: legal advice, medical diagnosis, financial decisions, final approvals',
            'Implement rule-based blocklist for restricted topics',
            'Add semantic similarity checks to catch rephrased attempts',
            'Define refusal messages for each blocked intent category',
          ],
        },
        {
          title: 'Implement Escalation Rules',
          substeps: [
            'Set low confidence threshold (< 0.7) → route to human review',
            'Configure restricted prompt detection → return refusal message',
            'Set up out-of-scope detector → redirect to appropriate resource',
            'Create escalation dashboard for human reviewers',
          ],
        },
        {
          title: 'Deploy Prompt Injection Protection',
          substeps: [
            'Implement input sanitization and validation',
            'Add prompt injection pattern detection',
            'Set up adversarial testing suite',
            'Configure automated blocking for detected attacks',
          ],
        },
        {
          title: 'Test Guardrail Coverage',
          substeps: [
            'Run adversarial test suite (minimum 200 attack vectors)',
            'Validate all disallowed intents are blocked',
            'Check false positive rate on allowed intents (< 2%)',
            'Document bypass attempts and remediation',
          ],
        },
      ],
      deliverables: [
        'Guardrail configuration file',
        'Intent taxonomy documentation',
        'Adversarial test report',
        'Human review dashboard',
      ],
    };
  }

  private generateReleaseSOP(signals: GovernanceSignals, classification: AIClassification): SOP {
    const stage = classification.aiClass === 1 ? 'Public GA' : classification.aiClass >= 3 ? 'Limited Beta' : 'Guarded GA';
    const userCap = classification.aiClass === 1 ? undefined : classification.aiClass >= 3 ? 100 : 500;
    
    return {
      jobRole: 'Release Manager',
      tools: [
        'Feature flag system (LaunchDarkly/Split)',
        'Monitoring dashboard (Grafana/Datadog)',
        'Incident management (PagerDuty)',
        'User access management',
      ],
      steps: [
        {
          title: 'Configure Release Stage',
          substeps: [
            `Set release stage to ${stage}`,
            'Define success criteria for stage graduation',
            'Document rollback triggers and procedures',
            'Set up release approval workflow',
          ],
        },
        {
          title: 'Implement User Caps',
          substeps: userCap ? [
            `Configure user allowlist with cap of ${userCap} users`,
            'Set up user enrollment process',
            'Implement hard limit enforcement at API gateway',
            'Create waitlist for additional users',
          ] : [
            'No user cap required for this risk level',
            'Monitor usage patterns for capacity planning',
          ],
        },
        {
          title: 'Set Geographic Restrictions',
          substeps: [
            `Configure geo-fencing for ${signals.geography.join(' + ')} only`,
            'Implement IP-based geographic detection',
            'Add location verification in user profile',
            'Set up rejection message for restricted regions',
          ],
        },
        {
          title: 'Deploy Kill Switch',
          substeps: classification.aiClass >= 3 ? [
            'Implement instant disable flag in feature flag system',
            'Set up kill switch dashboard with one-click disable',
            'Define kill switch activation criteria',
            'Document kill switch procedures and notification process',
            'Grant kill switch access to: Release Manager, VP Engineering, Risk Lead',
          ] : [
            'Kill switch recommended but not required for this risk level',
            'Document manual disable procedures',
          ],
        },
        {
          title: 'Configure Automated Rollback',
          substeps: [
            'Set error rate threshold for auto-rollback (> 5% error rate)',
            'Configure latency threshold (p99 > 2 seconds)',
            'Set evaluation failure trigger for rollback',
            'Implement automated rollback to last stable version',
            'Set up post-rollback investigation process',
          ],
        },
        {
          title: 'Set Up Release Monitoring',
          substeps: [
            'Configure real-time monitoring dashboard with KPIs',
            'Set up alerting for threshold breaches',
            'Create on-call rotation for release monitoring',
            'Schedule daily release health reviews',
          ],
        },
      ],
      deliverables: [
        'Release configuration document',
        'Kill switch runbook',
        'Monitoring dashboard',
        'Rollback automation script',
      ],
    };
  }

  private generateOwnershipSOP(classification: AIClassification): SOP {
    return {
      jobRole: 'Governance Program Manager',
      tools: [
        'RACI matrix template',
        'Stakeholder management tool (JIRA/Asana)',
        'Org chart',
        'Responsibility assignment tool',
      ],
      steps: [
        {
          title: 'Identify Required Owner Roles',
          substeps: [
            'Review GRD to identify all ownership dimensions',
            'Define responsibilities for each owner type',
            'Document decision rights and escalation paths',
            'Create RACI matrix for governance activities',
          ],
        },
        {
          title: 'Assign Product Owner',
          substeps: [
            'Identify PM responsible for feature roadmap',
            'Document responsibilities: PRD maintenance, priority decisions, user feedback',
            'Obtain formal acceptance of ownership',
            'Add owner to all relevant communication channels',
          ],
        },
        {
          title: 'Assign Model Owner',
          substeps: [
            'Identify ML Platform Team lead responsible for model lifecycle',
            'Document responsibilities: model training, evaluation, performance monitoring',
            'Establish SLA for model updates and fixes',
            'Set up regular model review cadence',
          ],
        },
        {
          title: 'Assign Risk Owner',
          substeps: [
            'Identify Compliance Lead for relevant region/domain',
            'Document responsibilities: risk assessment, audit compliance, regulatory reporting',
            'Grant audit access to required systems',
            'Schedule quarterly risk review meetings',
          ],
        },
        {
          title: 'Assign Business Owner',
          substeps: classification.aiClass >= 3 ? [
            'Identify executive sponsor (e.g., Head of GTM Ops)',
            'Document responsibilities: business case, budget approval, strategic decisions',
            'Establish reporting cadence',
            'Define success metrics and OKRs',
          ] : [
            'Business owner optional for low-risk systems',
            'Document escalation path to product owner',
          ],
        },
        {
          title: 'Validate No TBD Owners',
          substeps: [
            'Audit all owner fields in GRD',
            'Block release if any owner is TBD',
            'Escalate unassigned ownership to exec team',
            'Document ownership in single source of truth',
          ],
        },
      ],
      deliverables: [
        'RACI matrix',
        'Owner assignment document',
        'Escalation path diagram',
        'Ownership validation checklist',
      ],
    };
  }

  private generateRegulatorySOP(signals: GovernanceSignals, classification: AIClassification): SOP {
    return {
      jobRole: 'AI Compliance Specialist',
      tools: [
        'Regulatory framework database',
        'Compliance management system',
        'Policy repository',
        'Legal review platform',
      ],
      steps: [
        {
          title: 'Identify Applicable Regulations',
          substeps: [
            'Review deployment geography and identify regional regulations',
            'Analyze domain sensitivity for industry-specific regulations',
            'Check data handling for privacy regulations (GDPR, CCPA)',
            'Consult legal team for regulation interpretation',
          ],
        },
        {
          title: 'Map EU AI Act Requirements',
          substeps: signals.geography.includes('EU') || signals.geography.includes('UK') ? [
            `Classify AI system risk level (${classification.riskLevel})`,
            'Document transparency obligations',
            'Identify required conformity assessments',
            'Map technical documentation requirements',
            'Set up ongoing compliance monitoring',
          ] : [
            'EU AI Act not applicable for this deployment',
            'Document why EU AI Act does not apply',
          ],
        },
        {
          title: 'Map Financial Regulations (if applicable)',
          substeps: signals.dataSources.some(ds => ds.includes('financial') || ds.includes('credit')) ? [
            'Review FCA Consumer Duty requirements',
            'Document fair outcomes obligations',
            'Implement consumer understanding tests',
            'Set up foreseeable harm monitoring',
            'Create consumer communication templates',
          ] : [
            'Financial regulations not applicable',
          ],
        },
        {
          title: 'Map Data Protection Requirements',
          substeps: signals.dataSources.some(ds => ds.includes('personal') || ds.includes('customer')) ? [
            'Conduct Data Protection Impact Assessment (DPIA)',
            'Document legal basis for processing',
            'Implement privacy by design principles',
            'Set up data subject rights fulfillment process',
            'Create data processing agreements',
          ] : [
            'Privacy regulations review recommended',
            'Document data handling practices',
          ],
        },
        {
          title: 'Create Compliance Evidence Pack',
          substeps: [
            'Compile all regulatory mapping documentation',
            'Create evidence of compliance measures',
            'Document risk mitigation strategies',
            'Prepare for regulatory inspection',
            'Set up quarterly compliance reviews',
          ],
        },
      ],
      deliverables: [
        'Regulatory mapping document',
        'DPIA report',
        'Compliance evidence pack',
        'Ongoing monitoring plan',
      ],
    };
  }

  private getRequiredFields(classification: AIClassification): string[] {
    switch (classification.aiClass) {
      case 1:
        return ['timestamp', 'user_id', 'action_type'];
      case 2:
        return ['model_version', 'prompt_version', 'retrieval_source_ids', 'user_id', 'timestamp'];
      case 3:
        return [
          'model_version',
          'prompt_version',
          'retrieval_source_ids',
          'decision_inputs',
          'decision_outputs',
          'confidence_scores',
          'user_id',
          'timestamp',
        ];
      case 4:
        return [
          'model_version',
          'prompt_version',
          'retrieval_source_ids',
          'decision_inputs',
          'decision_outputs',
          'confidence_scores',
          'escalation_events',
          'human_review_flags',
          'user_id',
          'timestamp',
        ];
    }
  }
}
