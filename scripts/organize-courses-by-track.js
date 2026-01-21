const fs = require('fs');
const path = require('path');

// Import course metadata - we'll parse it from the file
const metadataPath = path.join(__dirname, '..', 'lib', 'course-metadata.ts');
const metadataContent = fs.readFileSync(metadataPath, 'utf-8');

/**
 * Convert track name to URL-friendly folder name
 */
function trackToFolderName(track) {
  return track
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Parse course metadata from TypeScript file
const courseMetadata = {};
const courseRegex = /'([^']+)':\s*\{([^}]+category:\s*'([^']+)'[^}]*)\}/gs;
let match;

while ((match = courseRegex.exec(metadataContent)) !== null) {
  const slug = match[1];
  const category = match[3];
  if (slug && category) {
    courseMetadata[slug] = { category };
  }
}

const courseDir = path.join(__dirname, '..', 'course');

// Get all course directories (only direct children, not nested)
const entries = fs.readdirSync(courseDir, { withFileTypes: true });
const courseDirs = entries
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .filter(name => {
    // Only include if it's a course (exists in metadata or is a known course folder)
    // and is not already in a track folder (doesn't contain path separators in the name)
    return !name.includes('/') && !name.includes('\\');
  });

console.log(`Found ${courseDirs.length} course directories`);

// Track mapping: track folder name -> courses to move
const trackMap = {};
const unmappedCourses = [];

// Group courses by track
for (const courseSlug of courseDirs) {
  const metadata = courseMetadata[courseSlug];
  
  if (!metadata || !metadata.category) {
    unmappedCourses.push(courseSlug);
    console.log(`⚠️  No track found for: ${courseSlug}`);
    continue;
  }

  const trackFolder = trackToFolderName(metadata.category);
  
  if (!trackMap[trackFolder]) {
    trackMap[trackFolder] = [];
  }
  
  trackMap[trackFolder].push(courseSlug);
}

console.log(`\nOrganizing courses into ${Object.keys(trackMap).length} tracks:`);
for (const [track, courses] of Object.entries(trackMap)) {
  console.log(`  ${track}: ${courses.length} courses`);
}

if (unmappedCourses.length > 0) {
  console.log(`\n⚠️  ${unmappedCourses.length} courses without tracks: ${unmappedCourses.join(', ')}`);
}

// Create track folders and move courses
console.log('\nCreating track folders and moving courses...');

for (const [trackFolder, courses] of Object.entries(trackMap)) {
  const trackPath = path.join(courseDir, trackFolder);
  
  // Create track folder if it doesn't exist
  if (!fs.existsSync(trackPath)) {
    fs.mkdirSync(trackPath, { recursive: true });
    console.log(`✓ Created track folder: ${trackFolder}`);
  }

  // Move each course into its track folder
  for (const courseSlug of courses) {
    const sourcePath = path.join(courseDir, courseSlug);
    const destPath = path.join(trackPath, courseSlug);
    
    if (fs.existsSync(destPath)) {
      console.log(`⚠️  Skipping ${courseSlug} - already exists in ${trackFolder}`);
      continue;
    }

    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Source not found: ${courseSlug}`);
      continue;
    }

    try {
      fs.renameSync(sourcePath, destPath);
      console.log(`  ✓ Moved ${courseSlug} → ${trackFolder}/`);
    } catch (error) {
      console.error(`  ✗ Failed to move ${courseSlug}:`, error.message);
    }
  }
}

console.log('\n✓ Organization complete!');
