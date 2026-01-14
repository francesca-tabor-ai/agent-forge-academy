/**
 * Clean CV-extracted bio text to make it LinkedIn-ready
 * - Strips phone/email duplication
 * - Removes CV header text
 * - Collapses repeated bullets
 * - Converts into readable format
 */

// Common CV header patterns to remove
const CV_HEADER_PATTERNS = [
  /^(resume|curriculum vitae|cv|résumé)$/i,
  /^(contact information|contact details|personal information|personal details)$/i,
  /^(objective|summary|profile|about|overview)$/i,
  /^(professional summary|career objective|executive summary)$/i,
  /^(education|experience|work experience|employment history)$/i,
  /^(skills|technical skills|core competencies)$/i,
  /^(references|referees)$/i,
  /^[-=]{3,}$/, // Separator lines
];

// Phone number patterns
const PHONE_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g,
  /\b\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g,
];

// Email pattern
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

/**
 * Clean and format bio text
 */
export function cleanBio(bio: string): string {
  if (!bio || bio.trim().length === 0) {
    return '';
  }

  let cleaned = bio.trim();

  // Step 1: Remove CV header text
  const lines = cleaned.split('\n').map(line => line.trim());
  const filteredLines = lines.filter(line => {
    // Skip empty lines
    if (line.length === 0) return false;
    
    // Skip CV header patterns
    for (const pattern of CV_HEADER_PATTERNS) {
      if (pattern.test(line)) {
        return false;
      }
    }
    
    // Skip lines that are just separators or formatting
    if (/^[-=*_]{3,}$/.test(line)) {
      return false;
    }
    
    return true;
  });

  cleaned = filteredLines.join('\n').trim();

  // Step 2: Remove phone numbers and emails (they're already in contact section)
  PHONE_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  cleaned = cleaned.replace(EMAIL_PATTERN, '');

  // Step 3: Normalize whitespace
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\n{3,}/g, '\n\n') // Multiple newlines to double
    .trim();

  // Step 4: Convert to structured format
  // If it looks like bullet points, clean them up
  const bulletPattern = /^[-•*]\s+/gm;
  const hasBullets = bulletPattern.test(cleaned);
  
  if (hasBullets) {
    // Extract bullet points
    const bullets = cleaned
      .split(/\n+/)
      .map(line => line.replace(bulletPattern, '').trim())
      .filter(line => line.length > 10) // Filter out very short lines
      .filter((line, index, arr) => {
        // Remove duplicates (similar content)
        const normalized = line.toLowerCase().replace(/[^\w\s]/g, '');
        return arr.findIndex(l => {
          const otherNormalized = l.toLowerCase().replace(/[^\w\s]/g, '');
          // If lines are very similar (80% match), consider duplicate
          if (normalized === otherNormalized) return true;
          if (normalized.length > 20 && otherNormalized.length > 20) {
            const similarity = calculateSimilarity(normalized, otherNormalized);
            return similarity > 0.8;
          }
          return false;
        }) === index;
      })
      .slice(0, 6); // Limit to 6 bullets max

    // Format as clean bullets
    if (bullets.length > 0) {
      return bullets.map(bullet => `• ${bullet}`).join('\n');
    }
  }

  // Step 5: If it's paragraph format, clean it up
  // Split into sentences and remove redundant ones
  const sentences = cleaned
    .split(/[.!?]+\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20) // Filter very short sentences
    .filter((s, index, arr) => {
      // Remove duplicate sentences
      const normalized = s.toLowerCase().replace(/[^\w\s]/g, '');
      return arr.findIndex(a => {
        const otherNormalized = a.toLowerCase().replace(/[^\w\s]/g, '');
        return normalized === otherNormalized || calculateSimilarity(normalized, otherNormalized) > 0.85;
      }) === index;
    })
    .slice(0, 4); // Limit to 4 sentences for preview

  if (sentences.length > 0) {
    return sentences.join('. ') + (sentences.length > 0 && !sentences[sentences.length - 1].match(/[.!?]$/) ? '.' : '');
  }

  // Fallback: return cleaned text as-is
  return cleaned;
}

/**
 * Calculate similarity between two strings (simple Jaccard similarity)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Get preview text (2-4 lines)
 */
export function getBioPreview(bio: string, maxLines: number = 3): string {
  if (!bio) return '';
  
  const cleaned = cleanBio(bio);
  const lines = cleaned.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length <= maxLines) {
    return cleaned;
  }
  
  return lines.slice(0, maxLines).join('\n');
}
