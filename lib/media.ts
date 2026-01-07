import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Base media item interface
export interface BaseMediaItem {
  id: string;
  [key: string]: unknown;
}

// Specific media types
export interface VideoItem extends BaseMediaItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration?: string;
  description?: string;
}

export interface BookItem extends BaseMediaItem {
  id: string;
  title: string;
  authors: string[];
  url?: string;
  isbn?: string;
  publisher?: string;
  year?: number;
}

export interface BlogItem extends BaseMediaItem {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  readTime?: string;
  excerpt?: string;
  thumbnailUrl?: string;
}

// Union type for all media
export type MediaItem = VideoItem | BookItem | BlogItem;

// Media registry containing all loaded media
export interface MediaRegistry {
  videos: Map<string, VideoItem>;
  books: Map<string, BookItem>;
  blogs: Map<string, BlogItem>;
}

// Default media directory
const DEFAULT_MEDIA_DIR = path.join(process.cwd(), 'content', 'media');

/**
 * Validates that all media items have unique IDs
 * Throws if duplicates or missing IDs are found
 */
function validateMediaIds<T extends BaseMediaItem>(
  items: T[],
  type: string
): void {
  const ids = new Set<string>();
  const duplicates: string[] = [];
  const missing: number[] = [];

  items.forEach((item, index) => {
    if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
      missing.push(index);
    } else if (ids.has(item.id)) {
      duplicates.push(item.id);
    } else {
      ids.add(item.id);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Media validation failed for ${type}: Missing IDs at indices ${missing.join(', ')}`
    );
  }

  if (duplicates.length > 0) {
    throw new Error(
      `Media validation failed for ${type}: Duplicate IDs found: ${duplicates.join(', ')}`
    );
  }
}

/**
 * Loads and validates a YAML media file
 */
function loadMediaFile<T extends BaseMediaItem>(
  filePath: string,
  type: string
): T[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Media file not found: ${filePath}`);
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(fileContents) as T[];

  if (!Array.isArray(data)) {
    throw new Error(`Media file ${filePath} must contain an array of items`);
  }

  validateMediaIds(data, type);
  return data;
}

/**
 * Loads all media YAML files and validates unique IDs
 * Fails fast if IDs are missing or duplicated
 */
export function loadMediaRegistry(
  mediaDir: string = DEFAULT_MEDIA_DIR
): MediaRegistry {
  const videosPath = path.join(mediaDir, 'videos.yaml');
  const booksPath = path.join(mediaDir, 'books.yaml');
  const blogsPath = path.join(mediaDir, 'blogs.yaml');

  const videos = loadMediaFile<VideoItem>(videosPath, 'videos');
  const books = loadMediaFile<BookItem>(booksPath, 'books');
  const blogs = loadMediaFile<BlogItem>(blogsPath, 'blogs');

  // Convert arrays to Maps for O(1) lookup
  const registry: MediaRegistry = {
    videos: new Map(videos.map((v) => [v.id, v])),
    books: new Map(books.map((b) => [b.id, b])),
    blogs: new Map(blogs.map((bl) => [bl.id, bl])),
  };

  return registry;
}

/**
 * Creates a lookup function for media by ID
 * Returns the media item or null if not found
 */
export function createMediaLookup(
  registry: MediaRegistry
): (mediaId: string, type: 'video' | 'book' | 'blog') => MediaItem | null {
  return (mediaId: string, type: 'video' | 'book' | 'blog'): MediaItem | null => {
    switch (type) {
      case 'video':
        return registry.videos.get(mediaId) || null;
      case 'book':
        return registry.books.get(mediaId) || null;
      case 'blog':
        return registry.blogs.get(mediaId) || null;
      default:
        return null;
    }
  };
}

/**
 * Helper to parse media reference string (e.g., "video:mcp-overview")
 * Returns { type, id } or null if invalid format
 */
export function parseMediaRef(
  ref: string
): { type: 'video' | 'book' | 'blog'; id: string } | null {
  const parts = ref.split(':');
  if (parts.length !== 2) {
    return null;
  }

  const [type, id] = parts;
  if (type !== 'video' && type !== 'book' && type !== 'blog') {
    return null;
  }

  return { type, id };
}

/**
 * Singleton media registry (loaded once at module initialization)
 * Throws if validation fails
 */
let mediaRegistry: MediaRegistry | null = null;

/**
 * Gets the media registry, loading it if necessary
 * Throws if validation fails
 */
export function getMediaRegistry(): MediaRegistry {
  if (!mediaRegistry) {
    mediaRegistry = loadMediaRegistry();
  }
  return mediaRegistry;
}

/**
 * Resets the media registry (useful for testing or hot reloading)
 */
export function resetMediaRegistry(): void {
  mediaRegistry = null;
}

