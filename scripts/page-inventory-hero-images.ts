/**
 * Page Inventory Script for Hero Images
 * 
 * Builds a comprehensive inventory of all course pages and their hero image status.
 * 
 * Checks:
 * 1. Course landing pages
 * 2. Quick Start lesson (first lesson)
 * 3. Mid-module lesson (middle lesson)
 * 4. Final lesson (last lesson)
 * 
 * For each page, logs:
 * - URL
 * - Hero image shows? (Yes/No)
 * - Fallback shows? (Yes/No)
 * - Any overlap/cropping/blank hero area (Notes)
 */

import { getAllCourseSlugs, loadAllLessons } from '@/lib/lessons';
import { getCourseCover } from '@/lib/courseCovers';
import { extractCourseMetadata } from '@/lib/course-sync/extract-metadata';
import { courseMetadata } from '@/lib/course-metadata';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface PageInventoryItem {
  courseName: string;
  courseSlug: string;
  pageType: 'landing' | 'quick-start' | 'mid-module' | 'final';
  url: string;
  heroImageShows: 'Yes' | 'No' | 'N/A';
  fallbackShows: 'Yes' | 'No' | 'N/A';
  notes: string;
  imageUrl: string | null;
}

interface CourseInventory {
  courseName: string;
  courseSlug: string;
  landingPage: PageInventoryItem;
  quickStartLesson: PageInventoryItem | null;
  midModuleLesson: PageInventoryItem | null;
  finalLesson: PageInventoryItem | null;
}

/**
 * Validate if an image URL is valid
 */
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 0 && 
         trimmed !== 'image' && 
         trimmed !== 'placeholder' &&
         !trimmed.startsWith('http://placeholder') &&
         !trimmed.startsWith('placeholder');
}

/**
 * Check if URL is the default fallback
 */
function isDefaultFallback(url: string | null): boolean {
  if (!url) return false;
  return url === 'https://wallpaperaccess.com/full/340554.png' ||
         url.includes('default.jpg') ||
         url.includes('default.png');
}

/**
 * Get course name from slug and metadata
 */
function getCourseName(courseSlug: string): string {
  const dynamicMetadata = extractCourseMetadata(courseSlug);
  const staticMetadata = courseMetadata[courseSlug];
  
  return staticMetadata?.title || 
         dynamicMetadata?.metadata?.title || 
         courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
}

/**
 * Inventory a single course
 */
function inventoryCourse(courseSlug: string): CourseInventory {
  const courseName = getCourseName(courseSlug);
  
  // Get course metadata for image resolution
  const dynamicMetadata = extractCourseMetadata(courseSlug);
  const staticMetadata = courseMetadata[courseSlug];
  const category = dynamicMetadata?.metadata?.category || staticMetadata?.category;
  const industries = dynamicMetadata?.metadata?.industries || staticMetadata?.industries || [];
  
  // Build course object for image resolution
  const course = {
    category,
    industries,
    metadata: staticMetadata,
  };
  
  // Get course landing page image
  const landingImageUrl = getCourseCover(course);
  const landingImageValid = isValidImageUrl(landingImageUrl);
  const landingUsesFallback = isDefaultFallback(landingImageUrl);
  
  const landingPage: PageInventoryItem = {
    courseName,
    courseSlug,
    pageType: 'landing',
    url: `/student/courses/${courseSlug}`,
    heroImageShows: landingImageValid ? 'Yes' : 'No',
    fallbackShows: landingUsesFallback ? 'Yes' : 'No',
    notes: landingImageValid 
      ? (landingUsesFallback ? 'Using default fallback image' : 'Track image found')
      : 'Invalid or missing image URL',
    imageUrl: landingImageUrl,
  };
  
  // Get lessons for this course
  const lessons = loadAllLessons(undefined, courseSlug);
  
  // Filter out course index/metadata lessons
  const regularLessons = lessons.filter(l => {
    const title = l.frontmatter.title?.toLowerCase() || '';
    const slug = l.slug.toLowerCase();
    return !title.includes('course index') && 
           !title.includes('reference guide') && 
           !slug.includes('index') && 
           !slug.includes('_course_metadata');
  });
  
  // Quick Start lesson (first lesson)
  const quickStartLesson = regularLessons.length > 0 ? regularLessons[0] : null;
  const quickStartItem: PageInventoryItem | null = quickStartLesson ? {
    courseName,
    courseSlug,
    pageType: 'quick-start',
    url: `/student/courses/${courseSlug}/lessons/${quickStartLesson.slug}`,
    heroImageShows: 'N/A', // Lessons don't have hero images currently
    fallbackShows: 'N/A',
    notes: 'Lesson pages do not have hero images (by design)',
    imageUrl: null,
  } : null;
  
  // Mid-module lesson (middle lesson)
  const midIndex = Math.floor(regularLessons.length / 2);
  const midModuleLesson = regularLessons.length > 2 && midIndex > 0 ? regularLessons[midIndex] : null;
  const midModuleItem: PageInventoryItem | null = midModuleLesson ? {
    courseName,
    courseSlug,
    pageType: 'mid-module',
    url: `/student/courses/${courseSlug}/lessons/${midModuleLesson.slug}`,
    heroImageShows: 'N/A',
    fallbackShows: 'N/A',
    notes: 'Lesson pages do not have hero images (by design)',
    imageUrl: null,
  } : null;
  
  // Final lesson (last lesson)
  const finalLesson = regularLessons.length > 0 ? regularLessons[regularLessons.length - 1] : null;
  const finalItem: PageInventoryItem | null = finalLesson ? {
    courseName,
    courseSlug,
    pageType: 'final',
    url: `/student/courses/${courseSlug}/lessons/${finalLesson.slug}`,
    heroImageShows: 'N/A',
    fallbackShows: 'N/A',
    notes: 'Lesson pages do not have hero images (by design)',
    imageUrl: null,
  } : null;
  
  return {
    courseName,
    courseSlug,
    landingPage,
    quickStartLesson: quickStartItem,
    midModuleLesson: midModuleItem,
    finalLesson: finalItem,
  };
}

/**
 * Generate markdown checklist table
 */
function generateChecklistTable(inventories: CourseInventory[]): string {
  let markdown = '# Hero Image Page Inventory Checklist\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += '## Course Landing Pages\n\n';
  
  // Landing pages table
  markdown += '| Course Name | URL | Hero Image Shows? | Fallback Shows? | Notes |\n';
  markdown += '|-------------|-----|-------------------|-----------------|-------|\n';
  
  for (const inv of inventories) {
    const landing = inv.landingPage;
    markdown += `| ${landing.courseName} | \`${landing.url}\` | ${landing.heroImageShows} | ${landing.fallbackShows} | ${landing.notes} |\n`;
  }
  
  markdown += '\n## Lesson Pages\n\n';
  markdown += '| Course Name | Page Type | URL | Hero Image Shows? | Notes |\n';
  markdown += '|-------------|-----------|-----|------------------|-------|\n';
  
  for (const inv of inventories) {
    if (inv.quickStartLesson) {
      markdown += `| ${inv.courseName} | Quick Start | \`${inv.quickStartLesson.url}\` | ${inv.quickStartLesson.heroImageShows} | ${inv.quickStartLesson.notes} |\n`;
    }
    if (inv.midModuleLesson) {
      markdown += `| ${inv.courseName} | Mid-Module | \`${inv.midModuleLesson.url}\` | ${inv.midModuleLesson.heroImageShows} | ${inv.midModuleLesson.notes} |\n`;
    }
    if (inv.finalLesson) {
      markdown += `| ${inv.courseName} | Final | \`${inv.finalLesson.url}\` | ${inv.finalLesson.heroImageShows} | ${inv.finalLesson.notes} |\n`;
    }
  }
  
  markdown += '\n## Summary\n\n';
  
  const landingPagesWithImages = inventories.filter(inv => inv.landingPage.heroImageShows === 'Yes').length;
  const landingPagesWithFallback = inventories.filter(inv => inv.landingPage.fallbackShows === 'Yes').length;
  const landingPagesWithoutImages = inventories.filter(inv => inv.landingPage.heroImageShows === 'No').length;
  
  markdown += `- **Total Courses**: ${inventories.length}\n`;
  markdown += `- **Landing Pages with Hero Images**: ${landingPagesWithImages}/${inventories.length}\n`;
  markdown += `- **Landing Pages using Fallback**: ${landingPagesWithFallback}/${inventories.length}\n`;
  markdown += `- **Landing Pages without Images**: ${landingPagesWithoutImages}/${inventories.length}\n`;
  
  return markdown;
}

/**
 * Generate detailed JSON report
 */
function generateDetailedReport(inventories: CourseInventory[]): string {
  return JSON.stringify(inventories, null, 2);
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Starting Page Inventory for Hero Images...\n');
  
  const courseSlugs = getAllCourseSlugs();
  console.log(`Found ${courseSlugs.length} courses\n`);
  
  const inventories: CourseInventory[] = [];
  
  for (const courseSlug of courseSlugs) {
    console.log(`Processing: ${courseSlug}...`);
    try {
      const inventory = inventoryCourse(courseSlug);
      inventories.push(inventory);
      
      // Log status
      const status = inventory.landingPage.heroImageShows === 'Yes' ? '✅' : '❌';
      console.log(`  ${status} Landing page: ${inventory.landingPage.heroImageShows}`);
      if (inventory.quickStartLesson) {
        console.log(`  📄 Quick Start lesson: ${inventory.quickStartLesson.url}`);
      }
      if (inventory.midModuleLesson) {
        console.log(`  📄 Mid-module lesson: ${inventory.midModuleLesson.url}`);
      }
      if (inventory.finalLesson) {
        console.log(`  📄 Final lesson: ${inventory.finalLesson.url}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${courseSlug}:`, error);
    }
  }
  
  console.log('\n📊 Generating reports...\n');
  
  // Generate markdown checklist
  const checklistMarkdown = generateChecklistTable(inventories);
  const checklistPath = join(process.cwd(), 'documentation', 'images', 'PAGE_INVENTORY_CHECKLIST.md');
  writeFileSync(checklistPath, checklistMarkdown);
  console.log(`✅ Checklist saved to: ${checklistPath}`);
  
  // Generate detailed JSON report
  const detailedReport = generateDetailedReport(inventories);
  const reportPath = join(process.cwd(), 'documentation', 'images', 'PAGE_INVENTORY_DETAILED.json');
  writeFileSync(reportPath, detailedReport);
  console.log(`✅ Detailed report saved to: ${reportPath}`);
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 INVENTORY SUMMARY');
  console.log('='.repeat(80));
  
  const landingPagesWithImages = inventories.filter(inv => inv.landingPage.heroImageShows === 'Yes').length;
  const landingPagesWithFallback = inventories.filter(inv => inv.landingPage.fallbackShows === 'Yes').length;
  const landingPagesWithoutImages = inventories.filter(inv => inv.landingPage.heroImageShows === 'No').length;
  
  console.log(`\nTotal Courses: ${inventories.length}`);
  console.log(`Landing Pages with Hero Images: ${landingPagesWithImages}/${inventories.length}`);
  console.log(`Landing Pages using Fallback: ${landingPagesWithFallback}/${inventories.length}`);
  console.log(`Landing Pages without Images: ${landingPagesWithoutImages}/${inventories.length}`);
  
  if (landingPagesWithoutImages > 0) {
    console.log('\n⚠️  Courses without hero images:');
    inventories
      .filter(inv => inv.landingPage.heroImageShows === 'No')
      .forEach(inv => {
        console.log(`  - ${inv.courseName} (${inv.courseSlug})`);
        console.log(`    URL: ${inv.landingPage.url}`);
        console.log(`    Image URL: ${inv.landingPage.imageUrl || 'null'}`);
        console.log(`    Notes: ${inv.landingPage.notes}`);
      });
  }
  
  console.log('\n✅ Inventory complete!');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as generatePageInventory };
