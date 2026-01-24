// Core data model types for GRD Generator

export type AIClass = 1 | 2 | 3 | 4;
export type RiskLevel = 'minimal' | 'limited' | 'high' | 'unacceptable';
export type AutonomyLevel = 'low' | 'medium' | 'high';
export type DomainSensitivity = 'low' | 'medium' | 'high';
export type GapSeverity = 'blocker' | 'critical' | 'high' | 'medium' | 'low';
export type ReleaseStage = 'internal' | 'guarded_ga' | 'public_ga';

export interface UserType {
  type: 'internal' | 'customer' | 'regulator-facing' | 'partner';
  description?: string;
}

export interface DecisionLanguagePattern {
  recommends: number;
  approves: number;
  executes: number;
  informs: number;
}

export interface FailureMode {
  explicit: string[];
  inferred: string[];
}

export interface GovernanceSignals {
  userTypes: UserType[];
  decisionLanguage: DecisionLanguagePattern;
  domainSensitivity: DomainSensitivity;
  autonomyLevel: AutonomyLevel;
  dataSources: string[];
  geography: string[];
  failureModes: FailureMode;
}

export interface AIClassification {
  aiClass: AIClass;
  riskLevel: RiskLevel;
  rationale: string;
  regulatoryTriggers: string[];
  locked: boolean;
}

export interface LineageRequirements {
  requiredFields: string[];
  retentionPeriodMonths: number;
  auditAccess: string[];
}

export interface EvaluationRequirements {
  mandatoryTests: string[];
  thresholds: Record<string, string>;
  cadence: string;
}

export interface EscalationRule {
  condition: string;
  action: string;
}

export interface Guardrails {
  allowedIntents: string[];
  disallowedIntents: string[];
  escalationRules: EscalationRule[];
  refusalPatterns: string[];
}

export interface ReleaseControls {
  stage: ReleaseStage;
  userCap?: number;
  geography: string[];
  killSwitchRequired: boolean;
}

export interface Ownership {
  productOwner?: string;
  modelOwner?: string;
  riskOwner?: string;
  businessOwner?: string;
  legalOwner?: string;
}

export interface RegulatoryMapping {
  eu_ai_act?: string;
  fca?: string;
  gdpr?: string;
  hipaa?: string;
  mdr?: string;
  [key: string]: string | undefined;
}

export interface Gap {
  severity: GapSeverity;
  category: 'ownership' | 'evaluation' | 'guardrails' | 'regulatory' | 'escalation' | 'other';
  description: string;
  prdSection?: string;
  owner?: string;
  remediation?: string;
}

export interface GRD {
  version: string;
  prdReference: string;
  prdText?: string;
  classification: AIClassification;
  lineageRequirements: LineageRequirements;
  evaluationRequirements: EvaluationRequirements;
  guardrails: Guardrails;
  releaseControls: ReleaseControls;
  ownership: Ownership;
  regulatoryMapping: RegulatoryMapping;
  gaps: Gap[];
  createdAt: string;
  updatedAt: string;
}

export interface PRDInput {
  text: string;
  source?: 'upload' | 'google-doc' | 'confluence' | 'manual';
  url?: string;
}

export interface GRDGeneratorState {
  prdInput: PRDInput | null;
  signals: GovernanceSignals | null;
  classification: AIClassification | null;
  grd: GRD | null;
  isLoading: boolean;
  error: string | null;
  currentStep: 'upload' | 'review' | 'gaps' | 'export';
}
