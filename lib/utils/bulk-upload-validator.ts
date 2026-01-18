/**
 * Bulk Upload Data Validator
 * 
 * Validates data for different entity types before bulk upload
 */

type EntityType = 'courses' | 'subscriptions' | 'entitlements';

interface ValidationResult {
  valid: boolean;
  errors: Array<{ row: number; field?: string; message: string }>;
}

/**
 * Validates a single row of data for the specified entity type
 */
export function validateEntityData(
  row: any,
  entityType: EntityType,
  rowNumber: number
): ValidationResult {
  const errors: Array<{ row: number; field?: string; message: string }> = [];

  switch (entityType) {
    case 'courses':
      return validateCourse(row, rowNumber);
    case 'subscriptions':
      return validateSubscription(row, rowNumber);
    case 'entitlements':
      return validateEntitlement(row, rowNumber);
    default:
      errors.push({
        row: rowNumber,
        message: `Unknown entity type: ${entityType}`,
      });
      return { valid: false, errors };
  }
}

function validateCourse(row: any, rowNumber: number): ValidationResult {
  const errors: Array<{ row: number; field?: string; message: string }> = [];

  // Required fields
  if (!row.slug || typeof row.slug !== 'string' || row.slug.trim() === '') {
    errors.push({ row: rowNumber, field: 'slug', message: 'slug is required and must be a non-empty string' });
  }

  if (!row.title || typeof row.title !== 'string' || row.title.trim() === '') {
    errors.push({ row: rowNumber, field: 'title', message: 'title is required and must be a non-empty string' });
  }

  // Optional fields with validation
  if (row.duration_weeks !== undefined && row.duration_weeks !== null) {
    const weeks = parseInt(String(row.duration_weeks), 10);
    if (isNaN(weeks) || weeks < 1) {
      errors.push({ row: rowNumber, field: 'duration_weeks', message: 'duration_weeks must be a positive integer' });
    }
  }

  if (row.difficulty_level !== undefined && row.difficulty_level !== null) {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(String(row.difficulty_level).toLowerCase())) {
      errors.push({ row: rowNumber, field: 'difficulty_level', message: `difficulty_level must be one of: ${validLevels.join(', ')}` });
    }
  }

  if (row.is_published !== undefined && row.is_published !== null) {
    const published = String(row.is_published).toLowerCase();
    if (published !== 'true' && published !== 'false' && published !== '1' && published !== '0') {
      errors.push({ row: rowNumber, field: 'is_published', message: 'is_published must be true or false' });
    }
  }

  // Hero image validation guardrail
  // Course must have either:
  // 1. imageUrl or thumbnail_url (direct image)
  // 2. category (for track-based fallback)
  // 3. allow_fallback: true (explicitly allow fallback)
  const hasImageUrl = row.imageUrl && typeof row.imageUrl === 'string' && row.imageUrl.trim().length > 0;
  const hasThumbnailUrl = row.thumbnail_url && typeof row.thumbnail_url === 'string' && row.thumbnail_url.trim().length > 0;
  const hasCategory = row.category && typeof row.category === 'string' && row.category.trim().length > 0;
  const allowFallback = row.allow_fallback === true || row.allow_fallback === 'true' || row.allowFallback === true || row.allowFallback === 'true';

  // Validate image URLs if provided
  if (hasImageUrl) {
    const imageUrl = String(row.imageUrl).trim();
    if (!isValidImageUrl(imageUrl)) {
      errors.push({ row: rowNumber, field: 'imageUrl', message: `imageUrl is invalid or appears to be a placeholder: "${imageUrl}"` });
    }
  }

  if (hasThumbnailUrl) {
    const thumbnailUrl = String(row.thumbnail_url).trim();
    if (!isValidImageUrl(thumbnailUrl)) {
      errors.push({ row: rowNumber, field: 'thumbnail_url', message: `thumbnail_url is invalid or appears to be a placeholder: "${thumbnailUrl}"` });
    }
  }

  // Guardrail: Require hero image source unless fallback is explicitly enabled
  if (!hasImageUrl && !hasThumbnailUrl && !hasCategory && !allowFallback) {
    errors.push({
      row: rowNumber,
      field: 'heroImage',
      message: 'Course must have either imageUrl, thumbnail_url, or category (for track-based fallback). If none are available, set allow_fallback: true to explicitly enable fallback.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates if an image URL is valid (not a placeholder)
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 0 &&
         trimmed !== 'image' &&
         trimmed !== 'placeholder' &&
         !trimmed.startsWith('http://placeholder') &&
         !trimmed.startsWith('placeholder');
}

function validateSubscription(row: any, rowNumber: number): ValidationResult {
  const errors: Array<{ row: number; field?: string; message: string }> = [];

  // Required fields
  if (!row.user_id || typeof row.user_id !== 'string') {
    errors.push({ row: rowNumber, field: 'user_id', message: 'user_id is required and must be a UUID string' });
  } else {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(row.user_id)) {
      errors.push({ row: rowNumber, field: 'user_id', message: 'user_id must be a valid UUID' });
    }
  }

  if (!row.stripe_price_id || typeof row.stripe_price_id !== 'string') {
    errors.push({ row: rowNumber, field: 'stripe_price_id', message: 'stripe_price_id is required and must be a string' });
  }

  if (!row.status || typeof row.status !== 'string') {
    errors.push({ row: rowNumber, field: 'status', message: 'status is required and must be a string' });
  } else {
    const validStatuses = ['active', 'trialing', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired'];
    if (!validStatuses.includes(row.status.toLowerCase())) {
      errors.push({ row: rowNumber, field: 'status', message: `status must be one of: ${validStatuses.join(', ')}` });
    }
  }

  // Optional fields
  if (row.current_period_end !== undefined && row.current_period_end !== null) {
    const date = new Date(row.current_period_end);
    if (isNaN(date.getTime())) {
      errors.push({ row: rowNumber, field: 'current_period_end', message: 'current_period_end must be a valid ISO date string' });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateEntitlement(row: any, rowNumber: number): ValidationResult {
  const errors: Array<{ row: number; field?: string; message: string }> = [];

  // Required fields
  if (!row.user_id || typeof row.user_id !== 'string') {
    errors.push({ row: rowNumber, field: 'user_id', message: 'user_id is required and must be a UUID string' });
  } else {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(row.user_id)) {
      errors.push({ row: rowNumber, field: 'user_id', message: 'user_id must be a valid UUID' });
    }
  }

  // Either course_id or course_slug is required
  if (!row.course_id && !row.course_slug) {
    errors.push({ row: rowNumber, message: 'Either course_id or course_slug is required' });
  }

  if (row.course_id && typeof row.course_id !== 'string') {
    errors.push({ row: rowNumber, field: 'course_id', message: 'course_id must be a UUID string' });
  } else if (row.course_id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(row.course_id)) {
      errors.push({ row: rowNumber, field: 'course_id', message: 'course_id must be a valid UUID' });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
