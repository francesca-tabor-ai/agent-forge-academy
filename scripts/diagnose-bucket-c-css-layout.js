/**
 * Diagnose Bucket C: CSS/Layout Hides the Image
 * 
 * Checks for CSS issues that might hide images:
 * - Height collapsing to 0
 * - Background applied to wrong wrapper
 * - overflow: hidden clipping unexpectedly
 * - z-index overlay from nav/header
 * - fixed positioned sidebar covering hero
 */

const fs = require('fs');
const path = require('path');

const courseHeroPath = path.join(__dirname, '..', 'components', 'courses', 'CourseHero.tsx');
const coursePagePath = path.join(__dirname, '..', 'app', '(student)', 'student', 'courses', '[courseSlug]', 'page.tsx');

// Check CourseHero component for CSS issues
function analyzeCourseHeroCSS() {
  const content = fs.readFileSync(courseHeroPath, 'utf8');
  
  const issues = [];
  const checks = {
    hasMinHeight: /min-h-\[?\d+px\]?/.test(content),
    hasOverflowHidden: /overflow-hidden/.test(content),
    hasAbsolutePositioning: /absolute/.test(content),
    hasRelativePositioning: /relative/.test(content),
    hasZIndex: /z-\[?\d+\]?/.test(content),
    backgroundOnCorrectElement: /backgroundImage.*url/.test(content),
    hasHeightFull: /h-full/.test(content),
  };
  
  // Check for potential issues
  if (!checks.hasMinHeight) {
    issues.push('❌ No min-height set - container could collapse to 0');
  } else {
    issues.push('✅ Has min-height - prevents collapse');
  }
  
  if (checks.hasOverflowHidden) {
    issues.push('⚠️  Has overflow-hidden - could clip image if positioning is off');
  }
  
  if (!checks.backgroundOnCorrectElement) {
    issues.push('❌ Background image not on correct element');
  } else {
    issues.push('✅ Background image on correct element (absolute inset-0)');
  }
  
  if (!checks.hasRelativePositioning) {
    issues.push('❌ Missing relative positioning for content container');
  } else {
    issues.push('✅ Has relative positioning for content');
  }
  
  // Check for z-index stacking
  const zIndexMatches = content.match(/z-\[?(\d+)\]?/g);
  if (zIndexMatches) {
    issues.push(`⚠️  Multiple z-index values found: ${zIndexMatches.join(', ')}`);
  }
  
  return {
    checks,
    issues,
    hasPotentialIssues: issues.some(i => i.startsWith('❌') || i.startsWith('⚠️')),
  };
}

// Check course page layout for conflicts
function analyzeCoursePageLayout() {
  const content = fs.readFileSync(coursePagePath, 'utf8');
  
  const issues = [];
  const checks = {
    hasStickyPositioning: /sticky/.test(content),
    hasZIndex50: /z-50/.test(content),
    hasComplexPositioning: /md:left-1\/2|md:-ml-\[50vw\]/.test(content),
    hasOverflowHidden: /overflow-x-hidden|overflow-hidden/.test(content),
    hasNegativeMargin: /-mt-|mb-0/.test(content),
    heroWrapperHasClasses: /className=.*sticky/.test(content),
  };
  
  // Check for potential issues
  if (checks.hasStickyPositioning) {
    issues.push('⚠️  Hero wrapper uses sticky positioning - could conflict with other sticky elements');
  }
  
  if (checks.hasZIndex50) {
    issues.push('⚠️  Hero wrapper has z-50 - could be covered by nav/header with higher z-index');
  }
  
  if (checks.hasComplexPositioning) {
    issues.push('⚠️  Complex responsive positioning (md:left-1/2 md:-ml-[50vw]) - could cause layout issues');
  }
  
  if (checks.hasOverflowHidden) {
    issues.push('⚠️  Has overflow-x-hidden on wrapper - could clip hero content');
  }
  
  if (checks.hasNegativeMargin) {
    issues.push('⚠️  Has negative margin (-mt-8) - could cause positioning issues');
  }
  
  // Check if there's a sidebar that might cover hero
  const hasSidebar = /sidebar|Sidebar/.test(content);
  if (hasSidebar) {
    issues.push('⚠️  Page has sidebar - check if it covers hero on certain breakpoints');
  }
  
  return {
    checks,
    issues,
    hasPotentialIssues: issues.length > 0,
  };
}

// Extract specific CSS classes for analysis
function extractCSSClasses() {
  const heroContent = fs.readFileSync(courseHeroPath, 'utf8');
  const pageContent = fs.readFileSync(coursePagePath, 'utf8');
  
  // Extract className attributes
  const heroClasses = heroContent.match(/className="([^"]+)"/g) || [];
  const pageClasses = pageContent.match(/className="([^"]+)"/g) || [];
  
  return {
    heroClasses: heroClasses.map(c => c.replace('className="', '').replace('"', '')),
    pageClasses: pageClasses.map(c => c.replace('className="', '').replace('"', '')),
  };
}

// Main execution
function main() {
  console.log('🔍 Diagnosing Bucket C: CSS/Layout Issues...\n');
  
  // Analyze CourseHero
  console.log('1. Analyzing CourseHero Component CSS...');
  const heroAnalysis = analyzeCourseHeroCSS();
  heroAnalysis.issues.forEach(issue => console.log(`   ${issue}`));
  
  // Analyze page layout
  console.log('\n2. Analyzing Course Page Layout...');
  const pageAnalysis = analyzeCoursePageLayout();
  pageAnalysis.issues.forEach(issue => console.log(`   ${issue}`));
  
  // Extract CSS classes
  console.log('\n3. Extracting CSS Classes...');
  const cssClasses = extractCSSClasses();
  console.log(`   Hero component classes: ${cssClasses.heroClasses.length} found`);
  console.log(`   Page wrapper classes: ${cssClasses.pageClasses.length} found`);
  
  // Generate report
  let markdown = '# Bucket C: CSS/Layout Hides the Image - Diagnosis\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  
  markdown += '## CourseHero Component Analysis\n\n';
  markdown += '### CSS Checks\n\n';
  markdown += `- **Has min-height**: ${heroAnalysis.checks.hasMinHeight ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Has overflow-hidden**: ${heroAnalysis.checks.hasOverflowHidden ? '⚠️  Yes' : '✅ No'}\n`;
  markdown += `- **Has absolute positioning**: ${heroAnalysis.checks.hasAbsolutePositioning ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Has relative positioning**: ${heroAnalysis.checks.hasRelativePositioning ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Has z-index**: ${heroAnalysis.checks.hasZIndex ? '⚠️  Yes' : '✅ No'}\n`;
  markdown += `- **Background on correct element**: ${heroAnalysis.checks.backgroundOnCorrectElement ? '✅ Yes' : '❌ No'}\n`;
  markdown += `- **Has h-full**: ${heroAnalysis.checks.hasHeightFull ? '✅ Yes' : '⚠️  No'}\n\n`;
  
  markdown += '### Issues Found\n\n';
  if (heroAnalysis.issues.length === 0) {
    markdown += 'No issues found.\n\n';
  } else {
    heroAnalysis.issues.forEach(issue => {
      markdown += `- ${issue}\n`;
    });
  }
  
  markdown += '\n## Course Page Layout Analysis\n\n';
  markdown += '### Layout Checks\n\n';
  markdown += `- **Has sticky positioning**: ${pageAnalysis.checks.hasStickyPositioning ? '⚠️  Yes' : '✅ No'}\n`;
  markdown += `- **Has z-50**: ${pageAnalysis.checks.hasZIndex50 ? '⚠️  Yes' : '✅ No'}\n`;
  markdown += `- **Has complex positioning**: ${pageAnalysis.checks.hasComplexPositioning ? '⚠️  Yes' : '✅ No'}\n`;
  markdown += `- **Has overflow-hidden**: ${pageAnalysis.checks.hasOverflowHidden ? '⚠️  Yes' : '✅ No'}\n`;
  markdown += `- **Has negative margin**: ${pageAnalysis.checks.hasNegativeMargin ? '⚠️  Yes' : '✅ No'}\n\n`;
  
  markdown += '### Issues Found\n\n';
  if (pageAnalysis.issues.length === 0) {
    markdown += 'No issues found.\n\n';
  } else {
    pageAnalysis.issues.forEach(issue => {
      markdown += `- ${issue}\n`;
    });
  }
  
  markdown += '\n## Potential CSS Issues\n\n';
  
  const allIssues = [...heroAnalysis.issues, ...pageAnalysis.issues];
  const criticalIssues = allIssues.filter(i => i.startsWith('❌'));
  const warnings = allIssues.filter(i => i.startsWith('⚠️'));
  
  if (criticalIssues.length > 0) {
    markdown += '### Critical Issues (❌)\n\n';
    criticalIssues.forEach(issue => {
      markdown += `- ${issue}\n`;
    });
    markdown += '\n';
  }
  
  if (warnings.length > 0) {
    markdown += '### Warnings (⚠️)\n\n';
    warnings.forEach(issue => {
      markdown += `- ${issue}\n`;
    });
    markdown += '\n';
  }
  
  markdown += '## Recommendations\n\n';
  
  if (heroAnalysis.hasPotentialIssues || pageAnalysis.hasPotentialIssues) {
    markdown += '### Fixes Needed\n\n';
    
    if (pageAnalysis.checks.hasZIndex50) {
      markdown += '1. **Check z-index stacking**: Ensure hero z-50 is not covered by nav/header\n';
      markdown += '   - Check if nav/header has z-index > 50\n';
      markdown += '   - Consider increasing hero z-index if needed\n\n';
    }
    
    if (pageAnalysis.checks.hasComplexPositioning) {
      markdown += '2. **Simplify responsive positioning**: Complex positioning can cause layout issues\n';
      markdown += '   - Test at all breakpoints (mobile, tablet, desktop)\n';
      markdown += '   - Verify hero is not clipped or hidden\n\n';
    }
    
    if (pageAnalysis.checks.hasOverflowHidden) {
      markdown += '3. **Check overflow clipping**: overflow-x-hidden might clip hero content\n';
      markdown += '   - Verify hero is not clipped on mobile/tablet\n';
      markdown += '   - Consider removing overflow-hidden if not needed\n\n';
    }
    
    if (heroAnalysis.checks.hasOverflowHidden) {
      markdown += '4. **Check hero overflow**: overflow-hidden on hero container\n';
      markdown += '   - Ensure background image is not clipped\n';
      markdown += '   - Verify absolute positioning is correct\n\n';
    }
    
    markdown += '### Testing Steps\n\n';
    markdown += '1. **Temporarily add background color** to hero container:\n';
    markdown += '   ```css\n';
    markdown += '   .hero-container { background-color: red !important; }\n';
    markdown += '   ```\n';
    markdown += '   - If red shows, container exists but image might not be loading\n';
    markdown += '   - If red doesn\'t show, container is collapsed or hidden\n\n';
    
    markdown += '2. **Check computed styles** in browser DevTools:\n';
    markdown += '   - Height: Should be at least 240px (mobile) or 360px (desktop)\n';
    markdown += '   - Position: Should be relative or absolute\n';
    markdown += '   - Overflow: Check if hidden is clipping content\n';
    markdown += '   - Z-index: Check stacking context\n\n';
    
    markdown += '3. **Test at all breakpoints**:\n';
    markdown += '   - Mobile (≤390px): Check if hero is visible\n';
    markdown += '   - Tablet (~768px): Check layout transition\n';
    markdown += '   - Desktop (≥1280px): Check if sidebar covers hero\n\n';
  } else {
    markdown += '✅ **No obvious CSS issues found**\n\n';
    markdown += 'The CSS appears to be correctly implemented:\n';
    markdown += '- Hero has min-height to prevent collapse\n';
    markdown += '- Background image is on correct element\n';
    markdown += '- Positioning is correct\n\n';
    markdown += 'If images still not showing, the issue is likely:\n';
    markdown += '- Image URL not resolving correctly\n';
    markdown += '- Image failing to load\n';
    markdown += '- Runtime error in image resolution\n';
  }
  
  // Write report
  const reportPath = path.join(__dirname, '..', 'documentation', 'images', 'BUCKET_C_CSS_LAYOUT_DIAGNOSIS.md');
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`\n✅ Diagnosis report saved to: ${reportPath}`);
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`   Critical issues: ${criticalIssues.length}`);
  console.log(`   Warnings: ${warnings.length}`);
  
  if (criticalIssues.length > 0 || warnings.length > 0) {
    console.log('\n⚠️  Potential CSS/layout issues found:');
    if (criticalIssues.length > 0) {
      console.log('   Critical:');
      criticalIssues.forEach(issue => console.log(`     ${issue}`));
    }
    if (warnings.length > 0) {
      console.log('   Warnings:');
      warnings.forEach(issue => console.log(`     ${issue}`));
    }
  } else {
    console.log('\n✅ No obvious CSS/layout issues found');
    console.log('   CSS appears correctly implemented');
    console.log('   Issue likely in data flow or image loading');
  }
}

main();
