/**
 * Provider-agnostic LLM interface
 * Supports multiple providers (OpenAI, Anthropic) behind a common API
 */

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
}

/**
 * Get the configured LLM provider
 * Reads from environment variables to determine which provider to use
 */
export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'openai';
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error('LLM_API_KEY environment variable is required');
  }

  switch (provider.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
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
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
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
  }

  async *generateStream(
    messages: LLMMessage[],
    options?: LLMOptions
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    const model = options?.model || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || 2000;

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
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

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
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
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
  }

  async *generateStream(
    messages: LLMMessage[],
    options?: LLMOptions
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    const model = options?.model || process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
    const maxTokens = options?.maxTokens || 2000;

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
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
    }

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
  }
}
