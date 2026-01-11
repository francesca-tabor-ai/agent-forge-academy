# RAG (Retrieval Augmented Generation) System

This directory contains the RAG implementation for course content retrieval and augmentation.

## Overview

The RAG system enables the AI advisor to retrieve relevant course content from Markdown lessons and include it in the LLM context for more accurate, course-specific responses.

## Architecture

### Components

1. **`indexLessons.ts`** - Chunks lessons, generates embeddings, and stores in Supabase
2. **`retrieve.ts`** - Retrieves relevant chunks for a query
3. **`embeddings.ts`** - Embedding provider interface (OpenAI, etc.)

### Database Schema

The `lesson_chunks` table stores:
- Chunked lesson content
- Embeddings (vector) for semantic search
- Metadata (title, module, section headers)
- Full-text search index for keyword fallback

## Setup

### 1. Run Database Migrations

```bash
# Run migrations to create lesson_chunks table
supabase db push
```

### 2. Configure Embeddings (Optional)

If you want to use vector search, set:
```env
LLM_API_KEY=sk-...  # OpenAI API key for embeddings
EMBEDDING_PROVIDER=openai  # Default: openai
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # Default model
```

**Note:** If embeddings are not configured, the system will use keyword search (PostgreSQL full-text search) as a fallback.

### 3. Index Lessons

Index lessons using the API endpoint:

```bash
# Index all lessons
curl -X POST http://localhost:3000/api/rag/index \
  -H "Content-Type: application/json" \
  -d '{
    "action": "index_all",
    "options": {
      "generateEmbeddings": true,
      "minChunkSize": 200,
      "maxChunkSize": 1000,
      "overlap": 100
    }
  }'

# Index a specific course
curl -X POST http://localhost:3000/api/rag/index \
  -H "Content-Type: application/json" \
  -d '{
    "action": "index_course",
    "courseSlug": "ai-recommender-systems",
    "options": {
      "generateEmbeddings": true
    }
  }'

# Index a single lesson
curl -X POST http://localhost:3000/api/rag/index \
  -H "Content-Type: application/json" \
  -d '{
    "action": "index_lesson",
    "courseSlug": "ai-recommender-systems",
    "lessonSlug": "Module_01_Solving_the_Cold_Start_Challenge",
    "options": {
      "generateEmbeddings": true
    }
  }'
```

Or use the functions directly:

```typescript
import { indexAllLessons, indexCourse, indexLesson } from '@/lib/rag/indexLessons';

// Index all lessons
await indexAllLessons({ generateEmbeddings: true });

// Index a course
await indexCourse('ai-recommender-systems', { generateEmbeddings: true });

// Index a single lesson
const lesson = loadLessonBySlug('Module_01_...', undefined, 'ai-recommender-systems');
await indexLesson(lesson, { generateEmbeddings: true });
```

## How It Works

### Chunking Strategy

Lessons are chunked using:
- **Split by paragraphs** (double newlines)
- **Chunk size**: 200-1000 characters (configurable)
- **Overlap**: 100 characters between chunks (to preserve context)
- **Metadata**: Includes title, module, week, section headers

### Retrieval Strategy

The system uses a two-tier approach:

1. **Vector Search** (if embeddings available):
   - Uses pgvector cosine similarity
   - Requires `match_lesson_chunks` RPC function
   - Falls back to keyword search if unavailable

2. **Keyword Search** (fallback):
   - Uses PostgreSQL full-text search
   - Always available
   - Less accurate but works without embeddings

### Integration with AI Advisor

RAG is automatically integrated into the AI advisor chat:

- **Triggers**: When course context exists OR query contains course-related keywords
- **Retrieval**: Top 5 most relevant chunks (configurable)
- **Context**: Chunks are formatted and added to system prompt
- **Transparent**: Works seamlessly with existing chat flow

## Usage Examples

### Manual Retrieval

```typescript
import { retrieveChunks, formatChunksForContext } from '@/lib/rag/retrieve';

// Retrieve chunks for a query
const chunks = await retrieveChunks('What is collaborative filtering?', {
  limit: 5,
  courseSlug: 'ai-recommender-systems',
  minScore: 0.7,
});

// Format for LLM context
const context = formatChunksForContext(chunks);
```

### Custom Integration

```typescript
// In your LLM prompt building
const chunks = await retrieveChunks(userQuery, {
  courseSlug: activeCourse?.slug,
  limit: 5,
});

if (chunks.length > 0) {
  const ragContext = formatChunksForContext(chunks);
  systemPrompt += `\n\nRelevant Course Content:\n${ragContext}`;
}
```

## Configuration Options

### Chunking Options

- `minChunkSize`: Minimum chunk size in characters (default: 200)
- `maxChunkSize`: Maximum chunk size in characters (default: 1000)
- `overlap`: Overlap between chunks in characters (default: 100)
- `generateEmbeddings`: Whether to generate embeddings (default: true)

### Retrieval Options

- `limit`: Number of chunks to retrieve (default: 5)
- `courseSlug`: Filter by course slug
- `minScore`: Minimum similarity/relevance score (default: 0.7 for vector, N/A for keyword)
- `useVectorSearch`: Force vector search (default: auto-detect)

## Performance Considerations

### Indexing

- **Batch size**: Chunks are inserted in batches of 100
- **Embeddings**: Batch embedding generation (OpenAI supports up to 2048 inputs)
- **Time**: ~1-2 seconds per lesson (depending on size and embedding generation)

### Retrieval

- **Vector search**: ~50-100ms (with pgvector index)
- **Keyword search**: ~20-50ms (with full-text index)
- **Embedding generation**: ~200-500ms per query (if using vector search)

## Troubleshooting

### Vector Search Not Working

1. Check if pgvector extension is installed:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

2. Check if embeddings exist:
   ```sql
   SELECT COUNT(*) FROM lesson_chunks WHERE embedding IS NOT NULL;
   ```

3. Check if RPC function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'match_lesson_chunks';
   ```

### Keyword Search Not Working

1. Check if full-text index exists:
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'lesson_chunks';
   ```

2. Test full-text search:
   ```sql
   SELECT * FROM lesson_chunks 
   WHERE to_tsvector('english', content) @@ to_tsquery('english', 'collaborative');
   ```

### Embeddings Not Generated

1. Check API key: `LLM_API_KEY` or `OPENAI_API_KEY` must be set
2. Check provider: `EMBEDDING_PROVIDER` should be `openai`
3. Check API limits: Ensure you haven't exceeded rate limits

## Future Enhancements

- [ ] Support for multiple embedding providers (Anthropic, Cohere, etc.)
- [ ] Hybrid search (combine vector + keyword)
- [ ] Re-ranking with cross-encoder models
- [ ] Automatic re-indexing on lesson updates
- [ ] Chunk metadata enrichment (extract code blocks, formulas, etc.)
