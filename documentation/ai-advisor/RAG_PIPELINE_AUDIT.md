# RAG Pipeline Audit - Course Content Ingestion and Indexing

**Date:** 2025-01-27  
**Purpose:** Verify course content ingestion and indexing for RAG, specifically "Mastering Agentic RAG for Enterprise AI" course

---

## 1. How Course Content is Stored and Indexed

### 1.1 Indexing Method

**Type:** On-demand via API endpoint (no automatic ETL or background worker)

**Location:** `app/api/rag/index/route.ts`

**Trigger:** Manual API call or scheduled cron job (not currently automated)

**Actions:**
- `index_all` - Index all lessons across all courses
- `index_course` - Index all lessons in a specific course
- `index_lesson` - Index a single lesson

**Authentication:** Requires authenticated user (should be admin in production)

---

### 1.2 Indexing Process

**Flow:**
1. **Load Lesson** - Read markdown file from `course/{courseSlug}/` directory
2. **Chunk Lesson** - Split into chunks (default: 200-1000 chars, 100 char overlap)
3. **Generate Embeddings** - Create vector embeddings (if enabled)
4. **Delete Existing** - Remove old chunks for lesson (upsert behavior)
5. **Store Chunks** - Insert into `lesson_chunks` table in batches of 100

**Code:** `lib/rag/indexLessons.ts`

---

### 1.3 Database Schema

**Table:** `lesson_chunks`

**Schema:**
```sql
CREATE TABLE lesson_chunks (
  id UUID PRIMARY KEY,
  course_slug VARCHAR(255) NOT NULL,  -- Namespace/collection identifier
  lesson_slug VARCHAR(255) NOT NULL,
  chunk_index INTEGER NOT NULL,        -- Order within lesson (0-indexed)
  content TEXT NOT NULL,               -- Chunk text content
  content_length INTEGER NOT NULL,    -- Character length
  embedding vector(1536),              -- OpenAI embedding (1536 dimensions)
  metadata JSONB DEFAULT '{}',        -- Title, module, section headers
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE(course_slug, lesson_slug, chunk_index)
);
```

**Namespace/Collection:** `course_slug` serves as the namespace/collection identifier

**Indexes:**
- `idx_lesson_chunks_course_slug` - Course filtering
- `idx_lesson_chunks_lesson_slug` - Lesson filtering
- `idx_lesson_chunks_course_lesson` - Composite index
- `idx_lesson_chunks_metadata` - GIN index for JSONB metadata
- `idx_lesson_chunks_content_search` - Full-text search (keyword fallback)
- `idx_lesson_chunks_embedding` - Vector similarity search (pgvector)

---

### 1.4 Chunking Parameters

**Default Values:**
- `minChunkSize`: 200 characters
- `maxChunkSize`: 1000 characters
- `overlap`: 100 characters

**Chunking Strategy:**
1. Split by double newlines (paragraphs)
2. Combine paragraphs until `maxChunkSize` reached
3. Add overlap (last 100 chars) to next chunk
4. Skip chunks smaller than `minChunkSize`

**Code:** `lib/rag/indexLessons.ts:chunkLesson()`

---

### 1.5 Embedding Model

**Provider:** OpenAI (default)

**Model:** `text-embedding-3-small` (default)

**Dimensions:** 1536

**Configuration:**
- `EMBEDDING_PROVIDER` env var (default: `openai`)
- `OPENAI_EMBEDDING_MODEL` env var (default: `text-embedding-3-small`)
- `LLM_API_KEY` or `OPENAI_API_KEY` required

**Code:** `lib/rag/embeddings.ts`

**Note:** Embeddings are optional - if generation fails, chunks are stored without embeddings (keyword search fallback)

---

## 2. Verification Queries

### 2.1 Check if "agentic-rag" Course is Indexed

**Query:**
```sql
-- Check if course is indexed
SELECT 
  course_slug,
  COUNT(DISTINCT lesson_slug) as lesson_count,
  COUNT(*) as total_chunks,
  COUNT(embedding) as chunks_with_embeddings,
  COUNT(*) - COUNT(embedding) as chunks_without_embeddings,
  MIN(created_at) as first_indexed,
  MAX(updated_at) as last_updated,
  AVG(content_length) as avg_chunk_size,
  MIN(content_length) as min_chunk_size,
  MAX(content_length) as max_chunk_size
FROM lesson_chunks
WHERE course_slug = 'agentic-rag'
GROUP BY course_slug;
```

**Expected Result:**
- `course_slug`: `agentic-rag`
- `lesson_count`: 7 (Module_01 through Module_07)
- `total_chunks`: > 0
- `chunks_with_embeddings`: Should match `total_chunks` if embeddings enabled
- `last_updated`: Recent timestamp (within last few days/weeks)

---

### 2.2 Check Chunk Count per Lesson

**Query:**
```sql
-- Check chunk count per lesson
SELECT 
  lesson_slug,
  COUNT(*) as chunk_count,
  COUNT(embedding) as chunks_with_embeddings,
  AVG(content_length) as avg_chunk_size,
  MIN(content_length) as min_chunk_size,
  MAX(content_length) as max_chunk_size,
  MAX(updated_at) as last_updated
FROM lesson_chunks
WHERE course_slug = 'agentic-rag'
GROUP BY lesson_slug
ORDER BY lesson_slug;
```

**Expected Result:**
- Each lesson should have multiple chunks (> 1)
- Chunk sizes should be between 200-1000 characters (default)
- All chunks should have embeddings (if embeddings enabled)

---

### 2.3 Check Embedding Model Consistency

**Query:**
```sql
-- Check embedding dimensions (should be 1536 for text-embedding-3-small)
SELECT 
  course_slug,
  COUNT(*) as total_chunks,
  COUNT(embedding) as chunks_with_embeddings,
  -- Check embedding dimensions (if pgvector available)
  CASE 
    WHEN COUNT(embedding) > 0 THEN 
      (SELECT array_length(embedding, 1) 
       FROM lesson_chunks 
       WHERE course_slug = 'agentic-rag' 
       AND embedding IS NOT NULL 
       LIMIT 1)
    ELSE NULL
  END as embedding_dimensions
FROM lesson_chunks
WHERE course_slug = 'agentic-rag'
GROUP BY course_slug;
```

**Expected Result:**
- `embedding_dimensions`: 1536 (for `text-embedding-3-small`)

**Note:** If using different embedding model, dimensions will differ:
- `text-embedding-ada-002`: 1536
- `text-embedding-3-small`: 1536
- `text-embedding-3-large`: 3072

---

### 2.4 Check Last Updated Timestamp

**Query:**
```sql
-- Check when course was last indexed
SELECT 
  course_slug,
  MAX(updated_at) as last_updated,
  MAX(created_at) as last_created,
  COUNT(*) as total_chunks,
  -- Check if any chunks are stale (older than 7 days)
  COUNT(CASE WHEN updated_at < NOW() - INTERVAL '7 days' THEN 1 END) as stale_chunks
FROM lesson_chunks
WHERE course_slug = 'agentic-rag'
GROUP BY course_slug;
```

**Expected Result:**
- `last_updated`: Recent timestamp
- `stale_chunks`: 0 (if course was recently updated)

---

### 2.5 Check Namespace/Collection (course_slug)

**Query:**
```sql
-- Verify namespace/collection is correct
SELECT DISTINCT course_slug
FROM lesson_chunks
WHERE course_slug LIKE '%rag%' OR course_slug LIKE '%agentic%'
ORDER BY course_slug;
```

**Expected Result:**
- `agentic-rag` should appear in results

**Common Issues:**
- ❌ Wrong namespace (e.g., `agentic_rag` instead of `agentic-rag`)
- ❌ Missing namespace (NULL or empty)
- ❌ Multiple namespaces for same course

---

### 2.6 Check Chunking Quality

**Query:**
```sql
-- Check chunk size distribution
SELECT 
  CASE 
    WHEN content_length < 200 THEN 'too_small'
    WHEN content_length > 1000 THEN 'too_large'
    ELSE 'optimal'
  END as chunk_size_category,
  COUNT(*) as count,
  AVG(content_length) as avg_size,
  MIN(content_length) as min_size,
  MAX(content_length) as max_size
FROM lesson_chunks
WHERE course_slug = 'agentic-rag'
GROUP BY chunk_size_category
ORDER BY chunk_size_category;
```

**Expected Result:**
- Most chunks should be in `optimal` range (200-1000 chars)
- Few or no chunks in `too_small` or `too_large`

**Common Issues:**
- ⚠️ Many chunks `too_small` (< 200) - may indicate aggressive splitting
- ⚠️ Many chunks `too_large` (> 1000) - may indicate insufficient splitting

---

### 2.7 Check Vector Search Function

**Query:**
```sql
-- Check if vector search function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'match_lesson_chunks';

-- Test vector search (if embeddings exist)
SELECT * FROM match_lesson_chunks(
  (SELECT embedding FROM lesson_chunks 
   WHERE course_slug = 'agentic-rag' 
   AND embedding IS NOT NULL 
   LIMIT 1),
  0.7,
  5,
  'agentic-rag'
) LIMIT 5;
```

**Expected Result:**
- Function exists and returns results
- Results are from `agentic-rag` course

---

## 3. Common Issues Detection

### 3.1 Course Not Indexed in Production

**Symptoms:**
- Query returns 0 chunks for `agentic-rag`
- No rows in `lesson_chunks` for course

**Detection:**
```sql
SELECT COUNT(*) as chunk_count
FROM lesson_chunks
WHERE course_slug = 'agentic-rag';
```

**Fix:**
```bash
# Index the course
curl -X POST https://your-app.vercel.app/api/rag/index \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "index_course",
    "courseSlug": "agentic-rag",
    "options": {
      "generateEmbeddings": true,
      "minChunkSize": 200,
      "maxChunkSize": 1000,
      "overlap": 100
    }
  }'
```

---

### 3.2 Chunking Too Large/Small

**Symptoms:**
- Many chunks < 200 characters (too small)
- Many chunks > 1000 characters (too large)
- Poor retrieval quality

**Detection:**
```sql
-- Check chunk size distribution
SELECT 
  CASE 
    WHEN content_length < 200 THEN 'too_small'
    WHEN content_length > 1000 THEN 'too_large'
    ELSE 'optimal'
  END as category,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM lesson_chunks
WHERE course_slug = 'agentic-rag'
GROUP BY category;
```

**Fix:**
- Adjust `minChunkSize` and `maxChunkSize` in indexing options
- Re-index course with new parameters

---

### 3.3 Wrong Namespace per Course

**Symptoms:**
- Chunks stored with wrong `course_slug`
- Retrieval returns chunks from wrong course
- Multiple namespaces for same course

**Detection:**
```sql
-- Check for namespace inconsistencies
SELECT 
  course_slug,
  COUNT(*) as chunk_count,
  COUNT(DISTINCT lesson_slug) as lesson_count
FROM lesson_chunks
WHERE lesson_slug LIKE '%Module_%'
GROUP BY course_slug
ORDER BY course_slug;
```

**Fix:**
- Verify `courseSlug` is set correctly in lesson metadata
- Re-index course with correct namespace

---

### 3.4 Embedding Model Mismatch

**Symptoms:**
- Query embeddings use different model than index
- Poor retrieval quality
- Dimension mismatch errors

**Detection:**
```sql
-- Check embedding dimensions
SELECT 
  array_length(embedding, 1) as dimensions,
  COUNT(*) as count
FROM lesson_chunks
WHERE course_slug = 'agentic-rag'
AND embedding IS NOT NULL
GROUP BY dimensions;
```

**Expected:**
- All embeddings should have same dimensions (1536 for `text-embedding-3-small`)

**Fix:**
- Ensure `OPENAI_EMBEDDING_MODEL` matches between indexing and querying
- Re-index course if model changed

---

### 3.5 Stale Index After Course Updates

**Symptoms:**
- `updated_at` timestamp is old
- Content changes not reflected in RAG
- Retrieval returns outdated information

**Detection:**
```sql
-- Check for stale chunks
SELECT 
  course_slug,
  lesson_slug,
  MAX(updated_at) as last_updated,
  NOW() - MAX(updated_at) as age
FROM lesson_chunks
WHERE course_slug = 'agentic-rag'
GROUP BY course_slug, lesson_slug
HAVING NOW() - MAX(updated_at) > INTERVAL '7 days'
ORDER BY age DESC;
```

**Fix:**
- Re-index course after content updates
- Set up automated re-indexing on content changes

---

## 4. Indexing Status Check Script

### 4.1 Complete Status Query

```sql
-- Complete indexing status for agentic-rag course
WITH course_stats AS (
  SELECT 
    course_slug,
    COUNT(DISTINCT lesson_slug) as lesson_count,
    COUNT(*) as total_chunks,
    COUNT(embedding) as chunks_with_embeddings,
    COUNT(*) - COUNT(embedding) as chunks_without_embeddings,
    MIN(created_at) as first_indexed,
    MAX(updated_at) as last_updated,
    AVG(content_length) as avg_chunk_size,
    MIN(content_length) as min_chunk_size,
    MAX(content_length) as max_chunk_size,
    COUNT(CASE WHEN content_length < 200 THEN 1 END) as chunks_too_small,
    COUNT(CASE WHEN content_length > 1000 THEN 1 END) as chunks_too_large,
    CASE 
      WHEN COUNT(embedding) > 0 THEN 
        (SELECT array_length(embedding, 1) 
         FROM lesson_chunks 
         WHERE course_slug = 'agentic-rag' 
         AND embedding IS NOT NULL 
         LIMIT 1)
      ELSE NULL
    END as embedding_dimensions
  FROM lesson_chunks
  WHERE course_slug = 'agentic-rag'
  GROUP BY course_slug
),
lesson_details AS (
  SELECT 
    lesson_slug,
    COUNT(*) as chunk_count,
    COUNT(embedding) as chunks_with_embeddings,
    MAX(updated_at) as last_updated
  FROM lesson_chunks
  WHERE course_slug = 'agentic-rag'
  GROUP BY lesson_slug
)
SELECT 
  cs.*,
  json_agg(
    json_build_object(
      'lesson_slug', ld.lesson_slug,
      'chunk_count', ld.chunk_count,
      'chunks_with_embeddings', ld.chunks_with_embeddings,
      'last_updated', ld.last_updated
    )
    ORDER BY ld.lesson_slug
  ) as lessons
FROM course_stats cs
LEFT JOIN lesson_details ld ON true
GROUP BY cs.course_slug, cs.lesson_count, cs.total_chunks, 
         cs.chunks_with_embeddings, cs.chunks_without_embeddings,
         cs.first_indexed, cs.last_updated, cs.avg_chunk_size,
         cs.min_chunk_size, cs.max_chunk_size, cs.chunks_too_small,
         cs.chunks_too_large, cs.embedding_dimensions;
```

---

### 4.2 Quick Health Check

```sql
-- Quick health check
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ NOT INDEXED'
    WHEN COUNT(embedding) = 0 THEN '⚠️ INDEXED WITHOUT EMBEDDINGS'
    WHEN COUNT(*) - COUNT(embedding) > 0 THEN '⚠️ PARTIAL EMBEDDINGS'
    WHEN MAX(updated_at) < NOW() - INTERVAL '30 days' THEN '⚠️ STALE'
    ELSE '✅ HEALTHY'
  END as status,
  COUNT(*) as total_chunks,
  COUNT(embedding) as chunks_with_embeddings,
  MAX(updated_at) as last_updated
FROM lesson_chunks
WHERE course_slug = 'agentic-rag';
```

---

## 5. Indexing Commands

### 5.1 Index Single Course

```bash
# Index agentic-rag course
curl -X POST http://localhost:3000/api/rag/index \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "index_course",
    "courseSlug": "agentic-rag",
    "options": {
      "generateEmbeddings": true,
      "minChunkSize": 200,
      "maxChunkSize": 1000,
      "overlap": 100
    }
  }'
```

### 5.2 Index All Courses

```bash
# Index all courses
curl -X POST http://localhost:3000/api/rag/index \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "index_all",
    "options": {
      "generateEmbeddings": true,
      "minChunkSize": 200,
      "maxChunkSize": 1000,
      "overlap": 100
    }
  }'
```

### 5.3 Index Single Lesson

```bash
# Index specific lesson
curl -X POST http://localhost:3000/api/rag/index \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "index_lesson",
    "courseSlug": "agentic-rag",
    "lessonSlug": "Module_01_Foundations_of_Retrieval-Augmented_Generation",
    "options": {
      "generateEmbeddings": true
    }
  }'
```

---

## 6. Automated Indexing (Not Currently Implemented)

### 6.1 Current State

**Status:** ❌ No automated indexing

**Indexing Method:** Manual API calls only

**Cron Jobs:** None for indexing (only for emails)

---

### 6.2 Recommended Automation

**Option 1: Cron Job for Re-indexing**
```typescript
// app/api/cron/reindex-lessons/route.ts
export async function GET(request: NextRequest) {
  // Verify CRON_SECRET
  // Call indexAllLessons() or indexCourse() for updated courses
  // Log results
}
```

**Option 2: On-Demand Indexing on Content Update**
- Trigger indexing when course content files change
- Use GitHub webhook or file watcher
- Index only changed lessons

**Option 3: Background Worker**
- Use queue system (e.g., Bull, BullMQ)
- Queue indexing jobs on content updates
- Process jobs asynchronously

---

## 7. Verification Checklist

### ✅ Checklist: "agentic-rag" Course Indexing

- [ ] **Course Indexed**
  - [ ] Query returns chunks for `course_slug = 'agentic-rag'`
  - [ ] All 7 modules are indexed

- [ ] **Chunk Count**
  - [ ] Total chunks > 0
  - [ ] Each lesson has multiple chunks (> 1)
  - [ ] Chunk count matches expected (based on content length)

- [ ] **Last Updated**
  - [ ] `updated_at` is recent (within last 30 days)
  - [ ] No stale chunks (older than 7 days)

- [ ] **Embedding Model**
  - [ ] Embeddings exist (if enabled)
  - [ ] Embedding dimensions match query model (1536 for `text-embedding-3-small`)
  - [ ] All chunks have embeddings (if embeddings enabled)

- [ ] **Namespace/Collection**
  - [ ] `course_slug` is `'agentic-rag'` (not `'agentic_rag'` or other)
  - [ ] No duplicate namespaces for same course

- [ ] **Chunking Quality**
  - [ ] Most chunks are 200-1000 characters
  - [ ] Few or no chunks < 200 characters
  - [ ] Few or no chunks > 1000 characters
  - [ ] Overlap is working (chunks share content)

- [ ] **Vector Search**
  - [ ] `match_lesson_chunks` function exists
  - [ ] Vector search returns results for test query
  - [ ] Results are from correct course

---

## 8. Summary

### Current State

- ✅ **Indexing System:** On-demand via API endpoint
- ✅ **Chunking:** Default 200-1000 chars, 100 char overlap
- ✅ **Embeddings:** OpenAI `text-embedding-3-small` (1536 dimensions)
- ✅ **Namespace:** `course_slug` serves as namespace/collection
- ❌ **Automation:** No automated indexing (manual only)

### Key Findings

1. **Indexing is Manual** - No ETL job or background worker
2. **Chunking Parameters** - Defaults are reasonable (200-1000 chars)
3. **Embedding Model** - `text-embedding-3-small` (1536 dimensions)
4. **Namespace** - `course_slug` is the namespace identifier
5. **No Automation** - Requires manual re-indexing after content updates

### Recommendations

1. **Add Automated Re-indexing** - Set up cron job to re-index courses periodically
2. **Monitor Index Health** - Add health check endpoint for indexing status
3. **Content Change Detection** - Trigger indexing on content file changes
4. **Index Versioning** - Track embedding model version in metadata
5. **Chunk Quality Metrics** - Monitor chunk size distribution

---

**End of RAG Pipeline Audit**
