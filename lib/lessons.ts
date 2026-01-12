import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Type definitions for video chapter metadata
export interface VideoChapter {
  label: string;
  start_seconds: number;
  end_seconds?: number;
}

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
  video_youtube_ids?: string[]; // Array of YouTube video IDs
  video_primary_youtube_id?: string; // Primary YouTube video ID
  video_chapters?: VideoChapter[]; // Array of video chapters with timestamps
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
 * Validates and normalizes lesson frontmatter data
 * Ensures video fields are properly typed and validated
 * @param data - Raw frontmatter data from gray-matter
 * @returns Validated and normalized LessonFrontmatter
 */
function validateAndNormalizeFrontmatter(data: Record<string, unknown>): LessonFrontmatter {
  const frontmatter: LessonFrontmatter = {
    title: typeof data.title === 'string' ? data.title : '',
    ...(typeof data.module === 'string' && { module: data.module }),
    ...(typeof data.week === 'number' && { week: data.week }),
    ...(typeof data.order === 'number' && { order: data.order }),
    ...(typeof data.description === 'string' && { description: data.description }),
    ...(typeof data.course === 'string' && { course: data.course }),
    ...(typeof data.email_takeaway === 'string' && { email_takeaway: data.email_takeaway }),
    ...(typeof data.email_action === 'string' && { email_action: data.email_action }),
  };

  // Validate video_youtube_ids: must be an array of strings
  if (data.video_youtube_ids !== undefined) {
    if (Array.isArray(data.video_youtube_ids)) {
      const validIds = data.video_youtube_ids.filter(
        (id): id is string => typeof id === 'string' && id.length > 0
      );
      if (validIds.length > 0) {
        frontmatter.video_youtube_ids = validIds;
      }
    }
  }

  // Validate video_primary_youtube_id: must be a non-empty string
  if (data.video_primary_youtube_id !== undefined) {
    if (typeof data.video_primary_youtube_id === 'string' && data.video_primary_youtube_id.length > 0) {
      frontmatter.video_primary_youtube_id = data.video_primary_youtube_id;
    }
  }

  // Validate video_chapters: must be an array of objects with label and start_seconds
  if (data.video_chapters !== undefined) {
    if (Array.isArray(data.video_chapters)) {
      const validChapters: VideoChapter[] = [];
      for (const chapter of data.video_chapters) {
        if (
          typeof chapter === 'object' &&
          chapter !== null &&
          typeof (chapter as Record<string, unknown>).label === 'string' &&
          typeof (chapter as Record<string, unknown>).start_seconds === 'number'
        ) {
          const chapterObj = chapter as Record<string, unknown>;
          const validChapter: VideoChapter = {
            label: chapterObj.label as string,
            start_seconds: chapterObj.start_seconds as number,
          };
          // Optional end_seconds
          if (typeof chapterObj.end_seconds === 'number') {
            validChapter.end_seconds = chapterObj.end_seconds;
          }
          validChapters.push(validChapter);
        }
      }
      if (validChapters.length > 0) {
        frontmatter.video_chapters = validChapters;
      }
    }
  }

  // Preserve any other unknown fields
  for (const [key, value] of Object.entries(data)) {
    if (!(key in frontmatter)) {
      (frontmatter as Record<string, unknown>)[key] = value;
    }
  }

  return frontmatter;
}

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
        const validatedFrontmatter = validateAndNormalizeFrontmatter({ ...data, course: courseSlug });

        lessons.push({
          slug,
          courseSlug,
          frontmatter: validatedFrontmatter,
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
        const validatedFrontmatter = validateAndNormalizeFrontmatter({ ...data, course: courseDir.name });

        lessons.push({
          slug,
          courseSlug: courseDir.name,
          frontmatter: validatedFrontmatter,
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
      const validatedFrontmatter = validateAndNormalizeFrontmatter(data);

      lessons.push({
        slug,
        frontmatter: validatedFrontmatter,
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
      const validatedFrontmatter = validateAndNormalizeFrontmatter({ ...data, course: courseSlug });

      return {
        slug,
        courseSlug,
        frontmatter: validatedFrontmatter,
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
      const validatedFrontmatter = validateAndNormalizeFrontmatter({ ...data, course: courseDir.name });

      return {
        slug,
        courseSlug: courseDir.name,
        frontmatter: validatedFrontmatter,
        content,
      };
    }
  }

  // Fallback to root directory (backward compatible)
  const filePath = path.join(contentDir, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const validatedFrontmatter = validateAndNormalizeFrontmatter(data);

    return {
      slug,
      frontmatter: validatedFrontmatter,
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

/**
 * Gets the next lesson in the course/module sequence
 * @param currentLessonSlug - The slug of the current lesson
 * @param courseSlug - Optional course slug to filter lessons within a course
 * @returns Next lesson object or null if no next lesson exists
 */
export function getNextLesson(
  currentLessonSlug: string,
  courseSlug?: string
): Lesson | null {
  const allLessons = loadAllLessons(undefined, courseSlug);
  
  // Find current lesson index
  const currentIndex = allLessons.findIndex(
    (lesson) => lesson.slug === currentLessonSlug
  );
  
  if (currentIndex === -1) {
    return null; // Current lesson not found
  }
  
  // Check if there's a next lesson
  if (currentIndex < allLessons.length - 1) {
    return allLessons[currentIndex + 1];
  }
  
  return null; // No next lesson (last lesson in course)
}

/**
 * Gets lesson navigation info (current index, total, next lesson)
 * @param currentLessonSlug - The slug of the current lesson
 * @param courseSlug - Optional course slug to filter lessons within a course
 * @returns Navigation info object
 */
export function getLessonNavigation(
  currentLessonSlug: string,
  courseSlug?: string
): {
  currentIndex: number;
  totalLessons: number;
  nextLesson: Lesson | null;
  isLastLesson: boolean;
} {
  const allLessons = loadAllLessons(undefined, courseSlug);
  const currentIndex = allLessons.findIndex(
    (lesson) => lesson.slug === currentLessonSlug
  );
  
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1
    ? allLessons[currentIndex + 1]
    : null;
  
  return {
    currentIndex: currentIndex >= 0 ? currentIndex : -1,
    totalLessons: allLessons.length,
    nextLesson,
    isLastLesson: currentIndex === allLessons.length - 1,
  };
}
