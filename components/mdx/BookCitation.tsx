import React from 'react';

export interface BookCitationProps {
  bookId: string;
  title: string;
  authors: string[];
  year?: number;
  isbn?: string;
  publisher?: string;
  url?: string;
  metadata?: {
    [key: string]: unknown;
  };
}

/**
 * BookCitation component for displaying book references in MDX
 * Accepts structured props and renders clean, accessible UI
 * Does not hardcode URLs - expects bookId to be resolved via metadata
 */
export function BookCitation({
  bookId,
  title,
  authors,
  year,
  isbn,
  publisher,
  url,
  metadata,
}: BookCitationProps) {
  // Resolve URL from metadata if not provided directly
  const bookUrl = url || (metadata?.url as string | undefined);
  const authorsList = Array.isArray(authors) ? authors : [authors];

  return (
    <div className="book-citation" role="article" aria-labelledby={`book-title-${bookId}`}>
      <div className="book-citation__content">
        <h3 id={`book-title-${bookId}`} className="book-citation__title">
          {title}
        </h3>
        <div className="book-citation__details">
          <p className="book-citation__authors">
            <span className="sr-only">Authors: </span>
            {authorsList.join(', ')}
          </p>
          {(year || publisher) && (
            <p className="book-citation__meta">
              {year && <span>{year}</span>}
              {year && publisher && <span aria-hidden="true"> • </span>}
              {publisher && <span>{publisher}</span>}
            </p>
          )}
          {isbn && (
            <p className="book-citation__isbn">
              <span className="sr-only">ISBN: </span>
              {isbn}
            </p>
          )}
        </div>
        {bookUrl && (
          <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="book-citation__link"
            aria-label={`View ${title} by ${authorsList.join(', ')}`}
          >
            View Book
          </a>
        )}
      </div>
    </div>
  );
}

