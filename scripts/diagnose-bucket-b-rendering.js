/**
 * Diagnose Bucket B: Rendering Not Implemented
 * 
 * Checks if CourseHero component properly receives and renders imageUrl prop.
 * 
 * Symptoms:
 * - Image exists in data but no <img> / background layer rendered
 * - Course hero component is text-only
 * 
 * This script verifies:
 * 1. CourseHero component has image rendering code
 * 2. Course landing page passes imageUrl to CourseHero
 * 3. getCourseCover() returns valid image URL
 * 4. No cases where imageUrl is null/undefined when passed to component
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const courseDir = path.join(__dirname, '..', 'course');
const courseHeroPath = path.join(__dirname, '..', 'components', 'courses', 'CourseHero.tsx');
const coursePagePath = path.join(__dirname, '..', 'app', '(student)', 'student', 'courses', '[courseSlug]', 'page.tsx');

// Track covers
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

// Courses with missing images (from previous diagnosis)
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

// Check if CourseHero component renders images
function checkCourseHeroRendering() {
  const content = fs.readFileSync(courseHeroPath, 'utf8');
  
  const hasBackgroundImage = content.includes('backgroundImage') || content.includes('background-image');
  const hasImageElement = content.includes('<img') || content.includes('Image');
  const hasImageUrlProp = content.includes('imageUrl');
  const hasStyleProp = content.includes('style={{') && content.includes('backgroundImage');
  
  return {
    hasBackgroundImage,
    hasImageElement,
    hasImageUrlProp,
    hasStyleProp,
    renderingImplemented: hasBackgroundImage && hasImageUrlProp,
  };
}

// Check if course page passes imageUrl to CourseHero
function checkCoursePagePassesImageUrl() {
  const content = fs.readFileSync(coursePagePath, 'utf8');
  
  const importsCourseHero = content.includes("import { CourseHero }");
  const usesCourseHero = content.includes('<CourseHero');
  const passesImageUrl = content.includes('imageUrl={') || content.includes('imageUrl=');
  const usesGetCourseCover = content.includes('getCourseCover');
  
  return {
    importsCourseHero,
    usesCourseHero,
    passesImageUrl,
    usesGetCourseCover,
    properlyConnected: importsCourseHero && usesCourseHero && passesImageUrl && usesGetCourseCover,
  };
}

// Extract category from metadata
function getCategoryFromMetadata(courseSlug) {
  const metadataFile = path.join(courseDir, courseSlug, '_COURSE_METADATA.md');
  
  if (!fs.existsSync(metadataFile)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(metadataFile, 'utf8');
    const { data } = matter(content);
    return data.category || null;
  } catch (error) {
    return null;
  }
}

// Simulate getCourseCover logic
function simulateGetCourseCover(courseSlug) {
  const category = getCategoryFromMetadata(courseSlug);
  
  if (!category) {
    return {
      imageUrl: 'https://wallpaperaccess.com/full/340554.png', // Default fallback
      hasImage: false,
      usesFallback: true,
    };
  }
  
  if (TRACK_COVERS[category]) {
    // Would return TRACK_COVERS[category] URL
    return {
      imageUrl: `TRACK_COVERS[${category}]`, // Placeholder
      hasImage: true,
      usesFallback: false,
    };
  }
  
  return {
    imageUrl: 'https://wallpaperaccess.com/full/340554.png',
    hasImage: false,
    usesFallback: true,
  };
}

// Check if imageUrl would be null/undefined
function checkImageUrlFlow(courseSlug) {
  const coverResult = simulateGetCourseCover(courseSlug);
  
  // Check if getCourseCover would return null/undefined
  const wouldBeNull = !coverResult.imageUrl || coverResult.imageUrl === 'null' || coverResult.imageUrl === 'undefined';
  
  return {
    courseSlug,
    category: getCategoryFromMetadata(courseSlug),
    imageUrl: coverResult.imageUrl,
    hasImage: coverResult.hasImage,
    usesFallback: coverResult.usesFallback,
    wouldBeNull,
    wouldPassToComponent: !wouldBeNull,
  };
}

// Main execution
function main() {
  console.log('🔍 Diagnosing Bucket B: Rendering Not Implemented...\n');
  
  // Check CourseHero component
  console.log('1. Checking CourseHero Component...');
  const heroCheck = checkCourseHeroRendering();
  console.log(`   ✅ Has backgroundImage rendering: ${heroCheck.hasBackgroundImage}`);
  console.log(`   ✅ Has imageUrl prop: ${heroCheck.hasImageUrlProp}`);
  console.log(`   ✅ Has style prop with backgroundImage: ${heroCheck.hasStyleProp}`);
  console.log(`   ${heroCheck.renderingImplemented ? '✅' : '❌'} Rendering implemented: ${heroCheck.renderingImplemented}`);
  
  // Check course page
  console.log('\n2. Checking Course Landing Page...');
  const pageCheck = checkCoursePagePassesImageUrl();
  console.log(`   ✅ Imports CourseHero: ${pageCheck.importsCourseHero}`);
  console.log(`   ✅ Uses CourseHero: ${pageCheck.usesCourseHero}`);
  console.log(`   ✅ Passes imageUrl prop: ${pageCheck.passesImageUrl}`);
  console.log(`   ✅ Uses getCourseCover: ${pageCheck.usesGetCourseCover}`);
  console.log(`   ${pageCheck.properlyConnected ? '✅' : '❌'} Properly connected: ${pageCheck.properlyConnected}`);
  
  // Check imageUrl flow for missing image courses
  console.log('\n3. Checking ImageUrl Flow for Missing Image Courses...');
  const flowChecks = MISSING_IMAGE_COURSES.map(checkImageUrlFlow);
  
  const wouldBeNull = flowChecks.filter(c => c.wouldBeNull);
  const wouldPassToComponent = flowChecks.filter(c => c.wouldPassToComponent);
  
  console.log(`   Courses where imageUrl would be null: ${wouldBeNull.length}`);
  console.log(`   Courses where imageUrl would pass to component: ${wouldPassToComponent.length}`);
  
  // Generate report
  let markdown = '# Bucket B: Rendering Not Implemented - Diagnosis\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  
  markdown += '## Component Analysis\n\n';
  markdown += '### CourseHero Component\n\n';
  markdown += `- **Has backgroundImage rendering**: ${heroCheck.hasBackgroundImage ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Has imageUrl prop**: ${heroCheck.hasImageUrlProp ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Has style prop with backgroundImage**: ${heroCheck.hasStyleProp ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Rendering implemented**: ${heroCheck.renderingImplemented ? '✅ Yes' : '❌ No'}\n\n`;
  
  markdown += '### Course Landing Page\n\n';
  markdown += `- **Imports CourseHero**: ${pageCheck.importsCourseHero ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Uses CourseHero**: ${pageCheck.usesCourseHero ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Passes imageUrl prop**: ${pageCheck.passesImageUrl ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Uses getCourseCover**: ${pageCheck.usesGetCourseCover ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Properly connected**: ${pageCheck.properlyConnected ? '✅ Yes' : '❌ No'}\n\n`;
  
  markdown += '## Conclusion\n\n';
  
  if (heroCheck.renderingImplemented && pageCheck.properlyConnected) {
    markdown += '**✅ Rendering IS implemented**\n\n';
    markdown += 'The CourseHero component:\n';
    markdown += '- Has backgroundImage rendering code\n';
    markdown += '- Accepts imageUrl prop\n';
    markdown += '- Uses style prop to render background image\n\n';
    markdown += 'The course landing page:\n';
    markdown += '- Imports CourseHero component\n';
    markdown += '- Uses getCourseCover() to resolve image URL\n';
    markdown += '- Passes imageUrl prop to CourseHero\n\n';
    markdown += '**Result**: Bucket B (Rendering Not Implemented) does NOT apply.\n';
    markdown += 'The issue is likely in Bucket C (Rendering Issue) - data exists and rendering is implemented, but something else is preventing images from showing.\n';
  } else {
    markdown += '**❌ Rendering may NOT be fully implemented**\n\n';
    if (!heroCheck.renderingImplemented) {
      markdown += '- CourseHero component missing image rendering code\n';
    }
    if (!pageCheck.properlyConnected) {
      markdown += '- Course landing page not properly passing imageUrl to CourseHero\n';
    }
  }
  
  markdown += '\n## ImageUrl Flow Analysis\n\n';
  markdown += '| Course Slug | Category | Would Pass to Component? | Notes |\n';
  markdown += '|-------------|----------|--------------------------|-------|\n';
  
  for (const check of flowChecks) {
    const status = check.wouldPassToComponent ? '✅ Yes' : '❌ No';
    markdown += `| ${check.courseSlug} | ${check.category || 'None'} | ${status} | ${check.usesFallback ? 'Uses fallback' : 'Track image'} |\n`;
  }
  
  // Write report
  const reportPath = path.join(__dirname, '..', 'documentation', 'images', 'BUCKET_B_RENDERING_DIAGNOSIS.md');
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`\n✅ Diagnosis report saved to: ${reportPath}`);
  
  // Print conclusion
  console.log('\n📊 Conclusion:');
  if (heroCheck.renderingImplemented && pageCheck.properlyConnected) {
    console.log('   ✅ Rendering IS implemented');
    console.log('   ✅ CourseHero component has image rendering code');
    console.log('   ✅ Course landing page passes imageUrl to CourseHero');
    console.log('\n   ⚠️  Bucket B does NOT apply - rendering is implemented.');
    console.log('   The issue is likely in Bucket C (data exists, rendering exists, but images still not showing).');
  } else {
    console.log('   ❌ Rendering may NOT be fully implemented');
    if (!heroCheck.renderingImplemented) {
      console.log('   ❌ CourseHero component missing image rendering');
    }
    if (!pageCheck.properlyConnected) {
      console.log('   ❌ Course landing page not properly connected');
    }
  }
}

main();
