/**
 * Hero image resolver for tracks, industries, and roles
 * 
 * Loads image mappings from:
 * - COURSE_IMAGE_URLS.md (for tracks and industries)
 * - content/landing/role-images.md (for roles)
 * 
 * Format: key | display | image_url
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface ImageMapping {
  key: string;
  display: string;
  imageUrl: string;
}

interface ImageMappings {
  tracks: Map<string, ImageMapping>;
  industries: Map<string, ImageMapping>;
  roles: Map<string, ImageMapping>;
  default: string;
  roleDefault: string; // Default fallback for roles
}

let cachedMappings: ImageMappings | null = null;

/**
 * Parse the COURSE_IMAGE_URLS.md file
 * Format: key | display | image_url
 */
function parseImageMappings(): ImageMappings {
  if (cachedMappings) {
    return cachedMappings;
  }

  const mappings: ImageMappings = {
    tracks: new Map(),
    industries: new Map(),
    roles: new Map(),
    default: 'https://wallpaperaccess.com/full/340554.png',
    roleDefault: '/landing/default-role.jpg', // Default fallback for roles
  };

  try {
    const filePath = join(process.cwd(), 'documentation', 'images', 'COURSE_IMAGE_URLS.md');
    const content = readFileSync(filePath, 'utf-8');
    
    let currentSection: 'tracks' | 'industries' | 'roles' | null = null;
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and markdown headers
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('##') || trimmed.startsWith('###')) {
        // Detect section changes
        // Note: Roles are loaded from content/landing/role-images.md, not from this file
        if (trimmed.includes('TRACKS') || trimmed.includes('Categories')) {
          currentSection = 'tracks';
        } else if (trimmed.includes('INDUSTRIES')) {
          currentSection = 'industries';
        } else if (trimmed.includes('ROLES')) {
          // Skip roles section - they're loaded from role-images.md
          currentSection = null;
        }
        continue;
      }

      // Skip code block markers
      if (trimmed.startsWith('```')) {
        continue;
      }

      // Parse format: key | display | image_url
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map((p) => p.trim());
        if (parts.length >= 3) {
          const [key, display, imageUrl] = parts;
          
          // Skip default entry (handled separately)
          if (key === 'default') {
            mappings.default = imageUrl;
            continue;
          }

          const mapping: ImageMapping = {
            key,
            display,
            imageUrl,
          };

          if (currentSection === 'tracks') {
            mappings.tracks.set(key, mapping);
          } else if (currentSection === 'industries') {
            mappings.industries.set(key, mapping);
          }
          // Roles are loaded from content/landing/role-images.md, not from this file
        }
      }
    }
  } catch (error) {
    console.error('Error parsing COURSE_IMAGE_URLS.md:', error);
    // Continue with empty mappings - will try to load role images separately
  }

  // Load role images from content/landing/role-images.md
  try {
    const roleImagesPath = join(process.cwd(), 'content', 'landing', 'role-images.md');
    const roleContent = readFileSync(roleImagesPath, 'utf-8');
    const roleLines = roleContent.split('\n');

    for (const line of roleLines) {
      const trimmed = line.trim();
      
      // Skip empty lines, headers, and code block markers
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```')) {
        continue;
      }

      // Parse format: role_key | display_name | image_url
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map((p) => p.trim());
        if (parts.length >= 3) {
          const [key, display, imageUrl] = parts;
          
          // Use fallback if image_url is empty
          const finalImageUrl = imageUrl || mappings.roleDefault;

          const mapping: ImageMapping = {
            key,
            display,
            imageUrl: finalImageUrl,
          };

          mappings.roles.set(key, mapping);
        }
      }
    }
  } catch (error) {
    console.error('Error parsing content/landing/role-images.md:', error);
    // Continue with empty role mappings - will use fallback
  }

  cachedMappings = mappings;
  return mappings;
}

/**
 * Normalize a string to slug format
 */
function normalizeToSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get hero image URL for a track by slug or display name
 * @param trackIdentifier - Track slug (e.g., "agentic-systems") or display name (e.g., "Agentic Systems")
 * @returns Hero image URL or default fallback
 */
export function getTrackHeroImage(trackIdentifier: string): string {
  const mappings = parseImageMappings();
  
  // Try exact match first
  let mapping = mappings.tracks.get(trackIdentifier);
  
  if (mapping) {
    return mapping.imageUrl;
  }

  // Normalize and try again
  const normalizedSlug = normalizeToSlug(trackIdentifier);
  mapping = mappings.tracks.get(normalizedSlug);
  
  if (mapping) {
    return mapping.imageUrl;
  }

  // Try to find by display name (case-insensitive)
  const normalizedMapping = Array.from(mappings.tracks.values()).find(
    (m) => normalizeToSlug(m.display) === normalizedSlug || 
           m.display.toLowerCase() === trackIdentifier.toLowerCase()
  );
  
  if (normalizedMapping) {
    return normalizedMapping.imageUrl;
  }

  return mappings.default;
}

/**
 * Get hero image URL for an industry by slug or display name
 * @param industryIdentifier - Industry slug (e.g., "finance") or display name (e.g., "Finance")
 * @returns Hero image URL or default fallback
 */
export function getIndustryHeroImage(industryIdentifier: string): string {
  const mappings = parseImageMappings();
  
  // Try exact match first
  let mapping = mappings.industries.get(industryIdentifier);
  
  if (mapping) {
    return mapping.imageUrl;
  }

  // Normalize and try again
  const normalizedSlug = normalizeToSlug(industryIdentifier);
  mapping = mappings.industries.get(normalizedSlug);
  
  if (mapping) {
    return mapping.imageUrl;
  }

  // Try to find by display name (case-insensitive)
  const normalizedMapping = Array.from(mappings.industries.values()).find(
    (m) => normalizeToSlug(m.display) === normalizedSlug || 
           m.display.toLowerCase() === industryIdentifier.toLowerCase()
  );
  
  if (normalizedMapping) {
    return normalizedMapping.imageUrl;
  }

  return mappings.default;
}

/**
 * Get hero image URL for a role by slug or display name
 * @param roleIdentifier - Role slug (e.g., "engineer") or display name (e.g., "Engineer")
 * @returns Hero image URL or role-specific default fallback (/landing/default-role.jpg)
 */
export function getRoleHeroImage(roleIdentifier: string): string {
  const mappings = parseImageMappings();
  
  // Try exact match first
  let mapping = mappings.roles.get(roleIdentifier);
  
  if (mapping && mapping.imageUrl) {
    return mapping.imageUrl;
  }

  // Normalize and try again
  const normalizedSlug = normalizeToSlug(roleIdentifier);
  mapping = mappings.roles.get(normalizedSlug);
  
  if (mapping && mapping.imageUrl) {
    return mapping.imageUrl;
  }

  // Try to find by display name (case-insensitive)
  const normalizedMapping = Array.from(mappings.roles.values()).find(
    (m) => normalizeToSlug(m.display) === normalizedSlug || 
           m.display.toLowerCase() === roleIdentifier.toLowerCase()
  );
  
  if (normalizedMapping && normalizedMapping.imageUrl) {
    return normalizedMapping.imageUrl;
  }

  // Use role-specific default fallback
  return mappings.roleDefault;
}

/**
 * Get all track mappings
 */
export function getAllTrackMappings(): Map<string, ImageMapping> {
  return parseImageMappings().tracks;
}

/**
 * Get all industry mappings
 */
export function getIndustryMappings(): Map<string, ImageMapping> {
  return parseImageMappings().industries;
}

/**
 * Get all role mappings
 */
export function getRoleMappings(): Map<string, ImageMapping> {
  return parseImageMappings().roles;
}

/**
 * Get default fallback image URL
 */
export function getDefaultHeroImage(): string {
  return parseImageMappings().default;
}
