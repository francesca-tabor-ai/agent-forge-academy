---
title: "Module 7: AI-Native Features (Vector & RAG)"
description: "Implement semantic search, RAG pipelines, and AI-driven dashboards"
module: "7"
order: 7
email_takeaway: "RAG (Retrieval-Augmented Generation) combines vector search with LLMs, enabling AI that answers questions from your own data."
email_action: "Create a vector embedding for one document—use OpenAI's embedding API to convert text into a vector."
---

# Module 7: AI-Native Features (Vector & RAG)

**Duration:** Week 7  
**Learning Objectives:**
- **vector embeddings and semantic search Understanding**: Understand vector embeddings and semantic search
- **pgvector for similarity search Implementation**: Implement pgvector for similarity search
- **production RAG (Retrieval-Augmented Generation) Development**: Build production RAG (Retrieval-Augmented Generation) pipelines
- **AI-driven dashboards with generated columns Development**: Create AI-driven dashboards with generated columns
- **Optimize Vector**: Optimize vector queries for performance

---

## 7.1 Semantic Understanding

### What are Vector Embeddings?

**Vector Embeddings** are numerical representations of text (or other data) that capture semantic meaning:

- Similar concepts → Similar vectors
- Can measure "distance" between concepts
- Enable semantic search (not just keyword matching)

**Example:**
```
"dog" → [0.2, 0.5, 0.1, ...]
"puppy" → [0.21, 0.49, 0.12, ...]  (similar!)
"car" → [0.8, 0.1, 0.9, ...]  (different!)
```

### Why Vector Search?

**Traditional Keyword Search:**
-  "car" won't match "automobile"
-  "happy" won't match "joyful"
-  No understanding of meaning

**Vector/Semantic Search:**
-  "car" matches "automobile", "vehicle"
-  "happy" matches "joyful", "cheerful"
-  Understands meaning and context

### Setting Up pgvector

#### Step 1: Enable Extension

```sql
-- Migration: enable_pgvector.sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Step 2: Create Table with Vector Column

```sql
-- Migration: create_documents_table.sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI ada-002 dimension
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Vector Dimensions:**
- OpenAI `text-embedding-ada-002`: 1536
- OpenAI `text-embedding-3-small`: 1536
- OpenAI `text-embedding-3-large`: 3072
- Cohere: 1024
- Custom models: varies

### Generating Embeddings

#### Using OpenAI

```typescript
// lib/embeddings/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  })

  return response.data[0].embedding
}
```

#### Edge Function for Embeddings

```typescript
// supabase/functions/generate-embedding/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { text } = await req.json()

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  })

  const data = await response.json()
  return new Response(
    JSON.stringify({ embedding: data.data[0].embedding }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### Similarity Search

#### Cosine Similarity Query

```sql
-- Find similar documents
SELECT 
  id,
  title,
  content,
  1 - (embedding <=> $1::vector) AS similarity
FROM documents
WHERE 1 - (embedding <=> $1::vector) > 0.7
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

**Operators:**
- `<=>` - Cosine distance (1 - similarity)
- `<->` - L2 distance
- `<#>` - Negative inner product

#### Using in Application

```typescript
// lib/search/semantic.ts
import { supabase } from '@/lib/supabase/client'

export async function semanticSearch(query: string, limit = 10) {
  // Generate embedding for query
  const embedding = await generateEmbedding(query)

  // Search using Supabase RPC
  const { data, error } = await supabase.rpc('search_documents', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: limit
  })

  if (error) throw error
  return data
}
```

#### Database Function

```sql
-- Function for semantic search
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.title,
    documents.content,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 7.2 Production RAG Architecture

### What is RAG?

**Retrieval-Augmented Generation (RAG)** combines:
1. **Retrieval:** Find relevant documents
2. **Augmentation:** Add context to prompt
3. **Generation:** Generate answer with context

**Benefits:**
- Grounded in your data
- Reduces hallucinations
- Up-to-date information
- Source citations

### RAG Pipeline Components

```
1. Document Ingestion
   ↓
2. Chunking
   ↓
3. Embedding Generation
   ↓
4. Vector Storage
   ↓
5. Query Processing
   ↓
6. Context Retrieval
   ↓
7. Generation
```

### Step 1: Document Ingestion

```typescript
// lib/rag/ingest.ts
export async function ingestDocument(
  title: string,
  content: string,
  metadata?: Record<string, any>
) {
  // Generate embedding for full document
  const embedding = await generateEmbedding(`${title}\n\n${content}`)

  // Store in database
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title,
      content,
      embedding,
      metadata,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Step 2: Chunking

**Why Chunk?**
- Large documents don't fit in context window
- Need smaller, focused chunks
- Better retrieval accuracy

```typescript
// lib/rag/chunk.ts
export function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end)
    chunks.push(chunk)
    start = end - overlap // Overlap for context
  }

  return chunks
}
```

**Better Chunking (by sentences/paragraphs):**

```typescript
export function chunkByParagraphs(
  text: string,
  maxChunkSize = 1000
): string[] {
  const paragraphs = text.split(/\n\n+/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = paragraph
    } else {
      currentChunk += '\n\n' + paragraph
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())
  return chunks
}
```

### Step 3: Complete Ingestion Pipeline

```typescript
// lib/rag/pipeline.ts
export async function ingestDocumentWithChunks(
  title: string,
  content: string,
  metadata?: Record<string, any>
) {
  // Chunk the content
  const chunks = chunkByParagraphs(content)

  // Process each chunk
  const chunkPromises = chunks.map(async (chunk, index) => {
    const embedding = await generateEmbedding(chunk)

    return supabase
      .from('document_chunks')
      .insert({
        document_id: null, // Will update after document created
        chunk_index: index,
        content: chunk,
        embedding,
        metadata: {
          ...metadata,
          title,
          chunk_index: index,
        },
      })
      .select()
      .single()
  })

  const chunkResults = await Promise.all(chunkPromises)

  // Create document record
  const { data: document } = await supabase
    .from('documents')
    .insert({
      title,
      content,
      chunk_count: chunks.length,
      metadata,
    })
    .select()
    .single()

  // Update chunks with document_id
  await supabase
    .from('document_chunks')
    .update({ document_id: document.id })
    .in('id', chunkResults.map(c => c.data.id))

  return document
}
```

### Step 4: Query Processing

```typescript
// lib/rag/query.ts
export async function ragQuery(
  question: string,
  topK = 5
): Promise<{ answer: string; sources: DocumentChunk[] }> {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(question)

  // 2. Retrieve relevant chunks
  const { data: chunks } = await supabase.rpc('search_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: topK
  })

  // 3. Build context
  const context = chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join('\n\n')

  // 4. Generate answer with context
  const answer = await generateAnswer(question, context, chunks)

  return {
    answer,
    sources: chunks,
  }
}
```

### Step 5: Generation with Context

```typescript
// lib/rag/generate.ts
export async function generateAnswer(
  question: string,
  context: string,
  sources: DocumentChunk[]
): Promise<string> {
  const prompt = `You are a helpful assistant. Answer the question using only the provided context. If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:`

  const response = await fetch('/api/chat-completion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-4',
    }),
  })

  const data = await response.json()
  return data.choices[0].message.content
}
```

### Complete RAG Schema

```sql
-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  chunk_count INT DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks with embeddings
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for similarity search
CREATE INDEX ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Search function
CREATE OR REPLACE FUNCTION search_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_index int,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.chunk_index,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 7.3 Generated Columns

### What are Generated Columns?

**Generated Columns** are computed at write-time and stored in the database:
- Pre-computed values
- Always up-to-date
- Indexed for fast queries
- No application-level computation needed

### Use Cases

1. **Search Vectors:** Generate embeddings on insert
2. **Aggregations:** Pre-compute counts, sums
3. **Derived Data:** Compute from other columns
4. **Full-Text Search:** Generate searchable text

### Example: Auto-Generated Embeddings

```sql
-- Function to generate embedding
CREATE OR REPLACE FUNCTION generate_embedding(text_content TEXT)
RETURNS vector(1536)
LANGUAGE plpgsql
AS $$
DECLARE
  embedding_result vector(1536);
BEGIN
  -- Call Edge Function to generate embedding
  -- (In production, use a trigger with Edge Function)
  -- For now, return NULL (will be set by application)
  RETURN NULL;
END;
$$;

-- Generated column (stored, computed)
ALTER TABLE documents
ADD COLUMN embedding vector(1536) GENERATED ALWAYS AS (
  -- This would call the embedding function
  -- For now, we'll use a trigger instead
) STORED;
```

### Using Triggers for Generated Columns

**Better approach:** Use triggers to call Edge Function

```sql
-- Trigger function
CREATE OR REPLACE FUNCTION update_document_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function to generate embedding
  -- This is async, so we'll handle it in application
  -- Or use pg_net for HTTP calls from Postgres
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER document_embedding_trigger
  AFTER INSERT OR UPDATE OF content ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_embedding();
```

**Application-level approach (recommended):**

```typescript
// lib/documents/create.ts
export async function createDocument(title: string, content: string) {
  // Generate embedding
  const embedding = await generateEmbedding(content)

  // Insert with embedding
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title,
      content,
      embedding, // Pre-computed
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Example: Pre-Computed Aggregations

```sql
-- User stats table
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  task_count INT DEFAULT 0,
  completed_task_count INT DEFAULT 0,
  completion_rate FLOAT GENERATED ALWAYS AS (
    CASE 
      WHEN task_count > 0 
      THEN completed_task_count::FLOAT / task_count
      ELSE 0
    END
  ) STORED,
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update stats on task changes
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_stats
    SET task_count = task_count + 1
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'done' AND NEW.status = 'done' THEN
      UPDATE user_stats
      SET completed_task_count = completed_task_count + 1
      WHERE user_id = NEW.user_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_stats
    SET task_count = task_count - 1
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();
```

### AI-Driven Dashboards

Use generated columns for fast dashboard queries:

```sql
-- Dashboard view with pre-computed metrics
CREATE VIEW dashboard_metrics AS
SELECT
  user_id,
  task_count,
  completed_task_count,
  completion_rate,
  -- Pre-computed for fast queries
  tasks_this_week,
  tasks_overdue,
  avg_completion_time
FROM user_stats;
```

**Query dashboard:**
```typescript
// Fast query (no computation needed)
const { data } = await supabase
  .from('dashboard_metrics')
  .select('*')
  .eq('user_id', userId)
  .single()
```

---

## 7.4 Performance Optimization

### Vector Index Tuning

```sql
-- IVFFlat index parameters
CREATE INDEX ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);  -- Adjust based on data size

-- Guidelines:
-- lists = rows / 1000 (for datasets < 1M rows)
-- lists = sqrt(rows) (for larger datasets)
```

### Query Optimization

```sql
-- Use LIMIT early
SELECT * FROM (
  SELECT 
    id,
    content,
    1 - (embedding <=> $1) AS similarity
  FROM document_chunks
  ORDER BY embedding <=> $1
  LIMIT 100  -- Limit before filtering
) AS ranked
WHERE similarity > 0.7
LIMIT 10;
```

### Caching Embeddings

```typescript
// Cache generated embeddings
const embeddingCache = new Map<string, number[]>()

export async function getEmbedding(text: string): Promise<number[]> {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!
  }

  const embedding = await generateEmbedding(text)
  embeddingCache.set(text, embedding)
  return embedding
}
```

---

## 7.5 Key Takeaways

**Semantic Understanding:**
- Vector embeddings capture meaning
- pgvector enables similarity search
- Better than keyword matching
- Use cosine similarity for text

**Production RAG:**
- Document ingestion → Chunking → Embedding → Storage
- Query → Retrieve → Augment → Generate
- Ground answers in your data
- Provide source citations

**Generated Columns:**
- Pre-compute at write-time
- Fast queries (no computation)
- Always up-to-date
- Index for performance

**Performance:**
- Tune IVFFlat index parameters
- Limit queries early
- Cache embeddings
- Use generated columns for dashboards

---

## Lab 7: Build RAG System

**Objective:** Create a complete RAG system with document ingestion and query

**Requirements:**
1. Set up pgvector extension
2. Create documents and chunks tables
3. Implement document ingestion pipeline
4. Build RAG query function
5. Create UI for document upload and querying
6. Test with sample documents

**Deliverables:**
- Database schema with vector support
- Ingestion pipeline code
- RAG query implementation
- UI components
- Test documentation

**Evaluation Criteria:**
- Vector setup (20%)
- Ingestion pipeline (30%)
- RAG query (25%)
- UI/UX (15%)
- Documentation (10%)

**Time Estimate:** 6-7 hours

---

## Additional Resources

**Readings:**
- pgvector Documentation
- RAG Best Practices
- Vector Search Optimization
- OpenAI Embeddings Guide

**Videos:**
- "Introduction to Vector Search" (25 min)
- "Building RAG Systems" (30 min)
- "pgvector Performance Tuning" (20 min)

**Tools to Explore:**
- pgvector
- OpenAI Embeddings API
- Cohere Embeddings
- Vector Databases (Pinecone, Weaviate)

**Next Module Preview:**
Module 8 will teach you deployment and the iteration loop, including cloud synchronization and rapid iteration with AI-powered debugging.

---

**Module 7 Complete**   
**Next:** Module 8 - Deployment & the Iteration Loop
