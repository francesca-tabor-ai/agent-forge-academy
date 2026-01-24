// Signal extraction engine for PRD parsing

import { GovernanceSignals, UserType, DecisionLanguagePattern, FailureMode } from './types';

export class SignalExtractor {
  /**
   * Extract all governance-relevant signals from PRD text
   */
  async extractSignals(prdText: string): Promise<GovernanceSignals> {
    const userTypes = this.extractUserTypes(prdText);
    const decisionLanguage = this.extractDecisionLanguage(prdText);
    const domainSensitivity = this.classifyDomain(prdText);
    const autonomyLevel = this.analyzeAutonomy(prdText);
    const dataSources = this.extractDataSources(prdText);
    const geography = this.extractGeography(prdText);
    const failureModes = this.detectFailureModes(prdText);

    return {
      userTypes,
      decisionLanguage,
      domainSensitivity,
      autonomyLevel,
      dataSources,
      geography,
      failureModes,
    };
  }

  private extractUserTypes(text: string): UserType[] {
    const userTypes: UserType[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('internal') || lowerText.includes('employee') || lowerText.includes('staff')) {
      userTypes.push({ type: 'internal' });
    }
    if (lowerText.includes('customer') || lowerText.includes('user') || lowerText.includes('client')) {
      userTypes.push({ type: 'customer' });
    }
    if (lowerText.includes('regulator') || lowerText.includes('audit') || lowerText.includes('compliance')) {
      userTypes.push({ type: 'regulator-facing' });
    }
    if (lowerText.includes('partner') || lowerText.includes('vendor') || lowerText.includes('third-party')) {
      userTypes.push({ type: 'partner' });
    }

    return userTypes.length > 0 ? userTypes : [{ type: 'customer' }];
  }

  private extractDecisionLanguage(text: string): DecisionLanguagePattern {
    const lowerText = text.toLowerCase();
    
    return {
      recommends: (lowerText.match(/\b(recommends?|suggests?|proposes?)\b/g) || []).length,
      approves: (lowerText.match(/\b(approves?|authorizes?|sanctions?)\b/g) || []).length,
      executes: (lowerText.match(/\b(executes?|automatically|autonomously|decides?)\b/g) || []).length,
      informs: (lowerText.match(/\b(informs?|displays?|shows?|provides?)\b/g) || []).length,
    };
  }

  private classifyDomain(text: string): 'low' | 'medium' | 'high' {
    const lowerText = text.toLowerCase();
    
    // High sensitivity domains
    const highSensitivityKeywords = [
      'healthcare', 'medical', 'diagnostic', 'treatment', 'patient',
      'financial', 'credit', 'loan', 'investment', 'trading',
      'employment', 'hiring', 'firing', 'promotion', 'salary',
      'legal', 'court', 'judgment', 'litigation',
    ];
    
    // Medium sensitivity domains
    const mediumSensitivityKeywords = [
      'education', 'student', 'grades',
      'housing', 'rental', 'mortgage',
      'insurance', 'claims',
    ];

    if (highSensitivityKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    }
    if (mediumSensitivityKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  private analyzeAutonomy(text: string): 'low' | 'medium' | 'high' {
    const lowerText = text.toLowerCase();
    
    const highAutonomyPatterns = [
      /\b(will automatically|autonomously decides?|executes without|without approval|without human)\b/gi,
    ];
    
    const mediumAutonomyPatterns = [
      /\b(recommends?|suggests?|proposes for review)\b/gi,
    ];
    
    const lowAutonomyPatterns = [
      /\b(provides information|displays options|supports analysis|informational)\b/gi,
    ];

    const highMatches = highAutonomyPatterns.reduce((count, pattern) => 
      count + (lowerText.match(pattern) || []).length, 0
    );
    const mediumMatches = mediumAutonomyPatterns.reduce((count, pattern) => 
      count + (lowerText.match(pattern) || []).length, 0
    );
    const lowMatches = lowAutonomyPatterns.reduce((count, pattern) => 
      count + (lowerText.match(pattern) || []).length, 0
    );

    if (highMatches > 0) return 'high';
    if (mediumMatches > 0) return 'medium';
    return 'low';
  }

  private extractDataSources(text: string): string[] {
    const dataSourcePatterns = [
      /\b(customer|user|patient|client)\s+(data|records?|information|health records?|financial records?)\b/gi,
      /\b(database|data warehouse|data lake|api|third.?party)\b/gi,
      /\b(external|internal)\s+(data|source|system)\b/gi,
    ];

    const sources = new Set<string>();
    dataSourcePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => sources.add(match.toLowerCase().trim()));
      }
    });

    return Array.from(sources);
  }

  private extractGeography(text: string): string[] {
    const geographyPatterns = [
      /\b(EU|Europe|European Union)\b/gi,
      /\b(UK|United Kingdom|Britain)\b/gi,
      /\b(US|USA|United States|America)\b/gi,
      /\b(APAC|Asia|China|Japan|India)\b/gi,
    ];

    const regions = new Set<string>();
    geographyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const normalized = match.toUpperCase();
          if (normalized.includes('EU') || normalized.includes('EUROPE')) {
            regions.add('EU');
          } else if (normalized.includes('UK') || normalized.includes('BRITAIN')) {
            regions.add('UK');
          } else if (normalized.includes('US') || normalized.includes('USA') || normalized.includes('AMERICA')) {
            regions.add('US');
          } else if (normalized.includes('APAC') || normalized.includes('ASIA')) {
            regions.add('APAC');
          }
        });
      }
    });

    return Array.from(regions).length > 0 ? Array.from(regions) : ['Global'];
  }

  private detectFailureModes(text: string): FailureMode {
    const lowerText = text.toLowerCase();
    
    const explicitPatterns = [
      /(?:failure|error|bug|issue|problem|risk).*?(?:could|might|may|will)\s+(?:result|lead|cause|create)\s+in\s+([^.]+)/gi,
      /(?:if|when)\s+([^,]+?)\s+(?:fails?|errors?|breaks?)/gi,
    ];

    const explicit: string[] = [];
    explicitPatterns.forEach(pattern => {
      const matches = lowerText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/^(failure|error|bug|issue|problem|risk|if|when)\s+/i, '').trim();
          if (cleaned.length > 10) {
            explicit.push(cleaned);
          }
        });
      }
    });

    // Inferred failure modes based on domain
    const inferred: string[] = [];
    if (lowerText.includes('healthcare') || lowerText.includes('medical')) {
      inferred.push('privacy breach', 'incorrect diagnosis', 'patient harm');
    }
    if (lowerText.includes('financial') || lowerText.includes('credit')) {
      inferred.push('financial loss', 'discrimination', 'regulatory violation');
    }
    if (lowerText.includes('employment') || lowerText.includes('hiring')) {
      inferred.push('discrimination', 'bias in hiring', 'legal liability');
    }
    if (lowerText.includes('personal') || lowerText.includes('customer data')) {
      inferred.push('privacy breach', 'data leak', 'GDPR violation');
    }

    return {
      explicit: explicit.slice(0, 5), // Limit to 5 explicit failures
      inferred: inferred.slice(0, 5), // Limit to 5 inferred failures
    };
  }
}
