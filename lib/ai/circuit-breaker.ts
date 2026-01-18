/**
 * Circuit Breaker for LLM Provider
 * Prevents cascading failures by short-circuiting after repeated failures
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject requests immediately
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening circuit
  successThreshold: number;    // Number of successes to close circuit (half-open)
  timeout: number;              // Time in ms before attempting half-open
  resetTimeout: number;        // Time in ms before resetting failure count
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,         // Open circuit after 5 failures
  successThreshold: 2,         // Close circuit after 2 successes (half-open)
  timeout: 60000,              // 60 seconds before attempting half-open
  resetTimeout: 300000,        // 5 minutes before resetting failure count
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number | null = null;
  private openedAt: number | null = null;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if circuit is open and should reject request
   */
  isOpen(): boolean {
    if (this.state === CircuitState.OPEN) {
      // Check if we should attempt half-open
      if (this.openedAt && Date.now() - this.openedAt >= this.config.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        return false; // Allow one request to test
      }
      return true; // Still open, reject
    }

    if (this.state === CircuitState.HALF_OPEN) {
      return false; // Allow requests to test recovery
    }

    // CLOSED state - check if we should reset failure count
    if (this.lastFailureTime && Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
      this.failureCount = 0;
      this.lastFailureTime = null;
    }

    return false; // Closed, allow requests
  }

  /**
   * Record a successful call
   */
  onSuccess(): void {
    this.failureCount = 0;
    this.lastFailureTime = null;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        // Circuit recovered, close it
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        this.openedAt = null;
      }
    } else if (this.state === CircuitState.OPEN) {
      // Shouldn't happen, but reset if it does
      this.state = CircuitState.CLOSED;
      this.openedAt = null;
    }
  }

  /**
   * Record a failed call
   */
  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during half-open, open circuit again
      this.state = CircuitState.OPEN;
      this.openedAt = Date.now();
      this.successCount = 0;
    } else if (this.failureCount >= this.config.failureThreshold) {
      // Too many failures, open circuit
      this.state = CircuitState.OPEN;
      this.openedAt = Date.now();
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Reset circuit breaker (for testing or manual recovery)
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.openedAt = null;
  }
}

/**
 * Global circuit breakers per provider
 */
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Get or create circuit breaker for a provider
 */
export function getCircuitBreaker(providerName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
  if (!circuitBreakers.has(providerName)) {
    circuitBreakers.set(providerName, new CircuitBreaker(config));
  }
  return circuitBreakers.get(providerName)!;
}
