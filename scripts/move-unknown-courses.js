const fs = require('fs');
const path = require('path');

const courseDir = path.join(__dirname, '..', 'course');

// Course to track mappings
const courseTracks = {
  'ai-driven-credit-scoring-lending': 'agentic-systems',
  'ai-powered-financial-risk-management': 'agentic-systems',
  'algorithmic-trading-market-intelligence': 'economics-and-maths',
  'automated-financial-reporting-analysis': 'media-and-content-ops',
  'automated-suitability-esg-matching': 'trust-and-regulation',
  'distribution-marketing-intelligence': 'ai-search-and-visibility',
  'esg-sustainable-investment-insights': 'ai-search-and-visibility',
  'financial-fraud-detection-ai': 'agentic-systems',
  'frictionless-compliance-onboarding-assistant': 'agentic-systems',
  'hyper-personalized-client-communication': 'gtm-and-revenue-operations',
  'intelligent-data-management-verification': 'agentic-systems',
  'intelligent-document-intelligence-hub': 'agentic-systems',
  'investment-siri-mass-market-clients': 'gtm-and-revenue-operations',
  'operational-efficiency-tools': 'vibe-engineering',
  'predictive-wealth-insights-dashboard': 'economics-and-maths',
  'reasoning-over-uncertainty': 'economics-and-maths',
  'regulatory-compliance-greenwashing-prevention': 'trust-and-regulation',
};

console.log('Moving courses from unknown folder to their proper tracks...\n');

let moved = 0;
let skipped = 0;
let notFound = 0;

for (const [course, track] of Object.entries(courseTracks)) {
  const sourcePath = path.join(courseDir, 'unknown', course);
  const trackPath = path.join(courseDir, track);
  const destPath = path.join(trackPath, course);
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Source not found: ${course}`);
    notFound++;
    continue;
  }
  
  // Create track folder if it doesn't exist
  if (!fs.existsSync(trackPath)) {
    fs.mkdirSync(trackPath, { recursive: true });
    console.log(`✓ Created track folder: ${track}`);
  }
  
  if (fs.existsSync(destPath)) {
    console.log(`⚠️  Skipping ${course} - already exists in ${track}`);
    skipped++;
    continue;
  }
  
  try {
    fs.renameSync(sourcePath, destPath);
    console.log(`✓ Moved ${course} → ${track}/`);
    moved++;
  } catch (error) {
    console.error(`✗ Failed to move ${course}:`, error.message);
  }
}

console.log(`\n✓ Summary: ${moved} moved, ${skipped} skipped, ${notFound} not found`);
