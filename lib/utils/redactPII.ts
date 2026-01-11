/**
 * PII (Personally Identifiable Information) Redaction Utility
 * 
 * Redacts sensitive information from text before logging to prevent
 * PII from appearing in logs, error messages, or debugging output.
 */

/**
 * Redact PII from text content
 * 
 * @param text - Text that may contain PII
 * @param options - Options for redaction behavior
 * @returns Redacted text with PII replaced by [REDACTED] markers
 */
export function redactPII(
  text: string | null | undefined,
  options: {
    redactEmails?: boolean;
    redactPhones?: boolean;
    redactAddresses?: boolean;
    redactSSN?: boolean;
    redactCreditCards?: boolean;
    redactURLs?: boolean;
    redactNames?: boolean; // Optional: redact common name patterns
    maxLength?: number; // Truncate long text (e.g., CV text, transcripts)
    preserveLength?: boolean; // Keep original length with [REDACTED] markers
  } = {}
): string {
  if (!text || typeof text !== 'string') {
    return '[REDACTED: empty]';
  }

  const {
    redactEmails = true,
    redactPhones = true,
    redactAddresses = true,
    redactSSN = true,
    redactCreditCards = true,
    redactURLs = false, // URLs are usually safe unless they contain tokens
    redactNames = false, // Names are optional - can be too aggressive
    maxLength = 500, // Default: truncate long text to 500 chars
    preserveLength = false,
  } = options;

  let redacted = text;

  // Email addresses
  if (redactEmails) {
    redacted = redacted.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      (match) => preserveLength ? '[REDACTED]'.padEnd(match.length, 'X') : '[REDACTED: email]'
    );
  }

  // Phone numbers (various formats)
  if (redactPhones) {
    // US/UK phone formats: (555) 123-4567, 555-123-4567, +1 555 123 4567, etc.
    redacted = redacted.replace(
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      (match) => preserveLength ? '[REDACTED]'.padEnd(match.length, 'X') : '[REDACTED: phone]'
    );
  }

  // Social Security Numbers (US format: XXX-XX-XXXX)
  if (redactSSN) {
    redacted = redacted.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g,
      (match) => preserveLength ? '[REDACTED]'.padEnd(match.length, 'X') : '[REDACTED: SSN]'
    );
  }

  // Credit card numbers (16 digits, possibly with spaces/dashes)
  if (redactCreditCards) {
    redacted = redacted.replace(
      /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
      (match) => preserveLength ? '[REDACTED]'.padEnd(match.length, 'X') : '[REDACTED: card]'
    );
  }

  // Physical addresses (common patterns)
  if (redactAddresses) {
    // Street addresses: "123 Main St", "456 Oak Avenue", etc.
    redacted = redacted.replace(
      /\b\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Court|Ct|Way|Circle|Cir)\b/gi,
      (match) => preserveLength ? '[REDACTED]'.padEnd(match.length, 'X') : '[REDACTED: address]'
    );
  }

  // URLs (optional - usually safe unless they contain tokens)
  if (redactURLs) {
    redacted = redacted.replace(
      /https?:\/\/[^\s]+/g,
      (match) => preserveLength ? '[REDACTED]'.padEnd(match.length, 'X') : '[REDACTED: url]'
    );
  }

  // Names (optional - can be too aggressive, use with caution)
  if (redactNames) {
    // Common name patterns (capitalized words that might be names)
    // This is a simple heuristic and may have false positives
    redacted = redacted.replace(
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      (match) => preserveLength ? '[REDACTED]'.padEnd(match.length, 'X') : '[REDACTED: name]'
    );
  }

  // Truncate long text (e.g., CV text, full transcripts)
  if (maxLength > 0 && redacted.length > maxLength) {
    redacted = redacted.substring(0, maxLength) + '...[TRUNCATED]';
  }

  return redacted;
}

/**
 * Redact PII from an object (recursively)
 * Useful for redacting PII from error objects or request/response data
 * 
 * @param obj - Object that may contain PII
 * @param options - Redaction options
 * @returns Object with PII redacted
 */
export function redactPIIFromObject(
  obj: any,
  options: Parameters<typeof redactPII>[1] = {}
): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle strings
  if (typeof obj === 'string') {
    return redactPII(obj, options);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactPIIFromObject(item, options));
  }

  // Handle objects
  if (typeof obj === 'object') {
    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip redaction for certain safe keys
      const safeKeys = ['id', 'timestamp', 'created_at', 'updated_at', 'status', 'type'];
      if (safeKeys.includes(key.toLowerCase())) {
        redacted[key] = value;
      } else {
        // Recursively redact nested objects
        redacted[key] = redactPIIFromObject(value, options);
      }
    }
    return redacted;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Safe logger that automatically redacts PII
 * Use this instead of console.log/error/warn for logging user data
 */
export const safeLogger = {
  log: (message: string, ...args: any[]) => {
    const redactedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return redactPII(arg, { maxLength: 500 });
      }
      return redactPIIFromObject(arg, { maxLength: 500 });
    });
    console.log(redactPII(message, { maxLength: 500 }), ...redactedArgs);
  },

  error: (message: string, error?: any) => {
    const redactedMessage = redactPII(message, { maxLength: 500 });
    if (error) {
      // Redact error message and stack if present
      const redactedError = {
        ...error,
        message: error.message ? redactPII(error.message, { maxLength: 500 }) : error.message,
        stack: error.stack ? redactPII(error.stack, { maxLength: 200 }) : error.stack,
      };
      console.error(redactedMessage, redactedError);
    } else {
      console.error(redactedMessage);
    }
  },

  warn: (message: string, ...args: any[]) => {
    const redactedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return redactPII(arg, { maxLength: 500 });
      }
      return redactPIIFromObject(arg, { maxLength: 500 });
    });
    console.warn(redactPII(message, { maxLength: 500 }), ...redactedArgs);
  },

  info: (message: string, ...args: any[]) => {
    const redactedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return redactPII(arg, { maxLength: 500 });
      }
      return redactPIIFromObject(arg, { maxLength: 500 });
    });
    console.info(redactPII(message, { maxLength: 500 }), ...redactedArgs);
  },
};
