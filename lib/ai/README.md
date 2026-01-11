# LLM Integration

This directory contains the provider-agnostic LLM interface for the AI advisor feature.

## Configuration

Set the following environment variables in your `.env.local`:

### Required
- `LLM_API_KEY` - Your LLM provider API key

### Optional
- `LLM_PROVIDER` - Provider to use (`openai` or `anthropic`). Defaults to `openai`
- `OPENAI_MODEL` - OpenAI model to use (default: `gpt-4-turbo-preview`)
- `OPENAI_BASE_URL` - OpenAI API base URL (default: `https://api.openai.com/v1`)
- `ANTHROPIC_MODEL` - Anthropic model to use (default: `claude-3-opus-20240229`)
- `ANTHROPIC_BASE_URL` - Anthropic API base URL (default: `https://api.anthropic.com/v1`)

## Example Configuration

### OpenAI
```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
```

### Anthropic
```env
LLM_PROVIDER=anthropic
LLM_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229
```

## Usage

The LLM provider is automatically selected based on `LLM_PROVIDER`. The interface supports:

- **Non-streaming**: `generate(messages, options)` - Returns complete response
- **Streaming**: `generateStream(messages, options)` - Yields chunks as they arrive

## Streaming

Streaming is enabled by default in the frontend. To disable, set:
```javascript
localStorage.setItem('aiAdvisorStreaming', 'false');
```

The API route supports streaming via Server-Sent Events (SSE). Add `?stream=true` to the request URL or set `Accept: text/event-stream` header.

## Adding New Providers

To add a new LLM provider:

1. Create a new class implementing the `LLMProvider` interface
2. Add it to the `getLLMProvider()` function switch statement
3. Add required environment variables

Example:
```typescript
class NewProvider implements LLMProvider {
  async generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    // Implementation
  }
  
  async *generateStream(messages: LLMMessage[], options?: LLMOptions): AsyncGenerator<LLMStreamChunk> {
    // Implementation
  }
}
```
