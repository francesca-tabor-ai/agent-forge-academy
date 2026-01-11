#!/usr/bin/env node
/**
 * Generate _COURSE_METADATA.md files for existing courses
 * Uses data from course-metadata.ts and existing MD files
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getAllCourseSlugs } from '../lib/lessons';
import { courseMetadata } from '../lib/course-metadata';

const DEFAULT_CONTENT_DIR = path.join(process.cwd(), 'course');

interface MetadataToWrite {
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  duration_weeks: number | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null;
  is_published: boolean;
  thumbnail_url: string | null;
}

function estimateDurationWeeks(timeString: string | undefined): number | null {
  if (!timeString) return null;
  
  // Match patterns like "~4–6 hours", "7 weeks", "~6–8 weeks"
  const weekMatch = timeString.match(/(\d+)[-–]?(\d+)?\s*week/i);
  if (weekMatch) {
    const num = parseInt(weekMatch[1], 10);
    return num;
  }
  
  const hourMatch = timeString.match(/(\d+)[-–]?(\d+)?\s*hour/i);
  if (hourMatch) {
    const num = parseInt(hourMatch[1], 10);
    // Estimate: ~10 hours per week
    return Math.ceil(num / 10);
  }
  
  return null;
}

function estimateDifficulty(timeString: string | undefined, durationWeeks: number | null): 'beginner' | 'intermediate' | 'advanced' | null {
  if (durationWeeks) {
    if (durationWeeks >= 8) return 'advanced';
    if (durationWeeks >= 4) return 'intermediate';
    return 'beginner';
  }
  
  // Fallback: check time string
  if (timeString?.includes('week')) {
    return 'intermediate';
  }
  
  return null;
}

function generateMetadataForCourse(courseSlug: string): MetadataToWrite | null {
  const courseDir = path.join(DEFAULT_CONTENT_DIR, courseSlug);
  
  if (!fs.existsSync(courseDir)) {
    return null;
  }

  // Try to get from legacy course-metadata.ts
  const legacy = courseMetadata[courseSlug];
  
  // Try to extract from existing MD files
  let title: string | null = null;
  let description: string | null = null;
  
  const metadataFiles = ['INDEX.md', '_COURSE_OVERVIEW.md', 'README.md'];
  for (const file of metadataFiles) {
    const filePath = path.join(courseDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);
        if (data.title) title = String(data.title);
        if (data.description) description = String(data.description);
        if (title && description) break;
      } catch (error) {
        // Continue to next file
      }
    }
  }

  // Use legacy data as fallback
  if (!title && legacy) {
    title = legacy.title;
  }
  if (!description && legacy) {
    description = legacy.outcome || null;
  }
  
  if (!title) {
    // Generate from slug
    title = courseSlug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const durationWeeks = estimateDurationWeeks(legacy?.time);
  const difficultyLevel = estimateDifficulty(legacy?.time, durationWeeks);

  return {
    slug: courseSlug,
    title,
    description,
    category: legacy?.category || null,
    duration_weeks: durationWeeks,
    difficulty_level: difficultyLevel,
    is_published: true, // Assume published
    thumbnail_url: null,
  };
}

function generateMetadataFileContent(metadata: MetadataToWrite): string {
  const frontmatter: Record<string, unknown> = {
    slug: metadata.slug,
    title: metadata.title,
  };

  if (metadata.description) {
    frontmatter.description = metadata.description;
  }

  if (metadata.category) {
    frontmatter.category = metadata.category;
  }

  if (metadata.duration_weeks !== null) {
    frontmatter.duration_weeks = metadata.duration_weeks;
  }

  if (metadata.difficulty_level) {
    frontmatter.difficulty_level = metadata.difficulty_level;
  }

  frontmatter.is_published = metadata.is_published;

  if (metadata.thumbnail_url) {
    frontmatter.thumbnail_url = metadata.thumbnail_url;
  }

  // Generate YAML frontmatter
  const yamlLines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'string' && (value.includes(':') || value.includes('\n'))) {
      yamlLines.push(`${key}: |`);
      value.split('\n').forEach((line) => {
        yamlLines.push(`  ${line}`);
      });
    } else {
      yamlLines.push(`${key}: ${typeof value === 'string' ? `"${value}"` : value}`);
    }
  }
  yamlLines.push('---');
  yamlLines.push('');

  return yamlLines.join('\n');
}

async function main() {
  console.log('Generating _COURSE_METADATA.md files...\n');

  const courseSlugs = getAllCourseSlugs(DEFAULT_CONTENT_DIR);
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const slug of courseSlugs) {
    const courseDir = path.join(DEFAULT_CONTENT_DIR, slug);
    const metadataPath = path.join(courseDir, '_COURSE_METADATA.md');

    // Skip if already exists
    if (fs.existsSync(metadataPath)) {
      console.log(`⏭️  Skipping ${slug} (metadata file already exists)`);
      skipped++;
      continue;
    }

    try {
      const metadata = generateMetadataForCourse(slug);
      if (!metadata) {
        console.log(`⚠️  Skipping ${slug} (could not generate metadata)`);
        skipped++;
        continue;
      }

      const content = generateMetadataFileContent(metadata);
      fs.writeFileSync(metadataPath, content, 'utf8');
      console.log(`✅ Created ${slug}/_COURSE_METADATA.md`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating metadata for ${slug}:`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  ✅ Created: ${created}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log('='.repeat(60));
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
