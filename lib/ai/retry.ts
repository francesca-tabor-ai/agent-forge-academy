/**
 * Retry logic with exponential backoff for LLM Provider
 */

export interface RetryConfig {
  maxRetries: number;          // Maximum number of retries
  initialDelay: number;         // Initial delay in ms
  maxDelay: number;             // Maximum delay in ms
  multiplier: number;           // Exponential multiplier
  jitter: boolean;              // Add random jitter to prevent thundering herd
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,           // 1 second
  maxDelay: 30000,              // 30 seconds
  multiplier: 2,                // Double delay each retry
  jitter: true,
};

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any, statusCode?: number): boolean {
  // Don't retry on client errors (4xx except 429)
  if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
    return false;
  }

  // Retry on server errors (5xx)
  if (statusCode && statusCode >= 500) {
    return true;
  }

  // Retry on rate limit (429)
  if (statusCode === 429) {
    return true;
  }

  // Retry on network errors
  const errorMessage = error?.message || String(error);
  if (
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ETIMEDOUT') ||
    error?.name === 'TypeError'
  ) {
    return true;
  }

  // Don't retry on timeout (user-facing timeout, not transient)
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('TIMEOUT') ||
    error?.name === 'AbortError'
  ) {
    return false;
  }

  // Don't retry on authentication/authorization errors
  if (
    errorMessage.includes('401') ||
    errorMessage.includes('403') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Forbidden')
  ) {
    return false;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.initialDelay * Math.pow(config.multiplier, attempt);
  const delay = Math.min(exponentialDelay, config.maxDelay);

  if (config.jitter) {
    // Add random jitter (0-50% of delay)
    const jitterAmount = Math.random() * delay * 0.5;
    return Math.floor(delay + jitterAmount);
  }

  return Math.floor(delay);
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  extractStatusCode?: (error: any) => number | undefined
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error: any) {
      lastError = error;

      // Extract status code if available
      const statusCode = extractStatusCode ? extractStatusCode(error) : extractStatusCodeFromError(error);

      // Check if error is retryable
      if (!isRetryableError(error, statusCode)) {
        throw error; // Don't retry non-retryable errors
      }

      // Check if we've exhausted retries
      if (attempt >= retryConfig.maxRetries) {
        throw error; // Max retries reached
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, retryConfig);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Extract status code from error message
 */
function extractStatusCodeFromError(error: any): number | undefined {
  const errorMessage = error?.message || String(error);
  const statusMatch = errorMessage.match(/(\d{3})/);
  if (statusMatch) {
    const status = parseInt(statusMatch[1], 10);
    if (status >= 100 && status < 600) {
      return status;
    }
  }
  return undefined;
}
