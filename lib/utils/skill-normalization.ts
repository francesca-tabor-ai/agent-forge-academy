/**
 * Skill Normalization Utilities
 * 
 * Site-wide rules for normalizing skill strings, particularly for
 * ensuring "AI" is always uppercase while preserving other formatting.
 */

/**
 * Normalizes "AI" to always be uppercase in skill strings.
 * Uses word boundaries to avoid touching words like "OpenAI".
 * 
 * @param skill - The skill string to normalize
 * @returns The skill string with "AI" normalized to uppercase
 * 
 * @example
 * normalizeSkillAI("Generative Ai") // "Generative AI"
 * normalizeSkillAI("ai product") // "AI product"
 * normalizeSkillAI("OpenAI Tools") // "OpenAI Tools" (unchanged)
 */
export function normalizeSkillAI(skill: string): string {
  if (!skill || typeof skill !== 'string') {
    return skill;
  }
  
  // Use word boundaries to match standalone "ai" tokens
  // This avoids touching words like "OpenAI", "Haiti", etc.
  return skill.replace(/\bai\b/gi, 'AI');
}

/**
 * Normalizes an array of skills, applying AI normalization to each.
 * 
 * @param skills - Array of skill strings to normalize
 * @returns Array of normalized skill strings
 */
export function normalizeSkillsAI(skills: string[]): string[] {
  if (!Array.isArray(skills)) {
    return skills;
  }
  
  return skills.map(skill => normalizeSkillAI(skill));
}
