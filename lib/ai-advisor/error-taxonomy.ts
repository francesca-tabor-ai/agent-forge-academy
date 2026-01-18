/**
 * Centralized error taxonomy for AI Advisor chat endpoint
 * All errors are mapped through this single source of truth
 */

export enum ErrorClass {
  ValidationError = 'ValidationError',
  AuthError = 'AuthError',
  RateLimitError = 'RateLimitError',
  ProviderTimeout = 'ProviderTimeout',
  ProviderUnavailable = 'ProviderUnavailable',
  VectorStoreUnavailable = 'VectorStoreUnavailable',
  IndexMissing = 'IndexMissing',
  InternalError = 'InternalError',
}

export interface ErrorMapping {
  errorClass: ErrorClass;
  statusCode: number;
  userMessage: string;
  logMessage: string;
}

export interface ErrorContext {
  requestId: string;
  userId?: string;
  upstreamStatus?: number | null;
  errorMessage: string;
  originalError?: any;
  stage?: string;
}

/**
 * Map error to taxonomy
 * This is the single place where all errors are mapped to responses
 */
export function mapErrorToTaxonomy(
  error: any,
  context: ErrorContext
): ErrorMapping {
  const errorMessage = error?.message || String(error) || 'Unknown error';
  const upstreamStatus = context.upstreamStatus || extractUpstreamStatus(errorMessage);

  // Validation errors (400)
  if (
    errorMessage.includes('required') && 
    (errorMessage.includes('message') || errorMessage.includes('studentProfileId'))
  ) {
    return {
      errorClass: ErrorClass.ValidationError,
      statusCode: 400,
      userMessage: 'Invalid request. Please check your input and try again.',
      logMessage: `Validation error: ${errorMessage}`,
    };
  }

  // Auth errors (401/403)
  if (
    errorMessage.includes('UNAUTHORIZED') ||
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Session expired') ||
    errorMessage.includes('not authenticated')
  ) {
    return {
      errorClass: ErrorClass.AuthError,
      statusCode: 401,
      userMessage: 'Your session has expired. Please refresh the page and try again.',
      logMessage: `Authentication error: ${errorMessage}`,
    };
  }

  if (
    errorMessage.includes('403') ||
    errorMessage.includes('Forbidden') ||
    errorMessage.includes('not authorized')
  ) {
    return {
      errorClass: ErrorClass.AuthError,
      statusCode: 403,
      userMessage: 'You do not have permission to perform this action.',
      logMessage: `Authorization error: ${errorMessage}`,
    };
  }

  // Rate limit errors (429)
  if (
    errorMessage.includes('RATE_LIMIT_EXCEEDED') ||
    errorMessage.includes('429') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests')
  ) {
    return {
      errorClass: ErrorClass.RateLimitError,
      statusCode: 429,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      logMessage: `Rate limit exceeded: ${errorMessage}`,
    };
  }

  // Provider timeout (504)
  if (
    errorMessage.includes('TIMEOUT') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('took too long') ||
    errorMessage.includes('Request timeout') ||
    errorMessage.includes('504') ||
    error?.name === 'AbortError' ||
    upstreamStatus === 504
  ) {
    return {
      errorClass: ErrorClass.ProviderTimeout,
      statusCode: 504,
      userMessage: 'The AI response is taking longer than expected. Please try again in a moment.',
      logMessage: `Provider timeout: ${errorMessage}`,
    };
  }

  // Circuit breaker open
  if (
    errorMessage.includes('Circuit breaker is OPEN') ||
    errorMessage.includes('circuit breaker') ||
    errorMessage.includes('temporarily unavailable')
  ) {
    return {
      errorClass: ErrorClass.ProviderUnavailable,
      statusCode: 503,
      userMessage: 'AI service is temporarily unavailable due to repeated failures. Please try again in a moment.',
      logMessage: `Circuit breaker open: ${errorMessage}`,
    };
  }

  // Provider unavailable (503) - Missing API key or configuration
  if (
    errorMessage.includes('SERVICE_UNAVAILABLE') ||
    errorMessage.includes('LLM_API_KEY') ||
    errorMessage.includes('not configured') ||
    errorMessage.includes('API key') && errorMessage.includes('required') ||
    errorMessage.includes('Provider not configured')
  ) {
    return {
      errorClass: ErrorClass.ProviderUnavailable,
      statusCode: 503,
      userMessage: 'AI service is currently unavailable. Please contact support if this persists.',
      logMessage: `Provider unavailable: ${errorMessage}`,
    };
  }

  // Provider unavailable (503) - Provider API 5xx errors
  if (
    upstreamStatus && 
    upstreamStatus >= 500 && 
    upstreamStatus < 600 &&
    upstreamStatus !== 504 // Timeout handled separately
  ) {
    return {
      errorClass: ErrorClass.ProviderUnavailable,
      statusCode: 503,
      userMessage: 'AI service is temporarily unavailable. Please try again in a moment.',
      logMessage: `Provider API error (${upstreamStatus}): ${errorMessage}`,
    };
  }

  // Vector store unavailable (503)
  if (
    errorMessage.includes('vector') && 
    (errorMessage.includes('unavailable') || errorMessage.includes('failed') || errorMessage.includes('error'))
  ) {
    return {
      errorClass: ErrorClass.VectorStoreUnavailable,
      statusCode: 503,
      userMessage: 'Search functionality is temporarily unavailable. Please try again in a moment.',
      logMessage: `Vector store unavailable: ${errorMessage}`,
    };
  }

  // Index missing (424/404)
  if (
    errorMessage.includes('index') && 
    (errorMessage.includes('missing') || errorMessage.includes('not found') || errorMessage.includes('not indexed'))
  ) {
    return {
      errorClass: ErrorClass.IndexMissing,
      statusCode: 424, // Failed Dependency
      userMessage: 'Course content is not yet indexed. Please contact support.',
      logMessage: `Index missing: ${errorMessage}`,
    };
  }

  if (
    errorMessage.includes('404') ||
    errorMessage.includes('not found') ||
    upstreamStatus === 404
  ) {
    // Check if it's about course/index content
    if (errorMessage.includes('course') || errorMessage.includes('index') || errorMessage.includes('chunk')) {
      return {
        errorClass: ErrorClass.IndexMissing,
        statusCode: 404,
        userMessage: 'Requested course content was not found.',
        logMessage: `Content not found: ${errorMessage}`,
      };
    }
  }

  // Default: Internal error (500)
  return {
    errorClass: ErrorClass.InternalError,
    statusCode: 500,
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
    logMessage: `Internal error: ${errorMessage}`,
  };
}

/**
 * Extract upstream status code from error message
 */
function extractUpstreamStatus(errorMessage: string): number | null {
  // Try to extract HTTP status code from error message
  const statusMatch = errorMessage.match(/(\d{3})/);
  if (statusMatch) {
    const status = parseInt(statusMatch[1], 10);
    if (status >= 100 && status < 600) {
      return status;
    }
  }
  return null;
}

/**
 * Create error response with taxonomy
 */
export function createErrorResponse(
  error: any,
  context: ErrorContext
): {
  response: {
    ok: false;
    error: {
      code: string;
      message: string;
      requestId: string;
    };
  };
  statusCode: number;
  headers: {
    'X-Request-ID': string;
  };
  logData: {
    requestId: string;
    userId?: string;
    errorClass: ErrorClass;
    statusCode: number;
    upstreamStatus?: number | null;
    errorMessage: string;
    stage?: string;
    message: string;
  };
} {
  const mapping = mapErrorToTaxonomy(error, context);
  const upstreamStatus = context.upstreamStatus || extractUpstreamStatus(context.errorMessage);

  return {
    response: {
      ok: false,
      error: {
        code: mapping.errorClass,
        message: mapping.userMessage,
        requestId: context.requestId,
      },
    },
    statusCode: mapping.statusCode,
    headers: {
      'X-Request-ID': context.requestId,
    },
    logData: {
      requestId: context.requestId,
      userId: context.userId,
      errorClass: mapping.errorClass,
      statusCode: mapping.statusCode,
      upstreamStatus: upstreamStatus,
      errorMessage: context.errorMessage,
      stage: context.stage,
      message: mapping.logMessage,
    },
  };
}
