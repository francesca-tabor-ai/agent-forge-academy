import React from 'react';
import Image from 'next/image';

export interface BlogPreviewProps {
  blogId: string;
  title: string;
  excerpt?: string;
  author?: string;
  publishedDate?: string;
  readTime?: string;
  thumbnailUrl?: string;
  url?: string;
  metadata?: {
    [key: string]: unknown;
  };
}

/**
 * BlogPreview component for displaying blog post previews in MDX
 * Accepts structured props and renders clean, accessible UI
 * Does not hardcode URLs - expects blogId to be resolved via metadata
 */
export function BlogPreview({
  blogId,
  title,
  excerpt,
  author,
  publishedDate,
  readTime,
  thumbnailUrl,
  url,
  metadata,
}: BlogPreviewProps) {
  // Resolve URL from metadata if not provided directly
  const blogUrl = url || (metadata?.url as string | undefined);

  return (
    <article className="blog-preview" aria-labelledby={`blog-title-${blogId}`}>
      {thumbnailUrl && (
        <div className="blog-preview__thumbnail">
          <Image
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            width={400}
            height={225}
            className="object-cover"
          />
        </div>
      )}
      <div className="blog-preview__content">
        <h3 id={`blog-title-${blogId}`} className="blog-preview__title">
          {title}
        </h3>
        {excerpt && (
          <p className="blog-preview__excerpt">{excerpt}</p>
        )}
        <div className="blog-preview__meta">
          {author && (
            <span className="blog-preview__author">
              <span className="sr-only">Author: </span>
              {author}
            </span>
          )}
          {publishedDate && (
            <time
              dateTime={publishedDate}
              className="blog-preview__date"
            >
              {new Date(publishedDate).toLocaleDateString()}
            </time>
          )}
          {readTime && (
            <span className="blog-preview__read-time" aria-label={`Reading time: ${readTime}`}>
              {readTime}
            </span>
          )}
        </div>
        {blogUrl && (
          <a
            href={blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-preview__link"
            aria-label={`Read ${title}`}
          >
            Read Article
          </a>
        )}
      </div>
    </article>
  );
}

