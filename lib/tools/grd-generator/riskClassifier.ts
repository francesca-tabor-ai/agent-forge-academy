// AI Risk Classification Engine

import { GovernanceSignals, AIClassification, AIClass, RiskLevel } from './types';

export class AIRiskClassifier {
  /**
   * Classify AI system based on governance signals
   */
  classify(signals: GovernanceSignals): AIClassification {
    const riskScore = this.calculateRiskScore(signals);
    const aiClass = this.mapToClass(riskScore, signals);
    const riskLevel = this.mapToRiskLevel(aiClass);
    const rationale = this.generateRationale(signals, aiClass);
    const regulatoryTriggers = this.identifyRegulations(signals);

    return {
      aiClass,
      riskLevel,
      rationale,
      regulatoryTriggers,
      locked: false,
    };
  }

  private calculateRiskScore(signals: GovernanceSignals): number {
    let score = 0;

    // Domain sensitivity (0-30 points)
    if (signals.domainSensitivity === 'high') score += 30;
    else if (signals.domainSensitivity === 'medium') score += 15;
    else score += 5;

    // Autonomy level (0-30 points)
    if (signals.autonomyLevel === 'high') score += 30;
    else if (signals.autonomyLevel === 'medium') score += 15;
    else score += 5;

    // Decision language (0-20 points)
    const { executes, approves, recommends } = signals.decisionLanguage;
    if (executes > 0) score += 20;
    else if (approves > 0) score += 15;
    else if (recommends > 0) score += 10;
    else score += 5;

    // User types (0-10 points)
    if (signals.userTypes.some(ut => ut.type === 'regulator-facing')) score += 10;
    if (signals.userTypes.some(ut => ut.type === 'customer')) score += 5;

    // Geography (0-10 points)
    if (signals.geography.includes('EU') || signals.geography.includes('UK')) score += 10;
    else if (signals.geography.includes('US')) score += 5;

    return Math.min(score, 100); // Cap at 100
  }

  private mapToClass(riskScore: number, signals: GovernanceSignals): AIClass {
    // Class 4: Unacceptable Risk (80-100)
    if (riskScore >= 80) {
      // Additional check: high autonomy + high sensitivity domain
      if (signals.autonomyLevel === 'high' && signals.domainSensitivity === 'high') {
        return 4;
      }
    }

    // Class 3: High Risk (60-79)
    if (riskScore >= 60) {
      // High risk if: high sensitivity domain OR high autonomy
      if (signals.domainSensitivity === 'high' || signals.autonomyLevel === 'high') {
        return 3;
      }
    }

    // Class 2: Limited Risk (30-59)
    if (riskScore >= 30) {
      // Limited risk: some autonomy or medium sensitivity
      if (signals.autonomyLevel === 'medium' || signals.domainSensitivity === 'medium') {
        return 2;
      }
      // Or if it makes recommendations
      if (signals.decisionLanguage.recommends > 0) {
        return 2;
      }
    }

    // Class 1: Minimal Risk (0-29)
    return 1;
  }

  private mapToRiskLevel(aiClass: AIClass): RiskLevel {
    switch (aiClass) {
      case 1:
        return 'minimal';
      case 2:
        return 'limited';
      case 3:
        return 'high';
      case 4:
        return 'unacceptable';
    }
  }

  private generateRationale(signals: GovernanceSignals, aiClass: AIClass): string {
    const parts: string[] = [];

    if (aiClass === 1) {
      parts.push('Minimal risk system providing informational support only.');
    } else if (aiClass === 2) {
      parts.push('Limited risk system providing decision support with human oversight.');
      if (signals.decisionLanguage.recommends > 0) {
        parts.push('Generates recommendations but does not execute autonomously.');
      }
    } else if (aiClass === 3) {
      parts.push('High risk system operating in a regulated domain or with significant autonomy.');
      if (signals.domainSensitivity === 'high') {
        parts.push(`Operates in high-sensitivity domain (${this.getDomainDescription(signals)}).`);
      }
      if (signals.autonomyLevel === 'high') {
        parts.push('Has high autonomy in decision-making.');
      }
    } else {
      parts.push('Unacceptable risk system with autonomous high-stakes decision-making.');
      parts.push('Requires immediate review and may not be deployable without significant safeguards.');
    }

    return parts.join(' ');
  }

  private getDomainDescription(signals: GovernanceSignals): string {
    // This would be enhanced with actual domain detection
    if (signals.dataSources.some(ds => ds.includes('health') || ds.includes('medical'))) {
      return 'healthcare';
    }
    if (signals.dataSources.some(ds => ds.includes('financial') || ds.includes('credit'))) {
      return 'finance';
    }
    if (signals.dataSources.some(ds => ds.includes('employment') || ds.includes('hiring'))) {
      return 'employment';
    }
    return 'regulated';
  }

  private identifyRegulations(signals: GovernanceSignals): string[] {
    const regulations: string[] = [];

    // EU AI Act
    if (signals.geography.includes('EU') || signals.geography.includes('UK')) {
      if (signals.domainSensitivity === 'high' || signals.autonomyLevel === 'high') {
        regulations.push('EU AI Act: High Risk');
      } else {
        regulations.push('EU AI Act: Limited Risk');
      }
    }

    // GDPR
    if (signals.dataSources.some(ds => ds.includes('personal') || ds.includes('customer'))) {
      regulations.push('GDPR: Personal Data Processing');
    }

    // Domain-specific regulations
    if (signals.dataSources.some(ds => ds.includes('health') || ds.includes('medical'))) {
      regulations.push('MDR: Medical Device Regulation');
      if (signals.geography.includes('US')) {
        regulations.push('HIPAA: Health Information Privacy');
      }
    }

    if (signals.dataSources.some(ds => ds.includes('financial') || ds.includes('credit'))) {
      if (signals.geography.includes('UK')) {
        regulations.push('FCA: Consumer Duty');
      }
    }

    if (signals.dataSources.some(ds => ds.includes('employment') || ds.includes('hiring'))) {
      regulations.push('Employment Law: Discrimination Risk');
    }

    return regulations;
  }
}
