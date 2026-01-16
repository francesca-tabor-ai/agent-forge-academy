/**
 * Validation script to ensure all courses have required filterable metadata
 * 
 * Required fields:
 * - category (track) - single string
 * - industries - array of strings
 * - bestFor - string or array of strings
 * - isLive - boolean (optional, defaults to true)
 * 
 * Run: npx tsx scripts/validate-course-metadata.ts
 */

import { courseMetadata } from '../lib/course-metadata';

interface ValidationIssue {
  courseSlug: string;
  field: string;
  issue: string;
}

const issues: ValidationIssue[] = [];

// Validate all courses
Object.entries(courseMetadata).forEach(([slug, course]) => {
  // Check category (track)
  if (!course.category || typeof course.category !== 'string' || course.category.trim().length === 0) {
    issues.push({
      courseSlug: slug,
      field: 'category',
      issue: 'Missing or empty category (track)',
    });
  }

  // Check industries
  if (!course.industries || !Array.isArray(course.industries) || course.industries.length === 0) {
    issues.push({
      courseSlug: slug,
      field: 'industries',
      issue: 'Missing or empty industries array',
    });
  } else {
    // Validate industry values are strings
    const invalidIndustries = course.industries.filter((ind) => typeof ind !== 'string' || ind.trim().length === 0);
    if (invalidIndustries.length > 0) {
      issues.push({
        courseSlug: slug,
        field: 'industries',
        issue: `Invalid industry values: ${invalidIndustries.join(', ')}`,
      });
    }
  }

  // Check bestFor
  if (!course.bestFor) {
    issues.push({
      courseSlug: slug,
      field: 'bestFor',
      issue: 'Missing bestFor field',
    });
  } else {
    // bestFor can be string or array
    if (typeof course.bestFor !== 'string' && !Array.isArray(course.bestFor)) {
      issues.push({
        courseSlug: slug,
        field: 'bestFor',
        issue: 'bestFor must be a string or array of strings',
      });
    } else if (Array.isArray(course.bestFor) && course.bestFor.length === 0) {
      issues.push({
        courseSlug: slug,
        field: 'bestFor',
        issue: 'bestFor array cannot be empty',
      });
    }
  }

  // isLive is optional, but if present should be boolean
  if (course.isLive !== undefined && typeof course.isLive !== 'boolean') {
    issues.push({
      courseSlug: slug,
      field: 'isLive',
      issue: 'isLive must be a boolean if specified',
    });
  }
});

// Report results
if (issues.length === 0) {
  console.log('✅ All courses have valid filterable metadata!');
  console.log(`\nValidated ${Object.keys(courseMetadata).length} courses`);
  
  // Summary statistics
  const tracks = new Set(Object.values(courseMetadata).map((c) => c.category));
  const allIndustries = new Set(
    Object.values(courseMetadata).flatMap((c) => c.industries || [])
  );
  
  console.log(`\n📊 Summary:`);
  console.log(`  - Tracks: ${tracks.size} unique tracks`);
  console.log(`  - Industries: ${allIndustries.size} unique industries`);
  console.log(`  - All courses have category (track)`);
  console.log(`  - All courses have industries`);
  console.log(`  - All courses have bestFor`);
} else {
  console.error('❌ Validation issues found:\n');
  issues.forEach((issue) => {
    console.error(`  ${issue.courseSlug}: ${issue.field} - ${issue.issue}`);
  });
  console.error(`\nTotal issues: ${issues.length}`);
  process.exit(1);
}
