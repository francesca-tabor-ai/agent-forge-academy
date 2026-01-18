/**
 * Course Image Validation Script
 * 
 * Validates that all courses have accessible image URLs.
 * 
 * This script:
 * 1. Loads all courses from file system (via getAllCourseSlugs)
 * 2. Resolves image URL for each course using resolveCourseImageUrl
 * 3. Validates URLs are accessible (HTTP HEAD for external, file exists for local)
 * 4. Reports any invalid images
 * 5. Exits with error code if any images are invalid
 * 
 * Usage:
 *   npm run validate:images
 *   npx tsx scripts/validate-course-images.ts
 * 
 * Options:
 *   --skip-external    Skip validation of external URLs (only check local files)
 *   --warn-only        Don't fail on errors, just warn
 */

import fs from 'fs';
import path from 'path';
import { getAllCourseSlugs } from '../lib/lessons';
import { extractCourseMetadata } from '../lib/course-sync/extract-metadata';
import { courseMetadata } from '../lib/course-metadata';
import { resolveCourseImageUrl } from '../lib/utils/course-image-resolver';
import type { Industry } from '../lib/utils/industries';
import { isValidIndustry } from '../lib/utils/industries';

interface ValidationResult {
  courseSlug: string;
  courseTitle: string;
  imageUrl: string;
  isValid: boolean;
  error?: string;
  isLocal: boolean;
}

interface ValidationOptions {
  skipExternal?: boolean;
  warnOnly?: boolean;
  timeout?: number;
}

/**
 * Filter and validate industries array
 */
function filterIndustries(industries: string[] | undefined | null): Industry[] {
  if (!industries?.length) {
    return [];
  }
  return industries.filter((i): i is Industry => isValidIndustry(i));
}

/**
 * Check if URL is a local path
 */
function isLocalPath(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}

/**
 * Validate local file exists
 */
function validateLocalFile(filePath: string): { valid: boolean; error?: string } {
  // Convert /course-covers/... to actual file path
  const publicPath = path.join(process.cwd(), 'public', filePath);
  
  if (!fs.existsSync(publicPath)) {
    return {
      valid: false,
      error: `Local file not found: ${publicPath}`,
    };
  }
  
  // Check if it's actually a file
  const stats = fs.statSync(publicPath);
  if (!stats.isFile()) {
    return {
      valid: false,
      error: `Path exists but is not a file: ${publicPath}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate external URL is accessible
 */
async function validateExternalUrl(
  url: string,
  timeout: number = 10000
): Promise<{ valid: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Agent-Forge-Academy-Image-Validator/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return {
        valid: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    // Check if response is actually an image
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.startsWith('image/')) {
      return {
        valid: false,
        error: `URL does not return an image (Content-Type: ${contentType})`,
      };
    }
    
    return { valid: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          valid: false,
          error: `Request timeout after ${timeout}ms`,
        };
      }
      return {
        valid: false,
        error: error.message,
      };
    }
    return {
      valid: false,
      error: 'Unknown error',
    };
  }
}

/**
 * Validate a single course image
 */
async function validateCourseImage(
  courseSlug: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  // Get course metadata
  const dynamicMetadata = extractCourseMetadata(courseSlug);
  const staticMetadata = courseMetadata[courseSlug];
  
  // Build course object similar to how it's done in courses/page.tsx
  const enhancedMetadata = staticMetadata ? {
    ...staticMetadata,
    outcome: (dynamicMetadata?.metadata as any)?.outcome || staticMetadata.outcome,
    build: (dynamicMetadata?.metadata as any)?.build || staticMetadata.build,
    bestFor: (dynamicMetadata?.metadata as any)?.bestFor || staticMetadata.bestFor,
    title: staticMetadata.title || dynamicMetadata?.metadata?.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    category: dynamicMetadata?.metadata?.category || staticMetadata.category || 'Uncategorized',
    imageUrl: dynamicMetadata?.metadata?.imageUrl || staticMetadata.imageUrl,
  } : (dynamicMetadata?.metadata ? {
    slug: courseSlug,
    title: dynamicMetadata.metadata.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    category: dynamicMetadata.metadata.category || 'Uncategorized',
    outcome: (dynamicMetadata.metadata as any)?.outcome || dynamicMetadata.metadata.description || '',
    build: (dynamicMetadata.metadata as any)?.build || '',
    bestFor: (dynamicMetadata.metadata as any)?.bestFor || '',
    time: dynamicMetadata.metadata.duration_weeks ? `${dynamicMetadata.metadata.duration_weeks} weeks` : '',
    industries: filterIndustries(dynamicMetadata.metadata.industries),
    imageUrl: (dynamicMetadata.metadata as any)?.imageUrl,
  } : undefined);
  
  const courseTitle = enhancedMetadata?.title || courseSlug;
  const industries = filterIndustries(
    dynamicMetadata?.metadata?.industries || enhancedMetadata?.industries || []
  );
  
  // Resolve image URL
  const imageUrl = resolveCourseImageUrl({
    imageUrl: enhancedMetadata?.imageUrl,
    thumbnail_url: dynamicMetadata?.metadata?.thumbnail_url || null,
    category: enhancedMetadata?.category,
    industries,
    metadata: enhancedMetadata,
  });
  
  const isLocal = isLocalPath(imageUrl);
  
  // Validate based on type
  let validation: { valid: boolean; error?: string };
  
  if (isLocal) {
    validation = validateLocalFile(imageUrl);
  } else if (options.skipExternal) {
    validation = { valid: true }; // Skip external validation
  } else {
    validation = await validateExternalUrl(imageUrl, options.timeout);
  }
  
  return {
    courseSlug,
    courseTitle,
    imageUrl,
    isValid: validation.valid,
    error: validation.error,
    isLocal,
  };
}

/**
 * Main validation function
 */
async function validateAllCourseImages(
  options: ValidationOptions = {}
): Promise<{ valid: boolean; results: ValidationResult[]; summary: { total: number; valid: number; invalid: number } }> {
  console.log('🔍 Validating course images...\n');
  
  // Get all course slugs
  const courseSlugs = getAllCourseSlugs();
  console.log(`Found ${courseSlugs.length} courses to validate\n`);
  
  const results: ValidationResult[] = [];
  let validCount = 0;
  let invalidCount = 0;
  
  // Validate each course
  for (let i = 0; i < courseSlugs.length; i++) {
    const slug = courseSlugs[i];
    process.stdout.write(`[${i + 1}/${courseSlugs.length}] Validating ${slug}... `);
    
    try {
      const result = await validateCourseImage(slug, options);
      results.push(result);
      
      if (result.isValid) {
        validCount++;
        const type = result.isLocal ? 'local' : 'external';
        console.log(`✓ (${type})`);
      } else {
        invalidCount++;
        console.log(`✗ ${result.error || 'Invalid'}`);
      }
      
      // Small delay to avoid rate limiting
      if (!result.isLocal && !options.skipExternal) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      invalidCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`✗ Error: ${errorMessage}`);
      results.push({
        courseSlug: slug,
        courseTitle: slug,
        imageUrl: 'unknown',
        isValid: false,
        error: errorMessage,
        isLocal: false,
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));
  console.log(`Total courses: ${courseSlugs.length}`);
  console.log(`✓ Valid images: ${validCount}`);
  console.log(`✗ Invalid images: ${invalidCount}`);
  console.log('='.repeat(60) + '\n');
  
  // Report invalid images
  if (invalidCount > 0) {
    console.log('❌ Invalid Images:\n');
    results
      .filter(r => !r.isValid)
      .forEach(result => {
        console.log(`  Course: ${result.courseTitle} (${result.courseSlug})`);
        console.log(`  Image URL: ${result.imageUrl}`);
        console.log(`  Error: ${result.error || 'Unknown error'}`);
        console.log(`  Type: ${result.isLocal ? 'Local' : 'External'}\n`);
      });
  }
  
  return {
    valid: invalidCount === 0,
    results,
    summary: {
      total: courseSlugs.length,
      valid: validCount,
      invalid: invalidCount,
    },
  };
}

/**
 * Parse command line arguments
 */
function parseArgs(): ValidationOptions {
  const args = process.argv.slice(2);
  return {
    skipExternal: args.includes('--skip-external'),
    warnOnly: args.includes('--warn-only'),
    timeout: 10000, // 10 second default timeout
  };
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();
  
  if (options.skipExternal) {
    console.log('⚠️  Skipping external URL validation (only checking local files)\n');
  }
  
  if (options.warnOnly) {
    console.log('⚠️  Warning mode: Will not fail on errors\n');
  }
  
  const validation = await validateAllCourseImages(options);
  
  if (!validation.valid) {
    if (options.warnOnly) {
      console.log('⚠️  Validation completed with errors (warn-only mode)\n');
      process.exit(0);
    } else {
      console.error('❌ Validation failed! Fix the errors above before proceeding.\n');
      process.exit(1);
    }
  } else {
    console.log('✅ All course images are valid!\n');
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { validateAllCourseImages, validateCourseImage, ValidationResult, ValidationOptions };
