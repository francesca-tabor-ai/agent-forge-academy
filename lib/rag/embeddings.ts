/**
 * Embedding provider interface
 * Supports multiple embedding providers (OpenAI, etc.)
 */

export interface EmbeddingProvider {
  /**
   * Generate embedding for a single text
   */
  embed(text: string): Promise<number[]>;

  /**
   * Generate embeddings for multiple texts (batch)
   */
  embedBatch(texts: string[]): Promise<number[][]>;
}

/**
 * OpenAI Embedding Provider
 */
class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI embedding error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    // OpenAI supports batch embedding
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI embedding error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }
}

/**
 * Get the configured embedding provider
 */
export function getEmbeddingProvider(): EmbeddingProvider {
  const provider = process.env.EMBEDDING_PROVIDER || 'openai';
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('LLM_API_KEY or OPENAI_API_KEY environment variable is required for embeddings');
  }

  switch (provider.toLowerCase()) {
    case 'openai':
      return new OpenAIEmbeddingProvider(apiKey);
    default:
      throw new Error(`Unsupported embedding provider: ${provider}`);
  }
}
