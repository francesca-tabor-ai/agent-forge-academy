/**
 * Tool recommendation engine
 * Analyzes user signals (courses, skills, projects) to recommend tools
 */

export interface ToolRecommendation {
  toolId: string;
  toolName: string;
  toolSlug: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
  website_url: string | null;
  reason: string;
  score: number;
  source: 'course' | 'skill' | 'project' | 'complement';
}

export interface UnlockedOfferRecommendation {
  offerId: string;
  offerTitle: string;
  toolName: string;
  toolSlug: string;
  requiredCourseId: string;
  requiredCourseTitle: string;
  requiredCourseSlug: string;
  valueDisplay: string | null;
  reason: string;
}

/**
 * Calculate recommendation score based on multiple signals
 */
export function calculateRecommendationScore(
  tool: any,
  enrolledCourseIds: Set<string>,
  completedCourseIds: Set<string>,
  userSkills: string[],
  projectToolIds: Set<string>
): { score: number; reason: string; source: 'course' | 'skill' | 'project' | 'complement' } {
  let score = 0;
  const reasons: string[] = [];
  let source: 'course' | 'skill' | 'project' | 'complement' = 'complement';

  // Signal 1: Tool is taught in enrolled courses (high weight)
  if (tool.courseIds && tool.courseIds.length > 0) {
    const enrolledCount = tool.courseIds.filter((id: string) => enrolledCourseIds.has(id)).length;
    const completedCount = tool.courseIds.filter((id: string) => completedCourseIds.has(id)).length;
    
    if (enrolledCount > 0 && completedCount === 0) {
      score += 50; // High priority: enrolled but not completed
      reasons.push(`Taught in ${enrolledCount} enrolled course${enrolledCount > 1 ? 's' : ''}`);
      source = 'course';
    } else if (completedCount > 0) {
      score += 10; // Lower priority: already completed courses
      reasons.push(`Already learned in ${completedCount} course${completedCount > 1 ? 's' : ''}`);
    }
  }

  // Signal 2: Tool complements existing project tools (medium weight)
  if (projectToolIds.size > 0) {
    // Check if tool is commonly used with project tools
    // For now, we'll give a boost if user has projects but doesn't use this tool
    if (!projectToolIds.has(tool.id)) {
      score += 30;
      reasons.push('Complements tools in your projects');
      if (source === 'complement') source = 'project';
    }
  }

  // Signal 3: Tool matches user skills (lower weight, but still relevant)
  if (tool.category && userSkills.length > 0) {
    const skillMatch = userSkills.some(skill => 
      tool.category.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(tool.category.toLowerCase())
    );
    if (skillMatch) {
      score += 20;
      reasons.push('Matches your skills');
      if (source === 'complement') source = 'skill';
    }
  }

  // Signal 4: Tool has gated offers (bonus)
  if (tool.hasGatedOffers) {
    score += 15;
    reasons.push('Has offers you can unlock');
  }

  const reason = reasons.length > 0 ? reasons.join(', ') : 'Recommended for you';

  return { score, reason, source };
}

/**
 * Filter out tools user already has proficiency in
 */
export function filterAlreadyProficient(
  tools: ToolRecommendation[],
  userProficiencies: Set<string>
): ToolRecommendation[] {
  return tools.filter(tool => !userProficiencies.has(tool.toolId));
}
