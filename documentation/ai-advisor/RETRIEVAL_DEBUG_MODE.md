# Retrieval Debug Mode - Functional Quality Checks

**Date:** 2025-01-27  
**Purpose:** Debug mode for retrieval diagnostics (admin/dev only)

---

## Overview

Debug mode provides detailed retrieval diagnostics to help verify RAG pipeline quality. It's gated behind admin authentication and a debug flag.

---

## Enabling Debug Mode

### Option 1: Query Parameter

Add `?debug=true` to the chat endpoint:

```bash
POST /api/ai-advisor/chat?debug=true
```

### Option 2: Environment Variable

Set `RAG_DEBUG_MODE=1` in environment variables.

---

## Authentication

**Requirement:** User must have `admin` role

**Behavior:**
- If debug mode is requested but user is not admin, debug mode is silently disabled
- No error is returned (normal response without diagnostics)
- Warning is logged: `Debug mode requested but user is not admin`

---

## Diagnostics Included

When debug mode is enabled and user is admin, the response includes a `debug.retrieval` object:

```json
{
  "ok": true,
  "response": "...",
  "conversationId": "...",
  "requestId": "...",
  "debug": {
    "retrieval": {
      "topK": 5,
      "docs": [
        {
          "id": "uuid",
          "title": "Module Title",
          "courseSlug": "agentic-rag",
          "lessonSlug": "Module_01_...",
          "chunkIndex": 0,
          "score": 0.92,
          "contentPreview": "First 200 characters of chunk content..."
        }
      ],
      "latency": {
        "embedding": 150,
        "vectorSearch": 200,
        "keywordSearch": null,
        "total": 350
      },
      "method": "vector",
      "query": "Explain agentic RAG in one paragraph"
    }
  }
}
```

---

## Diagnostics Fields

### `topK`
- **Type:** `number`
- **Description:** Number of documents requested (default: 5)

### `docs`
- **Type:** `Array<DocDiagnostic>`
- **Description:** Top K retrieved documents with diagnostics

#### `DocDiagnostic` Fields:
- `id`: Chunk UUID
- `title`: Lesson title from metadata (or lesson slug if no title)
- `courseSlug`: Course slug (namespace/collection)
- `lessonSlug`: Lesson slug
- `chunkIndex`: Chunk index within lesson
- `score`: Similarity/relevance score (0-1, or null if keyword search)
- `contentPreview`: First 200 characters of chunk content

### `latency`
- **Type:** `LatencyDiagnostics`
- **Description:** Latency breakdown by stage

#### `LatencyDiagnostics` Fields:
- `embedding`: Time to generate query embedding (ms, or null if keyword search)
- `vectorSearch`: Time for vector search (ms, or null if keyword search not used)
- `keywordSearch`: Time for keyword search (ms, or null if vector search used)
- `total`: Total retrieval latency (ms)

### `method`
- **Type:** `'vector' | 'keyword' | 'none'`
- **Description:** Retrieval method used
  - `vector`: Vector similarity search (pgvector)
  - `keyword`: Keyword search (PostgreSQL full-text search)
  - `none`: No retrieval (shouldn't happen if RAG is enabled)

### `query`
- **Type:** `string`
- **Description:** Query text (truncated to 200 chars for diagnostics)

---

## Test Queries

### 1. "Explain agentic RAG in one paragraph"

**Expected:**
- ✅ Top results from `agentic-rag` course
- ✅ Scores > 0.5 (if vector search)
- ✅ Content preview shows relevant text
- ✅ Latency < 1000ms

**Pass Criteria:**
- Top results are from active course (`agentic-rag`)
- No empty retrieval (unless course truly has no docs)
- Stable latency (< 1000ms target)
- Answer grounded in retrieved text (citations if supported)

---

### 2. "What's the difference between naive RAG and agentic RAG?"

**Expected:**
- ✅ Top results from `agentic-rag` course
- ✅ Multiple chunks retrieved (comparison question)
- ✅ Scores indicate relevance
- ✅ Content preview shows comparison content

**Pass Criteria:**
- Top results are from active course
- Multiple relevant chunks retrieved
- Answer references retrieved content

---

### 3. "List key components of enterprise RAG architecture"

**Expected:**
- ✅ Top results from `agentic-rag` course
- ✅ Architecture-related chunks retrieved
- ✅ Scores indicate relevance
- ✅ Content preview shows architecture components

**Pass Criteria:**
- Top results are from active course
- Architecture-related content retrieved
- Answer lists components from retrieved text

---

### 4. "Create a quiz on key concepts from the course"

**Expected:**
- ✅ Top results from active course
- ✅ Multiple chunks retrieved (quiz needs diverse content)
- ✅ Scores indicate relevance
- ✅ Content preview shows course concepts

**Pass Criteria:**
- Top results are from active course
- Multiple chunks retrieved (diverse concepts)
- Answer creates quiz based on retrieved content

---

## Pass Criteria Summary

### ✅ Top Results from Active Course

**Check:**
```json
{
  "debug": {
    "retrieval": {
      "docs": [
        { "courseSlug": "agentic-rag" },  // ✅ Should match active course
        { "courseSlug": "agentic-rag" },
        ...
      ]
    }
  }
}
```

**Failure Cases:**
- ❌ Results from wrong course
- ❌ Results from multiple courses (unless no active course)
- ❌ Empty results when course has content

---

### ✅ No Empty Retrieval (Unless Course Has No Docs)

**Check:**
```json
{
  "debug": {
    "retrieval": {
      "topK": 5,
      "docs": []  // ❌ Should not be empty if course has content
    }
  }
}
```

**Failure Cases:**
- ❌ Empty results when course has indexed content
- ❌ Empty results due to retrieval failure

**Note:** Empty results are acceptable if:
- Course truly has no indexed content
- Query is completely unrelated to course content

---

### ✅ Stable Latency (< Target)

**Check:**
```json
{
  "debug": {
    "retrieval": {
      "latency": {
        "total": 350  // ✅ Should be < 1000ms
      }
    }
  }
}
```

**Targets:**
- Vector search: < 500ms
- Keyword search: < 200ms
- Total (including embedding): < 1000ms

**Failure Cases:**
- ❌ Latency > 1000ms consistently
- ❌ Latency spikes (unstable)

---

### ✅ Answer Grounded in Retrieved Text

**Check:**
- Response should reference retrieved content
- Citations should be present (if supported)
- Answer should be based on retrieved chunks, not general knowledge

**Failure Cases:**
- ❌ Answer doesn't reference retrieved content
- ❌ Answer contradicts retrieved content
- ❌ No citations when content is used

---

## Example Test Script

```bash
#!/bin/bash

# Test queries for retrieval quality
BASE_URL="http://localhost:3000"
AUTH_TOKEN="your-auth-token"

# Test queries
QUERIES=(
  "Explain agentic RAG in one paragraph"
  "What's the difference between naive RAG and agentic RAG?"
  "List key components of enterprise RAG architecture"
  "Create a quiz on key concepts from the course"
)

for query in "${QUERIES[@]}"; do
  echo "Testing: $query"
  
  response=$(curl -s -X POST "${BASE_URL}/api/ai-advisor/chat?debug=true" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d "{
      \"message\": \"$query\",
      \"context\": {
        \"course\": {
          \"id\": \"course-id\",
          \"slug\": \"agentic-rag\",
          \"title\": \"Mastering Agentic RAG for Enterprise AI\"
        }
      },
      \"studentProfileId\": \"profile-id\",
      \"conversationHistory\": []
    }")
  
  # Extract diagnostics
  echo "$response" | jq '.debug.retrieval'
  
  # Check pass criteria
  topK=$(echo "$response" | jq '.debug.retrieval.topK')
  docsCount=$(echo "$response" | jq '.debug.retrieval.docs | length')
  totalLatency=$(echo "$response" | jq '.debug.retrieval.latency.total')
  method=$(echo "$response" | jq -r '.debug.retrieval.method')
  
  echo "  TopK: $topK"
  echo "  Docs: $docsCount"
  echo "  Latency: ${totalLatency}ms"
  echo "  Method: $method"
  
  # Check if all results are from active course
  allFromCourse=$(echo "$response" | jq '[.debug.retrieval.docs[].courseSlug] | unique | length == 1 and .[0] == "agentic-rag"')
  echo "  All from course: $allFromCourse"
  
  echo ""
done
```

---

## Response Format

### Streaming Response (SSE)

For streaming responses, diagnostics are included in the final chunk:

```json
{
  "content": "",
  "done": true,
  "conversationId": "...",
  "requestId": "...",
  "debug": {
    "retrieval": { ... }
  }
}
```

### Non-Streaming Response

For non-streaming responses, diagnostics are at the top level:

```json
{
  "ok": true,
  "response": "...",
  "conversationId": "...",
  "requestId": "...",
  "debug": {
    "retrieval": { ... }
  }
}
```

---

## Security

### Admin-Only Access

- Debug mode requires admin role
- Non-admin users receive normal response (no diagnostics)
- Warning logged if non-admin requests debug mode

### PII Redaction

- Query text is truncated to 200 chars in diagnostics
- Content preview is limited to 200 chars
- No sensitive data exposed in diagnostics

---

## Troubleshooting

### Debug Mode Not Working

1. **Check Admin Role:**
   ```sql
   SELECT role FROM profiles WHERE user_id = 'your-user-id';
   ```
   Should return `'admin'`

2. **Check Debug Flag:**
   - Query param: `?debug=true`
   - Env var: `RAG_DEBUG_MODE=1`

3. **Check Logs:**
   - Look for: `Debug mode requested but user is not admin`
   - Check if diagnostics are being generated

### Empty Diagnostics

- Check if RAG is enabled for the query
- Verify course content is indexed
- Check if retrieval is actually happening

### High Latency

- Check embedding generation time
- Check vector search time
- Check database connection
- Check network latency

---

## Future Enhancements

1. **Retrieval Quality Metrics:**
   - Precision/recall
   - Mean reciprocal rank (MRR)
   - Normalized discounted cumulative gain (NDCG)

2. **Query Analysis:**
   - Query intent classification
   - Query expansion suggestions
   - Query rewriting recommendations

3. **Chunk Quality:**
   - Chunk size distribution
   - Chunk overlap analysis
   - Chunk relevance scores

4. **Comparison Mode:**
   - Compare vector vs keyword search
   - Compare different embedding models
   - Compare different chunking strategies

---

**End of Retrieval Debug Mode Documentation**
