import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Type definitions for lesson metadata
export interface LessonFrontmatter {
  title: string;
  module?: string;
  week?: number;
  order?: number;
  description?: string;
  [key: string]: unknown;
}

export interface Lesson {
  slug: string;
  frontmatter: LessonFrontmatter;
  content: string;
}

// Default content directory (can be overridden)
const DEFAULT_CONTENT_DIR = path.join(process.cwd(), 'course');

/**
 * Loads all markdown lessons from the content directory
 * @param contentDir - Optional custom content directory path
 * @returns Array of lessons with parsed frontmatter and content
 */
export function loadAllLessons(contentDir: string = DEFAULT_CONTENT_DIR): Lesson[] {
  if (!fs.existsSync(contentDir)) {
    throw new Error(`Content directory not found: ${contentDir}`);
  }

  const files = fs.readdirSync(contentDir);
  const lessons: Lesson[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) {
      continue;
    }

    const filePath = path.join(contentDir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    // Generate slug from filename (remove .md extension)
    const slug = file.replace(/\.md$/, '');

    lessons.push({
      slug,
      frontmatter: data as LessonFrontmatter,
      content,
    });
  }

  // Sort by order if available, otherwise by filename
  lessons.sort((a, b) => {
    const orderA = a.frontmatter.order ?? 0;
    const orderB = b.frontmatter.order ?? 0;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.slug.localeCompare(b.slug);
  });

  return lessons;
}

/**
 * Loads a single lesson by slug
 * @param slug - The lesson slug (filename without .md)
 * @param contentDir - Optional custom content directory path
 * @returns Lesson object or null if not found
 */
export function loadLessonBySlug(
  slug: string,
  contentDir: string = DEFAULT_CONTENT_DIR
): Lesson | null {
  const filePath = path.join(contentDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    frontmatter: data as LessonFrontmatter,
    content,
  };
}

/**
 * Gets all lesson slugs (for static generation)
 * @param contentDir - Optional custom content directory path
 * @returns Array of lesson slugs
 */
export function getAllLessonSlugs(contentDir: string = DEFAULT_CONTENT_DIR): string[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir);
  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}

