/**
 * Page Inventory Script with Breakpoint Verification
 * 
 * Generates inventory checklist with breakpoint-specific checks
 * Note: This script generates the checklist format. Manual testing is required
 * to verify actual rendering at different viewport sizes.
 */

const fs = require('fs');
const path = require('path');

const courseDir = path.join(__dirname, '..', 'course');
const courseMetadataPath = path.join(__dirname, '..', 'lib', 'course-metadata.ts');

// Read course metadata
function getCourseMetadata() {
  const content = fs.readFileSync(courseMetadataPath, 'utf8');
  const courses = {};
  
  // Extract course metadata from the file
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

// Get all course directories
function getAllCourseSlugs() {
  if (!fs.existsSync(courseDir)) {
    return [];
  }
  
  const items = fs.readdirSync(courseDir, { withFileTypes: true });
  return items
    .filter(item => item.isDirectory() && !item.name.startsWith('.'))
    .map(item => item.name);
}

// Get lessons for a course
function getLessonsForCourse(courseSlug) {
  const coursePath = path.join(courseDir, courseSlug);
  if (!fs.existsSync(coursePath)) {
    return [];
  }
  
  const files = fs.readdirSync(coursePath);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''))
    .filter(slug => {
      // Filter out course index/metadata files
      const lower = slug.toLowerCase();
      return !lower.includes('index') && 
             !lower.includes('_course_metadata') &&
             !lower.includes('reference guide');
    });
}

// Get track covers (simplified - just check if category exists)
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

function getCourseImageStatus(courseSlug, metadata) {
  const category = metadata?.category;
  
  if (!category) {
    return {
      hasImage: false,
      usesFallback: true,
      notes: 'No category/track set',
    };
  }
  
  if (TRACK_COVERS[category]) {
    return {
      hasImage: true,
      usesFallback: false,
      notes: `Track image: ${category}`,
    };
  }
  
  return {
    hasImage: false,
    usesFallback: true,
    notes: `Category "${category}" not in TRACK_COVERS`,
  };
}

// Expected min heights by breakpoint
const EXPECTED_MIN_HEIGHTS = {
  mobile: 240, // min-h-[240px]
  tablet: 320, // md:min-h-[320px]
  desktop: 360, // lg:min-h-[360px]
};

// Main execution
function main() {
  console.log('🔍 Generating Page Inventory with Breakpoint Verification...\n');
  
  const courseSlugs = getAllCourseSlugs();
  const courseMetadata = getCourseMetadata();
  
  console.log(`Found ${courseSlugs.length} courses\n`);
  
  const inventory = [];
  
  for (const courseSlug of courseSlugs) {
    const metadata = courseMetadata[courseSlug];
    const courseName = metadata?.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const lessons = getLessonsForCourse(courseSlug);
    const imageStatus = getCourseImageStatus(courseSlug, metadata);
    
    // Get lesson slugs
    const quickStart = lessons.length > 0 ? lessons[0] : null;
    const midIndex = Math.floor(lessons.length / 2);
    const midModule = lessons.length > 2 && midIndex > 0 ? lessons[midIndex] : null;
    const final = lessons.length > 0 ? lessons[lessons.length - 1] : null;
    
    inventory.push({
      courseName,
      courseSlug,
      landingPage: {
        url: `/student/courses/${courseSlug}`,
        heroImageShows: imageStatus.hasImage ? 'Yes' : 'No',
        fallbackShows: imageStatus.usesFallback ? 'Yes' : 'No',
        notes: imageStatus.notes,
        // Breakpoint-specific checks (to be filled manually)
        breakpoints: {
          mobile: {
            viewport: '≤390px',
            minHeight: EXPECTED_MIN_HEIGHTS.mobile,
            heroImageShows: '❓ Manual Test Required',
            fallbackShows: '❓ Manual Test Required',
            heightCorrect: '❓ Manual Test Required',
            layoutCorrect: '❓ Manual Test Required',
            notes: '',
          },
          tablet: {
            viewport: '~768px',
            minHeight: EXPECTED_MIN_HEIGHTS.tablet,
            heroImageShows: '❓ Manual Test Required',
            fallbackShows: '❓ Manual Test Required',
            heightCorrect: '❓ Manual Test Required',
            layoutCorrect: '❓ Manual Test Required',
            notes: '',
          },
          desktop: {
            viewport: '≥1280px',
            minHeight: EXPECTED_MIN_HEIGHTS.desktop,
            heroImageShows: '❓ Manual Test Required',
            fallbackShows: '❓ Manual Test Required',
            heightCorrect: '❓ Manual Test Required',
            layoutCorrect: '❓ Manual Test Required',
            notes: '',
          },
        },
      },
      quickStart: quickStart ? `/student/courses/${courseSlug}/lessons/${quickStart}` : null,
      midModule: midModule ? `/student/courses/${courseSlug}/lessons/${midModule}` : null,
      final: final ? `/student/courses/${courseSlug}/lessons/${final}` : null,
    });
  }
  
  // Generate markdown report
  let markdown = '# Hero Image Page Inventory with Breakpoint Verification\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `**Note**: Breakpoint-specific checks require manual testing. See [BREAKPOINT_VERIFICATION_GUIDE.md](./BREAKPOINT_VERIFICATION_GUIDE.md) for testing instructions.\n\n`;
  markdown += `Total Courses: ${inventory.length}\n\n`;
  
  // Summary table (compact)
  markdown += '## Quick Summary\n\n';
  markdown += '| Course Name | URL | Hero Image | Fallback | Mobile | Tablet | Desktop |\n';
  markdown += '|-------------|-----|------------|----------|--------|--------|----------|\n';
  
  for (const item of inventory) {
    const mobile = item.landingPage.breakpoints.mobile.heroImageShows === 'Yes' ? '✅' : 
                   item.landingPage.breakpoints.mobile.heroImageShows === 'No' ? '❌' : '❓';
    const tablet = item.landingPage.breakpoints.tablet.heroImageShows === 'Yes' ? '✅' : 
                   item.landingPage.breakpoints.tablet.heroImageShows === 'No' ? '❌' : '❓';
    const desktop = item.landingPage.breakpoints.desktop.heroImageShows === 'Yes' ? '✅' : 
                    item.landingPage.breakpoints.desktop.heroImageShows === 'No' ? '❌' : '❓';
    
    markdown += `| ${item.courseName} | \`${item.landingPage.url}\` | ${item.landingPage.heroImageShows} | ${item.landingPage.fallbackShows} | ${mobile} | ${tablet} | ${desktop} |\n`;
  }
  
  // Detailed breakpoint tables
  markdown += '\n## Detailed Breakpoint Verification\n\n';
  markdown += '### Mobile (≤390px)\n\n';
  markdown += '| Course Name | URL | Hero Image Shows? | Fallback Shows? | Height Correct? | Layout Correct? | Notes |\n';
  markdown += '|-------------|-----|-------------------|-----------------|-----------------|-----------------|-------|\n';
  
  for (const item of inventory) {
    const bp = item.landingPage.breakpoints.mobile;
    markdown += `| ${item.courseName} | \`${item.landingPage.url}\` | ${bp.heroImageShows} | ${bp.fallbackShows} | ${bp.heightCorrect} | ${bp.layoutCorrect} | ${bp.notes || '-'} |\n`;
  }
  
  markdown += '\n### Tablet (~768px)\n\n';
  markdown += '| Course Name | URL | Hero Image Shows? | Fallback Shows? | Height Correct? | Layout Correct? | Notes |\n';
  markdown += '|-------------|-----|-------------------|-----------------|-----------------|-----------------|-------|\n';
  
  for (const item of inventory) {
    const bp = item.landingPage.breakpoints.tablet;
    markdown += `| ${item.courseName} | \`${item.landingPage.url}\` | ${bp.heroImageShows} | ${bp.fallbackShows} | ${bp.heightCorrect} | ${bp.layoutCorrect} | ${bp.notes || '-'} |\n`;
  }
  
  markdown += '\n### Desktop (≥1280px)\n\n';
  markdown += '| Course Name | URL | Hero Image Shows? | Fallback Shows? | Height Correct? | Layout Correct? | Notes |\n';
  markdown += '|-------------|-----|-------------------|-----------------|-----------------|-----------------|-------|\n';
  
  for (const item of inventory) {
    const bp = item.landingPage.breakpoints.desktop;
    markdown += `| ${item.courseName} | \`${item.landingPage.url}\` | ${bp.heroImageShows} | ${bp.fallbackShows} | ${bp.heightCorrect} | ${bp.layoutCorrect} | ${bp.notes || '-'} |\n`;
  }
  
  markdown += '\n## Lesson Pages\n\n';
  markdown += '**Note**: Lesson pages do not have hero images (by design).\n\n';
  markdown += '| Course Name | Page Type | URL | Notes |\n';
  markdown += '|-------------|-----------|-----|-------|\n';
  
  for (const item of inventory) {
    if (item.quickStart) {
      markdown += `| ${item.courseName} | Quick Start | \`${item.quickStart}\` | No hero image (by design) |\n`;
    }
    if (item.midModule) {
      markdown += `| ${item.courseName} | Mid-Module | \`${item.midModule}\` | No hero image (by design) |\n`;
    }
    if (item.final) {
      markdown += `| ${item.courseName} | Final | \`${item.final}\` | No hero image (by design) |\n`;
    }
  }
  
  markdown += '\n## Summary\n\n';
  
  const withImages = inventory.filter(item => item.landingPage.heroImageShows === 'Yes').length;
  const withFallback = inventory.filter(item => item.landingPage.fallbackShows === 'Yes').length;
  const withoutImages = inventory.filter(item => item.landingPage.heroImageShows === 'No').length;
  
  markdown += `- **Total Courses**: ${inventory.length}\n`;
  markdown += `- **Landing Pages with Hero Images**: ${withImages}/${inventory.length}\n`;
  markdown += `- **Landing Pages using Fallback**: ${withFallback}/${inventory.length}\n`;
  markdown += `- **Landing Pages without Images**: ${withoutImages}/${inventory.length}\n`;
  markdown += `- **Breakpoint Tests**: ❓ Manual testing required (see BREAKPOINT_VERIFICATION_GUIDE.md)\n`;
  
  // Write report
  const reportPath = path.join(__dirname, '..', 'documentation', 'images', 'PAGE_INVENTORY_BREAKPOINTS.md');
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`✅ Breakpoint inventory saved to: ${reportPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total Courses: ${inventory.length}`);
  console.log(`   Landing Pages with Hero Images: ${withImages}/${inventory.length}`);
  console.log(`   Landing Pages using Fallback: ${withFallback}/${inventory.length}`);
  console.log(`   Landing Pages without Images: ${withoutImages}/${inventory.length}`);
  console.log(`\n⚠️  Note: Breakpoint-specific checks require manual testing.`);
  console.log(`   See BREAKPOINT_VERIFICATION_GUIDE.md for testing instructions.`);
}

main();
