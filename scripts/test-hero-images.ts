/**
 * Hero Image Sitewide Audit Script
 * 
 * Tests all pages where hero/course images should appear:
 * 1. Course landing pages
 * 2. Course cards (listing pages)
 * 3. Landing pages (industry/role/track)
 * 
 * Identifies:
 * - Missing images
 * - Invalid image URLs
 * - Broken image references
 * - Missing fallbacks
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { getAllCourseSlugs } from '@/lib/lessons';
import { getCourseCover } from '@/lib/courseCovers';
import { resolveCourseImageUrl } from '@/lib/utils/course-image-resolver';
import { getTrackHeroImage, getIndustryHeroImage, getRoleHeroImage } from '@/lib/utils/hero-image-resolver';
import { getSegmentsByType } from '@/lib/utils/segments';
import { extractCourseMetadata } from '@/lib/course-sync/extract-metadata';
import { courseMetadata } from '@/lib/course-metadata';

interface TestResult {
  type: 'course-landing' | 'course-card' | 'landing-page';
  identifier: string;
  imageUrl: string | null;
  status: 'ok' | 'missing' | 'invalid' | 'placeholder';
  error?: string;
}

const results: TestResult[] = [];

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
 * Test course landing page hero images
 */
function testCourseLandingPages() {
  console.log('\n📚 Testing Course Landing Pages...');
  
  const courseSlugs = getAllCourseSlugs();
  
  for (const slug of courseSlugs) {
    try {
      // Get course metadata
      const dynamicMetadata = extractCourseMetadata(slug);
      const staticMetadata = courseMetadata[slug];
      const category = dynamicMetadata?.metadata?.category || staticMetadata?.category;
      const industries = dynamicMetadata?.metadata?.industries || staticMetadata?.industries || [];
      
      // Simulate course object
      const course = {
        category,
        industries,
        metadata: staticMetadata,
      };
      
      // Get image URL (same logic as course landing page)
      const imageUrl = getCourseCover(course);
      
      const status = !isValidImageUrl(imageUrl) 
        ? 'invalid' 
        : imageUrl === null || imageUrl === undefined
        ? 'missing'
        : 'ok';
      
      results.push({
        type: 'course-landing',
        identifier: slug,
        imageUrl,
        status,
        error: status !== 'ok' ? `Course landing page missing or invalid image URL` : undefined,
      });
      
      if (status !== 'ok') {
        console.log(`  ❌ ${slug}: ${status} - ${imageUrl || 'null'}`);
      }
    } catch (error) {
      results.push({
        type: 'course-landing',
        identifier: slug,
        imageUrl: null,
        status: 'missing',
        error: `Error testing course: ${error}`,
      });
      console.log(`  ❌ ${slug}: Error - ${error}`);
    }
  }
  
  const okCount = results.filter(r => r.type === 'course-landing' && r.status === 'ok').length;
  const errorCount = results.filter(r => r.type === 'course-landing' && r.status !== 'ok').length;
  console.log(`  ✅ ${okCount} courses with valid images, ❌ ${errorCount} with issues`);
}

/**
 * Test course card thumbnails
 */
function testCourseCards() {
  console.log('\n🃏 Testing Course Cards...');
  
  const courseSlugs = getAllCourseSlugs();
  
  for (const slug of courseSlugs) {
    try {
      // Get course metadata
      const dynamicMetadata = extractCourseMetadata(slug);
      const staticMetadata = courseMetadata[slug];
      const category = dynamicMetadata?.metadata?.category || staticMetadata?.category;
      const industries = dynamicMetadata?.metadata?.industries || staticMetadata?.industries || [];
      
      // Simulate course object (same as CourseCard component)
      const course = {
        imageUrl: dynamicMetadata?.metadata?.imageUrl || staticMetadata?.imageUrl,
        thumbnail_url: dynamicMetadata?.metadata?.thumbnail_url || null,
        category,
        industries,
        metadata: staticMetadata,
      };
      
      // Get image URL (same logic as CourseCard)
      const imageUrl = resolveCourseImageUrl(course);
      
      const status = !isValidImageUrl(imageUrl) 
        ? 'invalid' 
        : imageUrl === null || imageUrl === undefined
        ? 'missing'
        : 'ok';
      
      results.push({
        type: 'course-card',
        identifier: slug,
        imageUrl,
        status,
        error: status !== 'ok' ? `Course card missing or invalid image URL` : undefined,
      });
      
      if (status !== 'ok') {
        console.log(`  ❌ ${slug}: ${status} - ${imageUrl || 'null'}`);
      }
    } catch (error) {
      results.push({
        type: 'course-card',
        identifier: slug,
        imageUrl: null,
        status: 'missing',
        error: `Error testing course card: ${error}`,
      });
      console.log(`  ❌ ${slug}: Error - ${error}`);
    }
  }
  
  const okCount = results.filter(r => r.type === 'course-card' && r.status === 'ok').length;
  const errorCount = results.filter(r => r.type === 'course-card' && r.status !== 'ok').length;
  console.log(`  ✅ ${okCount} course cards with valid images, ❌ ${errorCount} with issues`);
}

/**
 * Test landing page hero images
 */
function testLandingPages() {
  console.log('\n🏠 Testing Landing Pages...');
  
  // Test industry landing pages
  try {
    const industries = getSegmentsByType('industry');
    console.log(`  Testing ${industries.length} industry landing pages...`);
    
    for (const industry of industries) {
      try {
        const imageUrl = getIndustryHeroImage(industry.key);
        const status = !isValidImageUrl(imageUrl) 
          ? 'invalid' 
          : imageUrl === null || imageUrl === undefined
          ? 'missing'
          : 'ok';
        
        results.push({
          type: 'landing-page',
          identifier: `industry:${industry.key}`,
          imageUrl,
          status,
          error: status !== 'ok' ? `Industry landing page missing or invalid image URL` : undefined,
        });
        
        if (status !== 'ok') {
          console.log(`  ❌ Industry ${industry.key}: ${status} - ${imageUrl || 'null'}`);
        }
      } catch (error) {
        results.push({
          type: 'landing-page',
          identifier: `industry:${industry.key}`,
          imageUrl: null,
          status: 'missing',
          error: `Error testing industry: ${error}`,
        });
        console.log(`  ❌ Industry ${industry.key}: Error - ${error}`);
      }
    }
  } catch (error) {
    console.log(`  ⚠️  Error testing industries: ${error}`);
  }
  
  // Test role landing pages
  try {
    const roles = getSegmentsByType('role');
    console.log(`  Testing ${roles.length} role landing pages...`);
    
    for (const role of roles) {
      try {
        const imageUrl = getRoleHeroImage(role.key);
        const status = !isValidImageUrl(imageUrl) 
          ? 'invalid' 
          : imageUrl === null || imageUrl === undefined
          ? 'missing'
          : 'ok';
        
        results.push({
          type: 'landing-page',
          identifier: `role:${role.key}`,
          imageUrl,
          status,
          error: status !== 'ok' ? `Role landing page missing or invalid image URL` : undefined,
        });
        
        if (status !== 'ok') {
          console.log(`  ❌ Role ${role.key}: ${status} - ${imageUrl || 'null'}`);
        }
      } catch (error) {
        results.push({
          type: 'landing-page',
          identifier: `role:${role.key}`,
          imageUrl: null,
          status: 'missing',
          error: `Error testing role: ${error}`,
        });
        console.log(`  ❌ Role ${role.key}: Error - ${error}`);
      }
    }
  } catch (error) {
    console.log(`  ⚠️  Error testing roles: ${error}`);
  }
  
  // Test track landing pages
  try {
    const tracks = getSegmentsByType('track');
    console.log(`  Testing ${tracks.length} track landing pages...`);
    
    for (const track of tracks) {
      try {
        const imageUrl = getTrackHeroImage(track.key);
        const status = !isValidImageUrl(imageUrl) 
          ? 'invalid' 
          : imageUrl === null || imageUrl === undefined
          ? 'missing'
          : 'ok';
        
        results.push({
          type: 'landing-page',
          identifier: `track:${track.key}`,
          imageUrl,
          status,
          error: status !== 'ok' ? `Track landing page missing or invalid image URL` : undefined,
        });
        
        if (status !== 'ok') {
          console.log(`  ❌ Track ${track.key}: ${status} - ${imageUrl || 'null'}`);
        }
      } catch (error) {
        results.push({
          type: 'landing-page',
          identifier: `track:${track.key}`,
          imageUrl: null,
          status: 'missing',
          error: `Error testing track: ${error}`,
        });
        console.log(`  ❌ Track ${track.key}: Error - ${error}`);
      }
    }
  } catch (error) {
    console.log(`  ⚠️  Error testing tracks: ${error}`);
  }
  
  const okCount = results.filter(r => r.type === 'landing-page' && r.status === 'ok').length;
  const errorCount = results.filter(r => r.type === 'landing-page' && r.status !== 'ok').length;
  console.log(`  ✅ ${okCount} landing pages with valid images, ❌ ${errorCount} with issues`);
}

/**
 * Generate summary report
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 HERO IMAGE AUDIT SUMMARY');
  console.log('='.repeat(80));
  
  const courseLanding = results.filter(r => r.type === 'course-landing');
  const courseCards = results.filter(r => r.type === 'course-card');
  const landingPages = results.filter(r => r.type === 'landing-page');
  
  console.log('\n📚 Course Landing Pages:');
  const landingOk = courseLanding.filter(r => r.status === 'ok').length;
  const landingErrors = courseLanding.filter(r => r.status !== 'ok');
  console.log(`  ✅ ${landingOk}/${courseLanding.length} have valid images`);
  if (landingErrors.length > 0) {
    console.log(`  ❌ ${landingErrors.length} issues:`);
    landingErrors.forEach(r => {
      console.log(`     - ${r.identifier}: ${r.status} (${r.imageUrl || 'null'})`);
    });
  }
  
  console.log('\n🃏 Course Cards:');
  const cardsOk = courseCards.filter(r => r.status === 'ok').length;
  const cardsErrors = courseCards.filter(r => r.status !== 'ok');
  console.log(`  ✅ ${cardsOk}/${courseCards.length} have valid images`);
  if (cardsErrors.length > 0) {
    console.log(`  ❌ ${cardsErrors.length} issues:`);
    cardsErrors.forEach(r => {
      console.log(`     - ${r.identifier}: ${r.status} (${r.imageUrl || 'null'})`);
    });
  }
  
  console.log('\n🏠 Landing Pages:');
  const pagesOk = landingPages.filter(r => r.status === 'ok').length;
  const pagesErrors = landingPages.filter(r => r.status !== 'ok');
  console.log(`  ✅ ${pagesOk}/${landingPages.length} have valid images`);
  if (pagesErrors.length > 0) {
    console.log(`  ❌ ${pagesErrors.length} issues:`);
    pagesErrors.forEach(r => {
      console.log(`     - ${r.identifier}: ${r.status} (${r.imageUrl || 'null'})`);
    });
  }
  
  const totalOk = results.filter(r => r.status === 'ok').length;
  const totalErrors = results.filter(r => r.status !== 'ok').length;
  
  console.log('\n' + '='.repeat(80));
  console.log(`TOTAL: ✅ ${totalOk} valid, ❌ ${totalErrors} issues`);
  console.log('='.repeat(80));
  
  // Write detailed report to file
  const reportPath = join(process.cwd(), 'documentation', 'images', 'HERO_IMAGE_AUDIT_RESULTS.md');
  const reportContent = `# Hero Image Audit Results

Generated: ${new Date().toISOString()}

## Summary

- **Total Tests**: ${results.length}
- **Valid Images**: ${totalOk}
- **Issues**: ${totalErrors}

## Detailed Results

${results.map(r => `
### ${r.type} - ${r.identifier}

- **Status**: ${r.status}
- **Image URL**: ${r.imageUrl || 'null'}
${r.error ? `- **Error**: ${r.error}` : ''}
`).join('\n')}
`;
  
  try {
    require('fs').writeFileSync(reportPath, reportContent);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  } catch (error) {
    console.log(`\n⚠️  Could not save report: ${error}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Starting Hero Image Sitewide Audit...');
  
  testCourseLandingPages();
  testCourseCards();
  testLandingPages();
  generateReport();
  
  console.log('\n✅ Audit complete!');
  
  // Exit with error code if there are issues
  const hasErrors = results.some(r => r.status !== 'ok');
  process.exit(hasErrors ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as testHeroImages };
