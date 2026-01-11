/**
 * Index lessons for RAG (Retrieval Augmented Generation)
 * Chunks lessons, generates embeddings, and stores in Supabase
 */

import 'server-only';

import { loadAllLessons, type Lesson } from '@/lib/lessons';
import { getEmbeddingProvider } from './embeddings';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface LessonChunk {
  courseSlug: string;
  lessonSlug: string;
  chunkIndex: number;
  content: string;
  metadata: {
    title?: string;
    module?: string;
    week?: number;
    order?: number;
    sectionHeaders?: string[];
  };
}

/**
 * Chunk a lesson's content into smaller pieces
 * Uses a simple strategy: split by double newlines, then by paragraphs
 * Ensures chunks are between minChunkSize and maxChunkSize characters
 */
export function chunkLesson(
  lesson: Lesson,
  minChunkSize: number = 200,
  maxChunkSize: number = 1000,
  overlap: number = 100
): LessonChunk[] {
  const chunks: LessonChunk[] = [];
  const content = lesson.content;

  // Extract section headers for metadata
  const sectionHeaders: string[] = [];
  const headerRegex = /^#{1,3}\s+(.+)$/gm;
  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    sectionHeaders.push(match[1].trim());
  }

  // Split by double newlines (paragraphs)
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();

    // If adding this paragraph would exceed maxChunkSize, save current chunk
    if (currentChunk.length + trimmedParagraph.length > maxChunkSize && currentChunk.length >= minChunkSize) {
      chunks.push({
        courseSlug: lesson.courseSlug || '',
        lessonSlug: lesson.slug,
        chunkIndex: chunkIndex++,
        content: currentChunk.trim(),
        metadata: {
          title: lesson.frontmatter.title,
          module: lesson.frontmatter.module,
          week: lesson.frontmatter.week,
          order: lesson.frontmatter.order,
          sectionHeaders: sectionHeaders.filter((h) => currentChunk.includes(h)),
        },
      });

      // Start new chunk with overlap (last N characters of previous chunk)
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n\n' + trimmedParagraph;
    } else {
      // Add paragraph to current chunk
      if (currentChunk) {
        currentChunk += '\n\n' + trimmedParagraph;
      } else {
        currentChunk = trimmedParagraph;
      }
    }
  }

  // Add final chunk if it exists
  if (currentChunk.trim().length >= minChunkSize) {
    chunks.push({
      courseSlug: lesson.courseSlug || '',
      lessonSlug: lesson.slug,
      chunkIndex: chunkIndex++,
      content: currentChunk.trim(),
      metadata: {
        title: lesson.frontmatter.title,
        module: lesson.frontmatter.module,
        week: lesson.frontmatter.week,
        order: lesson.frontmatter.order,
        sectionHeaders: sectionHeaders.filter((h) => currentChunk.includes(h)),
      },
    });
  }

  return chunks;
}

/**
 * Index a single lesson (chunk, embed, store)
 */
export async function indexLesson(
  lesson: Lesson,
  options: {
    generateEmbeddings?: boolean;
    minChunkSize?: number;
    maxChunkSize?: number;
    overlap?: number;
  } = {}
): Promise<number> {
  const {
    generateEmbeddings = true,
    minChunkSize = 200,
    maxChunkSize = 1000,
    overlap = 100,
  } = options;

  const supabase = createServerSupabaseClient();
  const courseSlug = lesson.courseSlug || '';

  // Delete existing chunks for this lesson
  await supabase
    .from('lesson_chunks')
    .delete()
    .eq('course_slug', courseSlug)
    .eq('lesson_slug', lesson.slug);

  // Chunk the lesson
  const chunks = chunkLesson(lesson, minChunkSize, maxChunkSize, overlap);

  if (chunks.length === 0) {
    return 0;
  }

  // Generate embeddings if enabled
  let embeddings: number[][] | null = null;
  if (generateEmbeddings) {
    try {
      const embeddingProvider = getEmbeddingProvider();
      const chunkTexts = chunks.map((chunk) => chunk.content);
      embeddings = await embeddingProvider.embedBatch(chunkTexts);
    } catch (error) {
      console.warn('Failed to generate embeddings, storing chunks without embeddings:', error);
      // Continue without embeddings (keyword search fallback)
    }
  }

  // Prepare chunks for insertion
  const chunksToInsert = chunks.map((chunk, index) => ({
    course_slug: chunk.courseSlug,
    lesson_slug: chunk.lessonSlug,
    chunk_index: chunk.chunkIndex,
    content: chunk.content,
    content_length: chunk.content.length,
    embedding: embeddings ? embeddings[index] : null,
    metadata: chunk.metadata,
  }));

  // Insert chunks in batches (Supabase has a limit on batch size)
  const batchSize = 100;
  let insertedCount = 0;

  for (let i = 0; i < chunksToInsert.length; i += batchSize) {
    const batch = chunksToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('lesson_chunks').insert(batch);

    if (error) {
      console.error(`Error inserting chunk batch ${i / batchSize + 1}:`, error);
      throw error;
    }

    insertedCount += batch.length;
  }

  return insertedCount;
}

/**
 * Index all lessons for a course
 */
export async function indexCourse(
  courseSlug: string,
  options: {
    generateEmbeddings?: boolean;
    minChunkSize?: number;
    maxChunkSize?: number;
    overlap?: number;
  } = {}
): Promise<{ lessonSlug: string; chunkCount: number }[]> {
  const lessons = loadAllLessons(undefined, courseSlug);
  const results: { lessonSlug: string; chunkCount: number }[] = [];

  for (const lesson of lessons) {
    try {
      const chunkCount = await indexLesson(lesson, options);
      results.push({ lessonSlug: lesson.slug, chunkCount });
      console.log(`Indexed ${lesson.slug}: ${chunkCount} chunks`);
    } catch (error) {
      console.error(`Error indexing lesson ${lesson.slug}:`, error);
      results.push({ lessonSlug: lesson.slug, chunkCount: 0 });
    }
  }

  return results;
}

/**
 * Index all lessons across all courses
 */
export async function indexAllLessons(
  options: {
    generateEmbeddings?: boolean;
    minChunkSize?: number;
    maxChunkSize?: number;
    overlap?: number;
  } = {}
): Promise<{ courseSlug: string; lessonCount: number; totalChunks: number }[]> {
  const { getAllCourseSlugs } = await import('@/lib/lessons');
  const courseSlugs = getAllCourseSlugs();
  const results: { courseSlug: string; lessonCount: number; totalChunks: number }[] = [];

  for (const courseSlug of courseSlugs) {
    try {
      const lessonResults = await indexCourse(courseSlug, options);
      const totalChunks = lessonResults.reduce((sum, r) => sum + r.chunkCount, 0);
      results.push({
        courseSlug,
        lessonCount: lessonResults.length,
        totalChunks,
      });
      console.log(`Indexed course ${courseSlug}: ${lessonResults.length} lessons, ${totalChunks} chunks`);
    } catch (error) {
      console.error(`Error indexing course ${courseSlug}:`, error);
      results.push({ courseSlug, lessonCount: 0, totalChunks: 0 });
    }
  }

  return results;
}
