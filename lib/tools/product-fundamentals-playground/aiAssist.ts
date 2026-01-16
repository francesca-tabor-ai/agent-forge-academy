import type { Persona, ProblemStatement } from './types';

interface ResearchInsights {
  recurringPains: string[];
  tentativePersonas: Omit<Persona, 'id'>[];
  draftProblemStatements: Omit<ProblemStatement, 'id'>[];
}

/**
 * Deterministic heuristic summarizer for research notes.
 * Extracts insights using simple keyword clustering and pattern matching.
 */
export function generateResearchInsights(notes: string): ResearchInsights {
  if (!notes || notes.trim().length === 0) {
    return {
      recurringPains: [],
      tentativePersonas: [],
      draftProblemStatements: [],
    };
  }

  const text = notes.toLowerCase();
  const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 10);

  // Extract recurring pains using keyword patterns
  const painKeywords = [
    'frustrated', 'difficult', 'hard', 'challenging', 'problem', 'issue', 'pain',
    'struggle', 'annoying', 'slow', 'broken', 'doesn\'t work', 'can\'t', 'unable',
    'waste', 'inefficient', 'complicated', 'confusing', 'time-consuming'
  ];

  const recurringPains: string[] = [];
  const painSentences = sentences.filter(s => {
    const lower = s.toLowerCase();
    return painKeywords.some(keyword => lower.includes(keyword));
  });

  // Extract unique pain points (simple deduplication)
  const seenPains = new Set<string>();
  painSentences.slice(0, 5).forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 20 && trimmed.length < 200 && !seenPains.has(trimmed.toLowerCase())) {
      seenPains.add(trimmed.toLowerCase());
      recurringPains.push(trimmed);
    }
  });

  // Extract tentative personas (look for role/job mentions)
  const roleKeywords = [
    'manager', 'owner', 'director', 'coordinator', 'specialist', 'analyst',
    'developer', 'designer', 'teacher', 'student', 'patient', 'customer',
    'user', 'admin', 'executive', 'founder', 'entrepreneur'
  ];

  const tentativePersonas: Omit<Persona, 'id'>[] = [];
  const personaSentences = sentences.filter(s => {
    const lower = s.toLowerCase();
    return roleKeywords.some(keyword => lower.includes(keyword));
  });

  // Extract 2-3 personas
  const seenRoles = new Set<string>();
  personaSentences.slice(0, 3).forEach(sentence => {
    const lower = sentence.toLowerCase();
    const role = roleKeywords.find(keyword => lower.includes(keyword));
    
    if (role && !seenRoles.has(role)) {
      seenRoles.add(role);
      const archetype = role.charAt(0).toUpperCase() + role.slice(1);
      tentativePersonas.push({
        name: `The ${archetype}`,
        archetype,
        goals: extractGoals(sentence, sentences),
        painPoints: extractPainPoints(sentence, sentences),
        quotes: [sentence.trim()],
      });
    }
  });

  // If no personas found, create generic ones
  if (tentativePersonas.length === 0 && sentences.length > 0) {
    tentativePersonas.push({
      name: 'Primary User',
      archetype: 'End User',
      goals: ['Complete tasks efficiently', 'Achieve desired outcomes'],
      painPoints: recurringPains.slice(0, 2),
      quotes: sentences.slice(0, 1).map(s => s.trim()),
    });
  }

  // Extract draft problem statements
  const draftProblemStatements: Omit<ProblemStatement, 'id'>[] = [];
  
  // Look for problem patterns: "X needs Y because Z"
  const problemPatterns = [
    /(?:users?|people|they|we|i)\s+(?:need|want|require|must)\s+([^,\.]+)/gi,
    /(?:the|a)\s+(?:problem|issue|challenge)\s+(?:is|with)\s+([^,\.]+)/gi,
  ];

  const problemSentences = sentences.filter(s => {
    const lower = s.toLowerCase();
    return problemPatterns.some(pattern => pattern.test(s)) ||
           (lower.includes('need') && lower.includes('because'));
  });

  problemSentences.slice(0, 3).forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 30) {
      // Extract "who" (look for role or "users", "people", etc.)
      let who = 'Users';
      const roleMatch = roleKeywords.find(keyword => trimmed.toLowerCase().includes(keyword));
      if (roleMatch) {
        who = roleMatch.charAt(0).toUpperCase() + roleMatch.slice(1) + 's';
      }

      // Extract "need" (look for "need", "want", "require")
      const needMatch = trimmed.match(/(?:need|want|require|must)\s+([^,\.]+)/i);
      const need = needMatch ? needMatch[1].trim() : 'better solution';

      // Extract "because" (look for "because", "since", "due to")
      const becauseMatch = trimmed.match(/(?:because|since|due to)\s+([^,\.]+)/i);
      const because = becauseMatch ? becauseMatch[1].trim() : 'current solutions are inadequate';

      draftProblemStatements.push({
        who,
        need,
        because,
        evidence: trimmed,
        successMetric: 'User satisfaction and task completion rate',
        rationale: '', // User must fill this in
        linkedPersonaIds: [],
      });
    }
  });

  // If no problem statements found, create from recurring pains
  if (draftProblemStatements.length === 0 && recurringPains.length > 0) {
    recurringPains.slice(0, 2).forEach(pain => {
      draftProblemStatements.push({
        who: 'Users',
        need: 'A solution to address this pain point',
        because: pain.toLowerCase(),
        evidence: pain,
        successMetric: 'Reduction in reported pain points',
        rationale: '', // User must fill this in
        linkedPersonaIds: [],
      });
    });
  }

  return {
    recurringPains: recurringPains.slice(0, 5),
    tentativePersonas: tentativePersonas.slice(0, 3),
    draftProblemStatements: draftProblemStatements.slice(0, 3),
  };
}

function extractGoals(sentence: string, allSentences: string[]): string[] {
  const goals: string[] = [];
  const goalKeywords = ['want', 'goal', 'achieve', 'accomplish', 'improve', 'increase', 'reduce'];
  
  const lower = sentence.toLowerCase();
  goalKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      const match = sentence.match(new RegExp(`(?:${keyword})\\s+([^,\.]+)`, 'i'));
      if (match) {
        goals.push(match[1].trim());
      }
    }
  });

  return goals.length > 0 ? goals.slice(0, 3) : ['Complete tasks efficiently'];
}

function extractPainPoints(sentence: string, allSentences: string[]): string[] {
  const painPoints: string[] = [];
  const painKeywords = ['frustrated', 'difficult', 'hard', 'problem', 'issue', 'pain'];
  
  const lower = sentence.toLowerCase();
  painKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      const match = sentence.match(new RegExp(`(?:${keyword})\\s+([^,\.]+)`, 'i'));
      if (match) {
        painPoints.push(match[1].trim());
      }
    }
  });

  return painPoints.length > 0 ? painPoints.slice(0, 3) : [];
}
