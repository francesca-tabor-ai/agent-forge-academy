/**
 * Provider-agnostic LLM interface
 * Supports multiple providers (OpenAI, Anthropic) behind a common API
 */

import { getCircuitBreaker, CircuitState } from './circuit-breaker';
import { withRetry, isRetryableError } from './retry';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
  finishReason?: string;
}

export interface LLMProvider {
  /**
   * Generate a non-streaming response
   */
  generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;

  /**
   * Generate a streaming response
   * Yields chunks as they arrive
   */
  generateStream(
    messages: LLMMessage[],
    options?: LLMOptions
  ): AsyncGenerator<LLMStreamChunk, void, unknown>;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  stopSequences?: string[];
  timeout?: number;              // Request timeout in ms (default: 30s for non-streaming, 60s for streaming)
  signal?: AbortSignal;          // AbortSignal for cancellation
}

/**
 * Get the configured LLM provider
 * Reads from environment variables to determine which provider to use
 * @param fallbackProvider - Optional fallback provider to try if primary fails
 */
export function getLLMProvider(fallbackProvider?: string): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'openai';
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error('LLM_API_KEY environment variable is required');
  }

  const providerToUse = fallbackProvider || provider;

  switch (providerToUse.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${providerToUse}`);
  }
}

/**
 * Get LLM provider with fallback support
 * Tries primary provider first, falls back to secondary if configured
 */
export function getLLMProviderWithFallback(): { provider: LLMProvider; providerName: string; isFallback: boolean } {
  const primaryProvider = process.env.LLM_PROVIDER || 'openai';
  const fallbackProvider = process.env.LLM_FALLBACK_PROVIDER; // e.g., 'anthropic' if primary is 'openai'
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error('LLM_API_KEY environment variable is required');
  }

  try {
    const provider = getLLMProvider();
    return { provider, providerName: primaryProvider, isFallback: false };
  } catch (error) {
    // If primary fails and fallback is configured, try fallback
    if (fallbackProvider && fallbackProvider !== primaryProvider) {
      try {
        const provider = getLLMProvider(fallbackProvider);
        return { provider, providerName: fallbackProvider, isFallback: true };
      } catch (fallbackError) {
        // If fallback also fails, throw original error
        throw error;
      }
    }
    throw error;
  }
}

/**
 * OpenAI Provider Implementation
 */
class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  async generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const model = options?.model || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || 2000;
    const timeout = options?.timeout || 30000; // 30 seconds default for non-streaming
    const signal = options?.signal;

    // Check circuit breaker
    const circuitBreaker = getCircuitBreaker('openai');
    if (circuitBreaker.isOpen()) {
      throw new Error('Circuit breaker is OPEN - OpenAI provider is temporarily unavailable. Please try again in a moment.');
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    // Combine signals if both provided
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const result = await withRetry(
        async () => {
          const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              temperature,
              max_tokens: maxTokens,
              stop: options?.stopSequences,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const error = await response.text();
            const errorObj = new Error(`OpenAI API error: ${response.status} ${error}`);
            (errorObj as any).statusCode = response.status;
            throw errorObj;
          }

          const data = await response.json();
          const choice = data.choices[0];

          return {
            content: choice.message.content,
            finishReason: choice.finish_reason,
            usage: data.usage
              ? {
                  promptTokens: data.usage.prompt_tokens,
                  completionTokens: data.usage.completion_tokens,
                  totalTokens: data.usage.total_tokens,
                }
              : undefined,
          };
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 30000,
        },
        (error: any) => error.statusCode
      );

      // Success - record in circuit breaker
      circuitBreaker.onSuccess();
      return result;
    } catch (error: any) {
      // Check if retryable
      const statusCode = error.statusCode;
      if (isRetryableError(error, statusCode)) {
        circuitBreaker.onFailure();
      }

      // Handle timeout
      if (error.name === 'AbortError' || controller.signal.aborted) {
        throw new Error('Request timeout - The AI response took too long. Please try again.');
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async *generateStream(
    messages: LLMMessage[],
    options?: LLMOptions
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    const model = options?.model || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || 2000;
    const timeout = options?.timeout || 60000; // 60 seconds default for streaming
    const signal = options?.signal;

    // Check circuit breaker
    const circuitBreaker = getCircuitBreaker('openai');
    if (circuitBreaker.isOpen()) {
      throw new Error('Circuit breaker is OPEN - OpenAI provider is temporarily unavailable. Please try again in a moment.');
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    // Combine signals if both provided
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      // Retry logic for initial fetch (streaming itself can't be retried)
      const response = await withRetry(
        async () => {
          const res = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              temperature,
              max_tokens: maxTokens,
              stop: options?.stopSequences,
              stream: true,
            }),
            signal: controller.signal,
          });

          if (!res.ok) {
            const error = await res.text();
            const errorObj = new Error(`OpenAI API error: ${res.status} ${error}`);
            (errorObj as any).statusCode = res.status;
            throw errorObj;
          }

          return res;
        },
        {
          maxRetries: 2, // Fewer retries for streaming (can't retry mid-stream)
          initialDelay: 1000,
          maxDelay: 10000,
        },
        (error: any) => error.statusCode
      );

      // Success - record in circuit breaker
      circuitBreaker.onSuccess();

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let finishReason: string | undefined;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                yield { content: '', done: true, finishReason };
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices[0]?.delta;
                if (delta?.content) {
                  yield { content: delta.content, done: false };
                }
                if (parsed.choices[0]?.finish_reason) {
                  finishReason = parsed.choices[0].finish_reason;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim()) {
          const data = buffer.slice(6);
          if (data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0]?.delta;
              if (delta?.content) {
                yield { content: delta.content, done: false };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }

        yield { content: '', done: true, finishReason };
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      // Check if retryable
      const statusCode = error.statusCode;
      if (isRetryableError(error, statusCode)) {
        circuitBreaker.onFailure();
      }

      // Handle timeout
      if (error.name === 'AbortError' || controller.signal.aborted) {
        throw new Error('Request timeout - The AI response took too long. Please try again.');
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Anthropic Provider Implementation
 */
class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
  }

  async generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const model = options?.model || process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
    const maxTokens = options?.maxTokens || 2000;
    const timeout = options?.timeout || 30000; // 30 seconds default for non-streaming
    const signal = options?.signal;

    // Check circuit breaker
    const circuitBreaker = getCircuitBreaker('anthropic');
    if (circuitBreaker.isOpen()) {
      throw new Error('Circuit breaker is OPEN - Anthropic provider is temporarily unavailable. Please try again in a moment.');
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    // Combine signals if both provided
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const result = await withRetry(
        async () => {
          // Anthropic requires system message to be separate
          const systemMessage = messages.find((m) => m.role === 'system');
          const conversationMessages = messages.filter((m) => m.role !== 'system');

          const response = await fetch(`${this.baseURL}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model,
              max_tokens: maxTokens,
              system: systemMessage?.content,
              messages: conversationMessages.map((msg) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
              })),
              temperature: options?.temperature ?? 0.7,
              stop_sequences: options?.stopSequences,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const error = await response.text();
            const errorObj = new Error(`Anthropic API error: ${response.status} ${error}`);
            (errorObj as any).statusCode = response.status;
            throw errorObj;
          }

          const data = await response.json();
          const content = data.content[0]?.text || '';

          return {
            content,
            finishReason: data.stop_reason,
            usage: data.usage
              ? {
                  promptTokens: data.usage.input_tokens,
                  completionTokens: data.usage.output_tokens,
                  totalTokens: data.usage.input_tokens + data.usage.output_tokens,
                }
              : undefined,
          };
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 30000,
        },
        (error: any) => error.statusCode
      );

      // Success - record in circuit breaker
      circuitBreaker.onSuccess();
      return result;
    } catch (error: any) {
      // Check if retryable
      const statusCode = error.statusCode;
      if (isRetryableError(error, statusCode)) {
        circuitBreaker.onFailure();
      }

      // Handle timeout
      if (error.name === 'AbortError' || controller.signal.aborted) {
        throw new Error('Request timeout - The AI response took too long. Please try again.');
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async *generateStream(
    messages: LLMMessage[],
    options?: LLMOptions
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    const model = options?.model || process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
    const maxTokens = options?.maxTokens || 2000;
    const timeout = options?.timeout || 60000; // 60 seconds default for streaming
    const signal = options?.signal;

    // Check circuit breaker
    const circuitBreaker = getCircuitBreaker('anthropic');
    if (circuitBreaker.isOpen()) {
      throw new Error('Circuit breaker is OPEN - Anthropic provider is temporarily unavailable. Please try again in a moment.');
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    // Combine signals if both provided
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      // Retry logic for initial fetch (streaming itself can't be retried)
      const response = await withRetry(
        async () => {
          // Anthropic requires system message to be separate
          const systemMessage = messages.find((m) => m.role === 'system');
          const conversationMessages = messages.filter((m) => m.role !== 'system');

          const res = await fetch(`${this.baseURL}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model,
              max_tokens: maxTokens,
              system: systemMessage?.content,
              messages: conversationMessages.map((msg) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
              })),
              temperature: options?.temperature ?? 0.7,
              stop_sequences: options?.stopSequences,
              stream: true,
            }),
            signal: controller.signal,
          });

          if (!res.ok) {
            const error = await res.text();
            const errorObj = new Error(`Anthropic API error: ${res.status} ${error}`);
            (errorObj as any).statusCode = res.status;
            throw errorObj;
          }

          return res;
        },
        {
          maxRetries: 2, // Fewer retries for streaming (can't retry mid-stream)
          initialDelay: 1000,
          maxDelay: 10000,
        },
        (error: any) => error.statusCode
      );

      // Success - record in circuit breaker
      circuitBreaker.onSuccess();

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let finishReason: string | undefined;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'content_block_delta') {
                  const text = parsed.delta?.text || '';
                  if (text) {
                    yield { content: text, done: false };
                  }
                } else if (parsed.type === 'message_stop') {
                  finishReason = parsed.stop_reason;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        yield { content: '', done: true, finishReason };
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      // Check if retryable
      const statusCode = error.statusCode;
      if (isRetryableError(error, statusCode)) {
        circuitBreaker.onFailure();
      }

      // Handle timeout
      if (error.name === 'AbortError' || controller.signal.aborted) {
        throw new Error('Request timeout - The AI response took too long. Please try again.');
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
