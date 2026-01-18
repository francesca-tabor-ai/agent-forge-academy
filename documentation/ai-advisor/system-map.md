# AI Advisor System Map

**Date:** 2025-01-27  
**Purpose:** Architecture overview and request path diagram for AI Advisor system

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  AIAdvisor   │  │  ChatPanel   │  │ ContextBar   │          │
│  │   (Main)     │  │  (Display)   │  │  (Selector)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
│                    handleSendMessage()                            │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ HTTP POST /api/ai-advisor/chat
                             │ (with context, message, history)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js API Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/ai-advisor/chat                               │  │
│  │  - Auth check (Supabase)                                 │  │
│  │  - LLM config validation                                 │  │
│  │  - Input validation                                      │  │
│  │  - Context loading                                       │  │
│  │  - Intent classification                                  │  │
│  │  - RAG retrieval (if needed)                            │  │
│  │  - LLM generation (streaming/non-streaming)              │  │
│  │  - Response formatting                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                        │
                ▼                        ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│      RAG Pipeline        │  │    LLM Provider Layer   │
│                          │  │                          │
│  ┌────────────────────┐  │  │  ┌────────────────────┐ │
│  │ retrieveChunks()   │  │  │  │ OpenAIProvider     │ │
│  │ - Embedding gen    │  │  │  │ - generate()       │ │
│  │ - Vector search    │  │  │  │ - generateStream() │ │
│  │ - Keyword fallback │  │  │  │ - Timeout/Retry    │ │
│  └────────────────────┘  │  │  │ - Circuit breaker  │ │
│                          │  │  └────────────────────┘ │
│  ┌────────────────────┐  │  │  ┌────────────────────┐ │
│  │ formatChunksFor    │  │  │  │ AnthropicProvider │ │
│  │ Context()          │  │  │  │ - generate()       │ │
│  │ - Citations        │  │  │  │ - generateStream() │ │
│  │ - Formatting       │  │  │  │ - Timeout/Retry    │ │
│  └────────────────────┘  │  │  │ - Circuit breaker  │ │
│                          │  │  └────────────────────┘ │
└──────────────────────────┘  └──────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Supabase Database      │  │   External APIs           │
│                          │  │                          │
│  - lesson_chunks         │  │  - OpenAI API             │
│  - profiles              │  │  - Anthropic API          │
│  - conversations         │  │  - Embedding API          │
│  - request_logs          │  │                          │
└──────────────────────────┘  └──────────────────────────┘
```

---

## 2. Request Path Flow

### 2.1 Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER INPUT                                                    │
│    User types message in AIAdvisor component                     │
│    Location: components/ai-advisor/AIAdvisor.tsx:209            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND REQUEST PREPARATION                                  │
│    - handleSendMessage() called                                 │
│    - Creates user message object                                │
│    - Sets loading state (prevents double-send)                 │
│    - Prepares payload:                                          │
│      { message, context, studentProfileId,                     │
│        conversationHistory, intent, conversationId }             │
│    - Creates AbortController for timeout (45s)                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. HTTP REQUEST                                                  │
│    POST /api/ai-advisor/chat?stream=true                         │
│    Headers:                                                     │
│      - Content-Type: application/json                           │
│      - Accept: text/event-stream                                │
│    Body: JSON payload                                           │
│    Signal: AbortController.signal                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. API ROUTE HANDLER                                             │
│    Location: app/api/ai-advisor/chat/route.ts:704              │
│                                                                 │
│    a. Generate Request ID (req_<timestamp>_<random>)           │
│    b. Log request received                                      │
│    c. Auth check (Supabase auth.getUser())                     │
│       - If unauthorized → 401 with Request ID                  │
│    d. LLM config validation                                     │
│       - Check LLM_API_KEY                                       │
│       - If missing → 503 SERVICE_UNAVAILABLE                   │
│    e. Parse request body                                        │
│       - Validate message (required, non-empty)                  │
│       - If invalid → 400 ValidationError                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. CONTEXT RESOLUTION                                            │
│    Location: loadActiveContext()                                │
│                                                                 │
│    - Load active course/project/job from DB                    │
│    - Merge with request context                                │
│    - Load course/project/job data                              │
│    - Load user profile                                         │
│    - Log context resolved                                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. INTENT CLASSIFICATION                                        │
│    Location: classifyIntent()                                  │
│                                                                 │
│    - Rule-based classification first                           │
│    - LLM-based fallback if needed                              │
│    - Returns: { intent, confidence, reasoning }                │
│    - Log intent classified                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. RAG RETRIEVAL (if intent requires course content)            │
│    Location: retrieveChunks()                                  │
│                                                                 │
│    a. Generate query embedding                                 │
│       - Uses OpenAI text-embedding-3-small                     │
│    b. Vector search (pgvector)                                 │
│       - match_lesson_chunks() RPC function                     │
│       - Filters by course slug (if active course)              │
│       - Returns top K chunks with scores                       │
│    c. Keyword search fallback (if vector fails)                │
│       - PostgreSQL full-text search                            │
│    d. Format chunks for context                                │
│       - Add citations, titles, course info                      │
│    e. Log retrieval results                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. PROMPT ASSEMBLY                                              │
│    Location: buildLLMMessages()                                │
│                                                                 │
│    - Build system prompt with:                                 │
│      * User profile context                                     │
│      * Active course/project/job context                       │
│      * RAG chunks (if retrieved)                               │
│      * Grounding instructions                                  │
│    - Add conversation history                                  │
│    - Add user message                                          │
│    - Log prompt assembled                                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. LLM PROVIDER CALL                                            │
│    Location: lib/ai/llm.ts                                     │
│                                                                 │
│    a. Check circuit breaker                                     │
│       - If OPEN → Reject immediately                          │
│    b. Create timeout (30s non-streaming, 60s streaming)       │
│    c. Retry wrapper (withRetry)                                 │
│       - Exponential backoff                                    │
│       - Max 3 retries (2 for streaming)                        │
│    d. Provider API call                                         │
│       - OpenAI: POST /chat/completions                         │
│       - Anthropic: POST /messages                              │
│    e. Handle response/stream                                    │
│    f. Update circuit breaker state                              │
│    g. Log provider call                                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. RESPONSE STREAMING (if stream=true)                        │
│     Location: ReadableStream with SSE                           │
│                                                                 │
│     - Stream chunks via Server-Sent Events                     │
│     - Format: data: { content: "...", done: false }            │
│     - Final chunk: { done: true, ... }                          │
│     - Timeout: 60s (STREAM_TIMEOUT_MS)                         │
│     - Error handling with error taxonomy                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. RESPONSE FORMATTING                                         │
│     - Add citations (if RAG chunks retrieved)                  │
│     - Generate next actions                                    │
│     - Format response with metadata                            │
│     - Log response returned                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 12. CLIENT-SIDE PROCESSING                                       │
│     Location: components/ai-advisor/AIAdvisor.tsx              │
│                                                                 │
│     - Receive SSE chunks                                        │
│     - Update UI in real-time                                    │
│     - Handle errors with user-friendly messages                │
│     - Display Request ID for support                            │
│     - Optionally speak response (if voice enabled)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Details

### 3.1 Frontend Components

| Component | File | Purpose | Key Functions |
|-----------|------|---------|---------------|
| **AIAdvisor** | `components/ai-advisor/AIAdvisor.tsx` | Main chat interface | `handleSendMessage()`, message state, context management |
| **ChatPanel** | `components/ai-advisor/ChatPanel.tsx` | Message display | Renders messages, error banners, citations |
| **ContextBar** | `components/ai-advisor/ContextBar.tsx` | Context selector | Shows active course/project/job, allows switching |
| **VoiceControls** | `components/ai-advisor/VoiceControls.tsx` | Voice input | Speech-to-text, text-to-speech controls |

### 3.2 API Routes

| Route | File | Method | Purpose |
|-------|------|--------|---------|
| `/api/ai-advisor/chat` | `app/api/ai-advisor/chat/route.ts` | POST | Main chat endpoint (streaming/non-streaming) |
| `/api/ai-advisor/health` | `app/api/ai-advisor/health/route.ts` | GET | Health check for LLM provider |
| `/api/ai-advisor/voice` | `app/api/ai-advisor/voice/route.ts` | POST | Voice transcription + chat |

### 3.3 RAG Pipeline

| Component | File | Purpose | Key Functions |
|-----------|------|---------|---------------|
| **retrieveChunks** | `lib/rag/retrieve.ts` | Content retrieval | Vector search, keyword fallback, diagnostics |
| **formatChunksForContext** | `lib/rag/retrieve.ts` | Context formatting | Formats chunks with citations |
| **getEmbeddingProvider** | `lib/rag/embeddings.ts` | Embedding generation | OpenAI embeddings (text-embedding-3-small) |
| **indexLessons** | `lib/rag/indexLessons.ts` | Content indexing | Chunks lessons, generates embeddings, stores in DB |

### 3.4 LLM Provider Layer

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| **getLLMProvider** | `lib/ai/llm.ts` | Provider factory | Returns OpenAI or Anthropic provider |
| **getLLMProviderWithFallback** | `lib/ai/llm.ts` | Fallback support | Tries primary, falls back to secondary |
| **OpenAIProvider** | `lib/ai/llm.ts` | OpenAI client | Streaming/non-streaming, timeout, retry, circuit breaker |
| **AnthropicProvider** | `lib/ai/llm.ts` | Anthropic client | Streaming/non-streaming, timeout, retry, circuit breaker |
| **CircuitBreaker** | `lib/ai/circuit-breaker.ts` | Circuit breaker | Prevents cascading failures |
| **withRetry** | `lib/ai/retry.ts` | Retry logic | Exponential backoff with jitter |

### 3.5 Supporting Systems

| Component | File | Purpose |
|-----------|------|---------|
| **classifyIntent** | `lib/ai/intent.ts` | Intent classification (rule-based → LLM fallback) |
| **getToolsForIntent** | `lib/ai/intent.ts` | Tool selection based on intent |
| **generateNextActions** | `lib/ai/nextActions.ts` | Generate structured next actions |
| **safeLogger** | `lib/utils/redactPII.ts` | Structured logging with PII redaction |
| **logRequest** | `lib/utils/request-logger.ts` | Request logging to database |
| **createErrorResponse** | `lib/ai-advisor/error-taxonomy.ts` | Centralized error mapping |

---

## 4. Data Flow

### 4.1 Request Data

```
User Input
  ↓
Frontend Payload:
  {
    message: string,
    context: { course?, project?, job? },
    studentProfileId: string | null,
    conversationHistory: Message[],
    intent?: string,
    conversationId?: string
  }
  ↓
API Processing:
  - Context resolution
  - Intent classification
  - RAG retrieval (if needed)
  - Prompt assembly
  ↓
LLM Provider:
  {
    messages: LLMMessage[],
    options: { temperature, maxTokens, timeout, signal }
  }
```

### 4.2 Response Data

```
LLM Provider Response
  ↓
API Processing:
  - Add citations (if RAG chunks)
  - Generate next actions
  - Format metadata
  ↓
Frontend Response:
  {
    ok: true,
    response: string,
    conversationId: string,
    nextActions?: NextAction[],
    requestId: string,
    debug?: { retrieval: RetrievalDiagnostics }
  }
  ↓
UI Update:
  - Display response
  - Show citations
  - Show next actions
  - Optionally speak response
```

---

## 5. Error Flow

### 5.1 Error Handling Path

```
Error Occurs
  ↓
Error Taxonomy (lib/ai-advisor/error-taxonomy.ts)
  - Map error to ErrorClass
  - Determine status code
  - Generate user-safe message
  ↓
Error Response:
  {
    ok: false,
    error: {
      code: ErrorClass,
      message: string,
      requestId: string
    }
  }
  ↓
Structured Logging:
  {
    requestId: string,
    errorClass: ErrorClass,
    statusCode: number,
    upstreamStatus?: number,
    errorMessage: string,
    stage: string
  }
  ↓
Client-Side Error Display:
  - User-friendly message
  - Request ID for support
  - Retry option (if applicable)
```

---

## 6. Key Integration Points

### 6.1 Supabase Integration

- **Auth:** `createUserSupabaseClient()` → `auth.getUser()`
- **Database:** `lesson_chunks`, `profiles`, `conversations`, `request_logs`
- **Vector Search:** `match_lesson_chunks()` RPC function (pgvector)

### 6.2 External APIs

- **OpenAI API:** `/chat/completions` (streaming/non-streaming)
- **Anthropic API:** `/messages` (streaming/non-streaming)
- **OpenAI Embeddings:** `/embeddings` (text-embedding-3-small)

### 6.3 Environment Variables

- `LLM_PROVIDER` - Primary provider (openai/anthropic)
- `LLM_API_KEY` - API key for provider
- `LLM_FALLBACK_PROVIDER` - Fallback provider (optional)
- `OPENAI_MODEL` - OpenAI model name
- `ANTHROPIC_MODEL` - Anthropic model name
- `OPENAI_BASE_URL` - OpenAI base URL (optional)
- `ANTHROPIC_BASE_URL` - Anthropic base URL (optional)

---

**End of System Map**
