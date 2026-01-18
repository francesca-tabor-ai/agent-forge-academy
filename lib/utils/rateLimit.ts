/**
 * Rate limiting for API endpoints
 * 
 * Supports both per-user and per-IP rate limiting
 * Uses in-memory storage (for production, consider Redis or a dedicated rate limiting service)
 */

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// In-memory stores for rate limits
// In production, use Redis or a database
const userRateLimitStore = new Map<string, RateLimitEntry>();
const ipRateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a key (user ID or IP) has exceeded the rate limit
 * 
 * @param key - Key to check rate limit for (user ID or IP address)
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @param store - Store to use (userRateLimitStore or ipRateLimitStore)
 * @returns Rate limit result
 */
function checkRateLimitForKey(
  key: string,
  maxRequests: number,
  windowMs: number,
  store: Map<string, RateLimitEntry>
): RateLimitResult {
  const now = Date.now();
  
  let entry = store.get(key);
  
  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(key, entry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: entry.resetAt,
      limit: maxRequests,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      limit: maxRequests,
    };
  }
  
  // Increment count
  entry.count++;
  store.set(key, entry);
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
    limit: maxRequests,
  };
}

/**
 * Check if a user has exceeded the rate limit
 * 
 * @param userId - User ID to check rate limit for
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export function checkRateLimit(
  userId: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  return checkRateLimitForKey(userId, maxRequests, windowMs, userRateLimitStore);
}

/**
 * Check if an IP address has exceeded the rate limit
 * 
 * @param ipAddress - IP address to check rate limit for
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export function checkIPRateLimit(
  ipAddress: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  return checkRateLimitForKey(ipAddress, maxRequests, windowMs, ipRateLimitStore);
}

/**
 * Check both user and IP rate limits
 * Returns the most restrictive result
 * 
 * @param userId - User ID to check rate limit for
 * @param ipAddress - IP address to check rate limit for
 * @param userConfig - User rate limit configuration
 * @param ipConfig - IP rate limit configuration
 * @returns Rate limit result (most restrictive)
 */
export function checkRateLimits(
  userId: string | null,
  ipAddress: string,
  userConfig: RateLimitConfig,
  ipConfig: RateLimitConfig
): RateLimitResult {
  const ipResult = checkIPRateLimit(ipAddress, ipConfig.maxRequests, ipConfig.windowMs);
  
  // If IP limit exceeded, return immediately
  if (!ipResult.allowed) {
    return ipResult;
  }
  
  // If no user ID, only check IP limit
  if (!userId) {
    return ipResult;
  }
  
  // Check user limit
  const userResult = checkRateLimit(userId, userConfig.maxRequests, userConfig.windowMs);
  
  // Return the most restrictive result
  if (!userResult.allowed) {
    return userResult;
  }
  
  // Return the result with the least remaining requests
  return userResult.remaining < ipResult.remaining ? userResult : ipResult;
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
