import React from 'react';

export interface VideoCardProps {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  metadata?: {
    [key: string]: unknown;
  };
}

/**
 * VideoCard component for displaying video content in MDX
 * Accepts structured props and renders clean, accessible UI
 * Does not hardcode URLs - expects videoId to be resolved via metadata
 */
export function VideoCard({
  videoId,
  title,
  description,
  thumbnailUrl,
  duration,
  metadata,
}: VideoCardProps) {
  // In a real implementation, you'd resolve the video URL from metadata
  // For now, we'll use a placeholder pattern
  const videoUrl = metadata?.url as string | undefined;

  return (
    <div className="video-card" role="article" aria-labelledby={`video-title-${videoId}`}>
      <div className="video-card__thumbnail">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            loading="lazy"
          />
        ) : (
          <div className="video-card__placeholder" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
        {duration && (
          <span className="video-card__duration" aria-label={`Duration: ${duration}`}>
            {duration}
          </span>
        )}
      </div>
      <div className="video-card__content">
        <h3 id={`video-title-${videoId}`} className="video-card__title">
          {title}
        </h3>
        {description && (
          <p className="video-card__description">{description}</p>
        )}
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card__link"
            aria-label={`Watch ${title}`}
          >
            Watch Video
          </a>
        )}
      </div>
    </div>
  );
}

