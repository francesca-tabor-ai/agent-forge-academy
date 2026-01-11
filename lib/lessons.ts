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
  course?: string; // Course slug this lesson belongs to
  email_takeaway?: string; // Short takeaway for weekly emails
  email_action?: string; // Optional action item for weekly emails
  [key: string]: unknown;
}

export interface Lesson {
  slug: string;
  courseSlug?: string; // Course slug if lesson is in a course subdirectory
  frontmatter: LessonFrontmatter;
  content: string;
}

// Default content directory (can be overridden)
const DEFAULT_CONTENT_DIR = path.join(process.cwd(), 'course');

/**
 * Gets all course slugs by detecting subdirectories in the course directory
 * @param contentDir - Optional custom content directory path
 * @returns Array of course slugs (directory names)
 */
export function getAllCourseSlugs(contentDir: string = DEFAULT_CONTENT_DIR): string[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const items = fs.readdirSync(contentDir, { withFileTypes: true });
  return items
    .filter((item) => item.isDirectory() && !item.name.startsWith('.'))
    .map((item) => item.name);
}

/**
 * Loads all markdown lessons from the content directory
 * Supports both flat structure (backward compatible) and course-based structure
 * @param contentDir - Optional custom content directory path
 * @param courseSlug - Optional course slug to filter lessons
 * @returns Array of lessons with parsed frontmatter and content
 */
export function loadAllLessons(
  contentDir: string = DEFAULT_CONTENT_DIR,
  courseSlug?: string
): Lesson[] {
  if (!fs.existsSync(contentDir)) {
    throw new Error(`Content directory not found: ${contentDir}`);
  }

  const lessons: Lesson[] = [];

  if (courseSlug) {
    // Load lessons from a specific course directory
    const courseDir = path.join(contentDir, courseSlug);
    if (fs.existsSync(courseDir) && fs.statSync(courseDir).isDirectory()) {
      const files = fs.readdirSync(courseDir);
      for (const file of files) {
        if (!file.endsWith('.md')) {
          continue;
        }

        const filePath = path.join(courseDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        const slug = file.replace(/\.md$/, '');

        lessons.push({
          slug,
          courseSlug,
          frontmatter: { ...data, course: courseSlug } as LessonFrontmatter,
          content,
        });
      }
    }
  } else {
    // Load lessons from all course directories + root (backward compatible)
    const items = fs.readdirSync(contentDir, { withFileTypes: true });

    // First, check for course subdirectories
    const courseDirs = items.filter((item) => item.isDirectory() && !item.name.startsWith('.'));
    
    for (const courseDir of courseDirs) {
      const coursePath = path.join(contentDir, courseDir.name);
      const files = fs.readdirSync(coursePath);
      
      for (const file of files) {
        if (!file.endsWith('.md')) {
          continue;
        }

        const filePath = path.join(coursePath, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        const slug = file.replace(/\.md$/, '');

        lessons.push({
          slug,
          courseSlug: courseDir.name,
          frontmatter: { ...data, course: courseDir.name } as LessonFrontmatter,
          content,
        });
      }
    }

    // Also check root directory for backward compatibility
    const rootFiles = items.filter((item) => item.isFile() && item.name.endsWith('.md'));
    for (const file of rootFiles) {
      const filePath = path.join(contentDir, file.name);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      const slug = file.name.replace(/\.md$/, '');

      lessons.push({
        slug,
        frontmatter: data as LessonFrontmatter,
        content,
      });
    }
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
 * @param courseSlug - Optional course slug to search within a specific course
 * @returns Lesson object or null if not found
 */
export function loadLessonBySlug(
  slug: string,
  contentDir: string = DEFAULT_CONTENT_DIR,
  courseSlug?: string
): Lesson | null {
  // If course slug is provided, search only in that course directory
  if (courseSlug) {
    const courseDir = path.join(contentDir, courseSlug);
    const filePath = path.join(courseDir, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        courseSlug,
        frontmatter: { ...data, course: courseSlug } as LessonFrontmatter,
        content,
      };
    }
    return null;
  }

  // Otherwise, search in all course directories and root (backward compatible)
  const items = fs.readdirSync(contentDir, { withFileTypes: true });

  // First check course subdirectories
  const courseDirs = items.filter((item) => item.isDirectory() && !item.name.startsWith('.'));
  for (const courseDir of courseDirs) {
    const coursePath = path.join(contentDir, courseDir.name);
    const filePath = path.join(coursePath, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        courseSlug: courseDir.name,
        frontmatter: { ...data, course: courseDir.name } as LessonFrontmatter,
        content,
      };
    }
  }

  // Fallback to root directory (backward compatible)
  const filePath = path.join(contentDir, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      frontmatter: data as LessonFrontmatter,
      content,
    };
  }

  return null;
}

/**
 * Gets all lesson slugs (for static generation)
 * Returns slugs in format: { slug, courseSlug? } for course-based lessons
 * @param contentDir - Optional custom content directory path
 * @param courseSlug - Optional course slug to filter lessons
 * @returns Array of lesson slugs with optional course context
 */
export function getAllLessonSlugs(
  contentDir: string = DEFAULT_CONTENT_DIR,
  courseSlug?: string
): Array<{ slug: string; courseSlug?: string }> {
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const slugs: Array<{ slug: string; courseSlug?: string }> = [];

  if (courseSlug) {
    // Get slugs from specific course directory
    const courseDir = path.join(contentDir, courseSlug);
    if (fs.existsSync(courseDir) && fs.statSync(courseDir).isDirectory()) {
      const files = fs.readdirSync(courseDir);
      files
        .filter((file) => file.endsWith('.md'))
        .forEach((file) => {
          slugs.push({
            slug: file.replace(/\.md$/, ''),
            courseSlug,
          });
        });
    }
  } else {
    // Get slugs from all course directories + root
    const items = fs.readdirSync(contentDir, { withFileTypes: true });

    // Course subdirectories
    const courseDirs = items.filter((item) => item.isDirectory() && !item.name.startsWith('.'));
    for (const courseDir of courseDirs) {
      const coursePath = path.join(contentDir, courseDir.name);
      const files = fs.readdirSync(coursePath);
      files
        .filter((file) => file.endsWith('.md'))
        .forEach((file) => {
          slugs.push({
            slug: file.replace(/\.md$/, ''),
            courseSlug: courseDir.name,
          });
        });
    }

    // Root directory files (backward compatible)
    const rootFiles = items.filter((item) => item.isFile() && item.name.endsWith('.md'));
    rootFiles.forEach((file) => {
      slugs.push({
        slug: file.name.replace(/\.md$/, ''),
      });
    });
  }

  return slugs;
}

