/**
 * Diagnose Root Cause for Hero Image Failures
 * 
 * Classifies each "image not showing" failure into buckets:
 * - Bucket A: Missing data (no category/track in metadata)
 * - Bucket B: Invalid data (category exists but doesn't match TRACK_COVERS)
 * - Bucket C: Rendering issues (data exists but image doesn't render)
 * - Bucket D: CSS/layout issues (image exists but hidden/cropped)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const courseDir = path.join(__dirname, '..', 'course');
const courseMetadataPath = path.join(__dirname, '..', 'lib', 'course-metadata.ts');

// Track covers from courseCovers.ts
const TRACK_COVERS = {
  'Vibe Engineering': true,
  'Agentic Systems': true,
  'AI Search & Visibility': true,
  'Shopping & E-Commerce': true,
  'Media & Content Ops': true,
  'Trust & Regulation': true,
  'ML Engineering': true,
  'Platform Engineering': true,
  'GTM & Revenue Operations': true,
  'Creative AI': true,
  'Audio & Voice': true,
};

// Courses that are missing images (from inventory)
const MISSING_IMAGE_COURSES = [
  'ai-driven-credit-scoring-lending',
  'ai-powered-financial-risk-management',
  'algorithmic-trading-market-intelligence',
  'automated-financial-reporting-analysis',
  'automated-suitability-esg-matching',
  'distribution-marketing-intelligence',
  'esg-sustainable-investment-insights',
  'financial-fraud-detection-ai',
  'frictionless-compliance-onboarding-assistant',
  'hyper-personalized-client-communication',
  'intelligent-data-management-verification',
  'intelligent-document-intelligence-hub',
  'investment-siri-mass-market-clients',
  'multi-agent-sales-system',
  'operational-efficiency-tools',
  'predictive-wealth-insights-dashboard',
  'regulatory-compliance-greenwashing-prevention',
];

// Read course metadata from course-metadata.ts
function getCourseMetadata() {
  const content = fs.readFileSync(courseMetadataPath, 'utf8');
  const courses = {};
  
  const courseRegex = /'([^']+)':\s*\{[^}]*title:\s*'([^']+)',[^}]*category:\s*'([^']+)'/g;
  let match;
  while ((match = courseRegex.exec(content)) !== null) {
    courses[match[1]] = {
      title: match[2],
      category: match[3],
    };
  }
  
  return courses;
}

// Extract metadata from _COURSE_METADATA.md
function extractMetadataFromFile(courseSlug) {
  const metadataFile = path.join(courseDir, courseSlug, '_COURSE_METADATA.md');
  
  if (!fs.existsSync(metadataFile)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(metadataFile, 'utf8');
    const { data } = matter(content);
    return {
      category: data.category,
      title: data.title,
      source: '_COURSE_METADATA.md',
    };
  } catch (error) {
    return null;
  }
}

// Check other metadata files
function extractFromOtherFiles(courseSlug) {
  const files = ['INDEX.md', '_COURSE_OVERVIEW.md', 'README.md'];
  
  for (const file of files) {
    const filePath = path.join(courseDir, courseSlug, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);
        if (data.category) {
          return {
            category: data.category,
            title: data.title,
            source: file,
          };
        }
      } catch (error) {
        // Continue
      }
    }
  }
  
  return null;
}

// Diagnose a single course
function diagnoseCourse(courseSlug) {
  const result = {
    courseSlug,
    bucket: null,
    category: null,
    categorySource: null,
    categoryInTRACK_COVERS: false,
    issue: null,
    fix: null,
  };
  
  // Check _COURSE_METADATA.md first
  let metadata = extractMetadataFromFile(courseSlug);
  if (metadata) {
    result.category = metadata.category;
    result.categorySource = metadata.source;
  } else {
    // Check other files
    metadata = extractFromOtherFiles(courseSlug);
    if (metadata) {
      result.category = metadata.category;
      result.categorySource = metadata.source;
    } else {
      // Check course-metadata.ts
      const legacyMetadata = getCourseMetadata();
      if (legacyMetadata[courseSlug]) {
        result.category = legacyMetadata[courseSlug].category;
        result.categorySource = 'course-metadata.ts';
      }
    }
  }
  
  // Classify into bucket
  if (!result.category) {
    // Bucket A: Missing data
    result.bucket = 'A';
    result.issue = 'No category/track field found in any metadata source';
    result.fix = 'Add category field to _COURSE_METADATA.md or course-metadata.ts';
  } else {
    // Check if category matches TRACK_COVERS
    const categoryMatch = Object.keys(TRACK_COVERS).find(
      track => track.toLowerCase() === result.category.toLowerCase()
    );
    
    if (categoryMatch) {
      result.categoryInTRACK_COVERS = true;
      result.category = categoryMatch; // Use exact match
      result.bucket = 'C'; // Data exists, might be rendering issue
      result.issue = 'Category exists and matches TRACK_COVERS, but image not showing';
      result.fix = 'Check image rendering logic and fallback handling';
    } else {
      result.bucket = 'B';
      result.issue = `Category "${result.category}" exists but doesn't match any TRACK_COVERS key`;
      result.fix = `Update category to match one of: ${Object.keys(TRACK_COVERS).join(', ')}`;
    }
  }
  
  return result;
}

// Main execution
function main() {
  console.log('🔍 Diagnosing Hero Image Failures...\n');
  
  const diagnoses = [];
  
  for (const courseSlug of MISSING_IMAGE_COURSES) {
    const diagnosis = diagnoseCourse(courseSlug);
    diagnoses.push(diagnosis);
  }
  
  // Group by bucket
  const bucketA = diagnoses.filter(d => d.bucket === 'A');
  const bucketB = diagnoses.filter(d => d.bucket === 'B');
  const bucketC = diagnoses.filter(d => d.bucket === 'C');
  
  console.log('📊 Diagnosis Results:\n');
  console.log(`Bucket A (Missing Data): ${bucketA.length} courses`);
  console.log(`Bucket B (Invalid Data): ${bucketB.length} courses`);
  console.log(`Bucket C (Rendering Issue): ${bucketC.length} courses`);
  
  // Generate report
  let markdown = '# Hero Image Failure Diagnosis Report\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `Total Courses with Missing Images: ${diagnoses.length}\n\n`;
  
  // Bucket A: Missing Data
  markdown += '## Bucket A: Missing Data\n\n';
  markdown += '**Symptoms**: No category/track field in metadata\n\n';
  markdown += '| Course Slug | Category Found | Source | Issue | Fix |\n';
  markdown += '|-------------|----------------|--------|-------|-----|\n';
  
  for (const d of bucketA) {
    markdown += `| ${d.courseSlug} | ${d.category || 'None'} | ${d.categorySource || 'None'} | ${d.issue} | ${d.fix} |\n`;
  }
  
  if (bucketA.length === 0) {
    markdown += '| *No courses in this bucket* | | | | |\n';
  }
  
  // Bucket B: Invalid Data
  markdown += '\n## Bucket B: Invalid Data\n\n';
  markdown += '**Symptoms**: Category exists but doesn\'t match TRACK_COVERS\n\n';
  markdown += '| Course Slug | Category Found | Expected | Issue | Fix |\n';
  markdown += '|-------------|----------------|----------|-------|-----|\n';
  
  for (const d of bucketB) {
    const expected = Object.keys(TRACK_COVERS).join(', ');
    markdown += `| ${d.courseSlug} | ${d.category} | One of: ${expected} | ${d.issue} | ${d.fix} |\n`;
  }
  
  if (bucketB.length === 0) {
    markdown += '| *No courses in this bucket* | | | | |\n';
  }
  
  // Bucket C: Rendering Issue
  markdown += '\n## Bucket C: Rendering Issue\n\n';
  markdown += '**Symptoms**: Category exists and matches TRACK_COVERS, but image not showing\n\n';
  markdown += '| Course Slug | Category | Source | Issue | Fix |\n';
  markdown += '|-------------|----------|--------|-------|-----|\n';
  
  for (const d of bucketC) {
    markdown += `| ${d.courseSlug} | ${d.category} | ${d.categorySource} | ${d.issue} | ${d.fix} |\n`;
  }
  
  if (bucketC.length === 0) {
    markdown += '| *No courses in this bucket* | | | | |\n';
  }
  
  // Summary
  markdown += '\n## Summary\n\n';
  markdown += `- **Bucket A (Missing Data)**: ${bucketA.length} courses\n`;
  markdown += `- **Bucket B (Invalid Data)**: ${bucketB.length} courses\n`;
  markdown += `- **Bucket C (Rendering Issue)**: ${bucketC.length} courses\n`;
  
  // Write report
  const reportPath = path.join(__dirname, '..', 'documentation', 'images', 'HERO_IMAGE_FAILURE_DIAGNOSIS.md');
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`\n✅ Diagnosis report saved to: ${reportPath}`);
  
  // Print detailed results
  console.log('\n📋 Detailed Results:\n');
  for (const d of diagnoses) {
    console.log(`${d.courseSlug}:`);
    console.log(`  Bucket: ${d.bucket}`);
    console.log(`  Category: ${d.category || 'None'}`);
    console.log(`  Source: ${d.categorySource || 'None'}`);
    console.log(`  Issue: ${d.issue}`);
    console.log(`  Fix: ${d.fix}`);
    console.log('');
  }
}

main();
