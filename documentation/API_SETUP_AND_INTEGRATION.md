# API Setup and Integration Guide

This document provides comprehensive setup and integration guidelines for the Voice AI Advisor and Jobs Matching features.

## Table of Contents

1. [Required API Endpoints](#required-api-endpoints)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Integration Steps](#integration-steps)
5. [Testing Guidelines](#testing-guidelines)
6. [Troubleshooting](#troubleshooting)

---

## Required API Endpoints

### 1. AI Advisor Chat

#### `POST /api/ai-advisor/chat`

**Purpose**: Main chat endpoint for AI advisor conversations with streaming support.

**Request**:
```typescript
{
  message: string;                    // User's message
  context?: {                         // Optional active context
    course?: { id: string; slug: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  };
  studentProfileId: string | null;    // Student profile ID
  conversationHistory: Array<{        // Last 10 messages for context
    id: string;
    role: 'user' | 'assistant' | 'human';
    content: string;
    timestamp: Date;
  }>;
  intent?: string;                    // Optional: pre-classified intent
  conversationId?: string;             // Optional: conversation ID for persistence
}
```

**Response (Non-streaming)**:
```typescript
{
  response: string;                   // AI response text
  conversationId: string;             // Conversation ID
  nextActions?: Array<{                // Optional: structured next actions
    type: 'start_course' | 'open_lesson' | 'open_job' | ...;
    label: string;
    deepLink: string;
  }>;
}
```

**Response (Streaming - SSE)**:
- Content-Type: `text/event-stream`
- Format: `data: {JSON}\n\n`
- Chunks: `{ content: string, done: boolean, conversationId?: string, nextActions?: Array }`

**Features**:
- Intent classification (automatic or manual)
- RAG (Retrieval Augmented Generation) for course content
- Jobs matching integration
- Portfolio project context
- Next actions generation
- PII-safe logging

**Usage Example**:
```typescript
// Streaming request
const response = await fetch('/api/ai-advisor/chat?stream=true', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  },
  body: JSON.stringify({
    message: 'Explain CRAG to me',
    context: { course: { id: '...', slug: 'agentic-rag', title: '...' } },
    studentProfileId: '...',
    conversationHistory: [],
  }),
});

// Non-streaming request
const response = await fetch('/api/ai-advisor/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* same as above */ }),
});
const data = await response.json();
```

---

### 2. AI Advisor Voice

#### `POST /api/ai-advisor/voice`

**Purpose**: Voice input/output endpoint using OpenAI Whisper (STT) and TTS.

**Feature Flag**: Requires `ENABLE_VOICE_API=true` in environment variables.

**Request** (FormData):
```typescript
{
  audio: File;                        // Audio blob (webm, mp3, wav, m4a, ogg)
  studentProfileId: string | null;
  conversationId?: string;
  generateAudio?: boolean;            // Whether to generate TTS response
  intent?: string;
  context?: string;                   // JSON stringified context object
  conversationHistory?: string;        // JSON stringified conversation history
}
```

**Response**:
```typescript
{
  transcript: string;                  // Transcribed user input
  responseText: string;               // AI response text
  responseAudio?: string;             // Base64-encoded audio (if generateAudio=true)
  conversationId: string;
}
```

**Features**:
- Speech-to-Text via OpenAI Whisper
- Text-to-Speech via OpenAI TTS (optional)
- Voice metadata stored in conversation metadata
- Same RAG, intent, and context features as chat endpoint

**Usage Example**:
```typescript
const formData = new FormData();
formData.append('audio', audioBlob, 'audio.webm');
formData.append('studentProfileId', studentProfileId);
formData.append('generateAudio', 'true');
formData.append('context', JSON.stringify(context));

const response = await fetch('/api/ai-advisor/voice', {
  method: 'POST',
  body: formData,
});
const data = await response.json();
```

---

### 3. Jobs Matching

#### `GET /api/jobs`

**Purpose**: Fetch all active jobs with computed matching scores.

**Response**:
```typescript
{
  jobs: Array<{
    id: string;
    title: string;
    company: string;
    description: string;
    job_type: string;
    experience_level: string;
    location: string;
    is_remote: boolean;
    salary_range: string;
    status: 'recommended' | 'unlocked' | 'locked' | 'stretch' | 'new';
    matching_score: number;            // 0-100, computed on-the-fly
    skills: string[];
    skills_missing: string[];          // Computed missing skills
    recommended_for_courses: string[];
    external_url: string;
    application_deadline: string;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
  }>;
}
```

**Features**:
- Dynamic matching score calculation
- Skills gap analysis
- Status classification (recommended/unlocked/locked/stretch/new)
- Cached student data (7.5 minutes)
- Sorted by matching score (descending)

**Usage Example**:
```typescript
const response = await fetch('/api/jobs');
const data = await response.json();
const recommendedJobs = data.jobs.filter(job => job.status === 'recommended');
```

---

#### `GET /api/jobs/[id]`

**Purpose**: Fetch single job details with computed matching.

**Response**: Same structure as single job object from `/api/jobs` list.

**Usage Example**:
```typescript
const response = await fetch(`/api/jobs/${jobId}`);
const job = await response.json();
console.log(`Match: ${job.matching_score}% - ${job.status}`);
```

---

### 4. Advisor Context Management

#### `GET /api/advisor/context`

**Purpose**: Fetch current active context (course/project/job).

**Response**:
```typescript
{
  studentProfileId: string;
  activeCourseId: string | null;
  activeProjectId: string | null;
  activeJobId: string | null;
}
```

---

#### `POST /api/advisor/context`

**Purpose**: Update active context.

**Request**:
```typescript
{
  activeCourseId?: string | null;
  activeProjectId?: string | null;
  activeJobId?: string | null;
}
```

**Response**: Same as GET response.

---

### 5. Conversation History

#### `GET /api/advisor/conversations`

**Purpose**: Fetch conversation history for current context.

**Query Parameters**:
- `courseId?: string` - Filter by course
- `projectId?: string` - Filter by project
- `jobId?: string` - Filter by job
- `conversationId?: string` - Filter by conversation ID

**Response**:
```typescript
{
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'human';
    content: string;
    timestamp: Date;
    intent?: string;
    metadata?: {
      next_actions?: Array<NextAction>;
      ragChunks?: Array<any>;
      citations?: Array<any>;
    };
  }>;
  conversationId: string | null;
}
```

---

### 6. RAG Indexing (Admin)

#### `POST /api/rag/index`

**Purpose**: Index course lessons for RAG retrieval.

**Request**:
```typescript
{
  courseSlug?: string;                // Optional: index specific course
  lessonSlug?: string;                // Optional: index specific lesson
  // If neither provided, indexes all courses
}
```

**Response**:
```typescript
{
  success: boolean;
  indexed: number;                    // Number of chunks indexed
  courseSlug?: string;
  lessonSlug?: string;
}
```

**Note**: This endpoint should be called after course content updates.

---

### 7. Portfolio CV Upload

#### `POST /api/portfolio/cv/upload`

**Purpose**: Upload and extract text from CV (PDF/DOCX).

**Request** (FormData):
```typescript
{
  file: File;                         // PDF or DOCX file
  studentProfileId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  cv: {
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    visibility: string;
  };
  url: string;                        // Public URL
  textExtracted: boolean;             // Whether text extraction succeeded
}
```

**Features**:
- Text extraction from PDF/DOCX
- Stores extracted text in `student_profiles.cv_text`
- Used for skill extraction in job matching

---

## Environment Variables

### Required

```env
# LLM Provider (OpenAI or Anthropic)
LLM_API_KEY=sk-...                    # Your LLM provider API key
LLM_PROVIDER=openai                    # 'openai' or 'anthropic'

# OpenAI Configuration (if using OpenAI)
OPENAI_MODEL=gpt-4-turbo-preview       # Model to use
OPENAI_BASE_URL=https://api.openai.com/v1  # Optional: custom base URL

# Anthropic Configuration (if using Anthropic)
ANTHROPIC_MODEL=claude-3-opus-20240229 # Model to use
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1  # Optional: custom base URL

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Voice API (Optional)
ENABLE_VOICE_API=true                  # Enable voice endpoint
OPENAI_API_KEY=sk-...                  # Required for Whisper/TTS (can be same as LLM_API_KEY)
```

### Optional

```env
# LLM Provider Overrides
OPENAI_MODEL=gpt-4-turbo-preview
ANTHROPIC_MODEL=claude-3-opus-20240229

# Feature Flags
ENABLE_VOICE_API=false                 # Disable voice features
```

---

## Database Setup

### Required Tables

#### 1. `advisor_conversations`

Stores chat conversation messages.

```sql
CREATE TABLE advisor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  active_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  active_project_id UUID REFERENCES portfolio_projects(id) ON DELETE SET NULL,
  active_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'human')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_advisor_conversations_student ON advisor_conversations(student_profile_id);
CREATE INDEX idx_advisor_conversations_conv_id ON advisor_conversations(conversation_id);
CREATE INDEX idx_advisor_conversations_context ON advisor_conversations(active_course_id, active_project_id, active_job_id);
```

#### 2. `advisor_context`

Stores active context for each student.

```sql
CREATE TABLE advisor_context (
  student_profile_id UUID PRIMARY KEY REFERENCES student_profiles(id) ON DELETE CASCADE,
  active_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  active_project_id UUID REFERENCES portfolio_projects(id) ON DELETE SET NULL,
  active_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 3. `lesson_chunks`

Stores RAG-indexed lesson content.

```sql
CREATE TABLE lesson_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_slug VARCHAR(255) NOT NULL,
  lesson_slug VARCHAR(255) NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),              -- pgvector extension required
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, lesson_slug, chunk_index)
);

CREATE INDEX idx_lesson_chunks_course ON lesson_chunks(course_id);
CREATE INDEX idx_lesson_chunks_slug ON lesson_chunks(course_slug, lesson_slug);
CREATE INDEX idx_lesson_chunks_embedding ON lesson_chunks USING ivfflat (embedding vector_cosine_ops);
```

**Note**: Requires `pgvector` extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 4. `student_profiles` (Update)

Add `cv_text` column:

```sql
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS cv_text TEXT;
```

#### 5. `jobs`

Required fields for matching:

```sql
-- Ensure these columns exist
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recommended_for_courses TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50);
```

---

## Integration Steps

### Step 1: Environment Setup

1. Copy `.env.example` to `.env.local` (if not exists)
2. Add required environment variables (see [Environment Variables](#environment-variables))
3. Verify Supabase connection

### Step 2: Database Migrations

Run migrations in order:

```bash
# 1. Create advisor tables
psql -d your_database -f supabase/migrations/YYYYMMDD_create_advisor_tables.sql

# 2. Create lesson_chunks table
psql -d your_database -f supabase/migrations/20250114000001_create_lesson_chunks_table.sql

# 3. Create vector search function
psql -d your_database -f supabase/migrations/20250114000002_create_vector_search_function.sql

# 4. Add cv_text column
psql -d your_database -f supabase/migrations/20250116000001_add_cv_text_to_student_profiles.sql

# 5. Enable pgvector extension
psql -d your_database -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Step 3: Index Course Content

Index lessons for RAG:

```bash
# Index all courses
curl -X POST http://localhost:3000/api/rag/index \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Index specific course
curl -X POST http://localhost:3000/api/rag/index \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseSlug": "agentic-rag"}'
```

### Step 4: Test API Endpoints

#### Test Chat Endpoint

```bash
curl -X POST http://localhost:3000/api/ai-advisor/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "message": "Explain CRAG to me",
    "studentProfileId": "your-student-profile-id",
    "conversationHistory": []
  }'
```

#### Test Jobs Endpoint

```bash
curl http://localhost:3000/api/jobs \
  -H "Cookie: your-auth-cookie"
```

#### Test Voice Endpoint (if enabled)

```bash
curl -X POST http://localhost:3000/api/ai-advisor/voice \
  -H "Cookie: your-auth-cookie" \
  -F "audio=@test-audio.webm" \
  -F "studentProfileId=your-student-profile-id" \
  -F "generateAudio=true"
```

### Step 5: Frontend Integration

The components are already integrated. Verify:

1. **AI Advisor Component**: `components/ai-advisor/AIAdvisor.tsx`
   - Uses `/api/ai-advisor/chat` with streaming
   - Loads context from `/api/advisor/context`
   - Loads history from `/api/advisor/conversations`

2. **Jobs Page**: `components/jobs/JobOpportunitiesPage.tsx`
   - Uses `/api/jobs` for job list
   - Uses `/api/jobs/[id]` for job details

3. **Voice Controls**: `components/ai-advisor/VoiceControls.tsx`
   - Uses `/api/ai-advisor/voice` (if enabled)

---

## Testing Guidelines

### Unit Tests

Run job matcher tests:

```bash
npm test -- tests/unit/job-matcher.test.ts
```

### Integration Tests

#### Test Chat Flow

1. Send a message without context
2. Set course context
3. Send a course-related question
4. Verify RAG chunks are retrieved
5. Verify citations are included

#### Test Jobs Matching

1. Create a student profile with skills
2. Create portfolio projects
3. Enroll in courses
4. Fetch jobs
5. Verify matching scores are computed
6. Verify status classification

#### Test Voice API

1. Record audio (webm format)
2. Send to `/api/ai-advisor/voice`
3. Verify transcript is returned
4. Verify response text is generated
5. Verify audio is generated (if `generateAudio=true`)

### Manual Testing Checklist

- [ ] Chat endpoint responds with streaming
- [ ] Chat endpoint responds without streaming
- [ ] Context is saved and loaded correctly
- [ ] Conversation history loads correctly
- [ ] RAG retrieval works for course questions
- [ ] Jobs matching computes scores correctly
- [ ] Jobs are sorted by matching score
- [ ] Voice endpoint transcribes audio correctly
- [ ] Voice endpoint generates TTS (if enabled)
- [ ] CV upload extracts text correctly
- [ ] CV text is used in job matching
- [ ] Next actions are generated and displayed
- [ ] PII is redacted in logs

---

## Troubleshooting

### Common Issues

#### 1. LLM API Key Not Found

**Error**: `LLM_API_KEY environment variable is required`

**Solution**: Add `LLM_API_KEY` to `.env.local`

#### 2. RAG Not Working

**Symptoms**: No course content in responses

**Solutions**:
- Verify `lesson_chunks` table exists
- Run indexing: `POST /api/rag/index`
- Check embeddings are generated (verify `embedding` column is not null)
- Verify `pgvector` extension is enabled

#### 3. Jobs Matching Returns 0 Scores

**Symptoms**: All jobs have `matching_score: 0`

**Solutions**:
- Verify student has portfolio projects or enrollments
- Check `student_profiles.cv_text` is populated (if CV uploaded)
- Verify `jobs.skills` and `jobs.recommended_for_courses` are arrays
- Check cache: clear Next.js cache or wait 7.5 minutes

#### 4. Voice API Not Available

**Error**: `Voice API is not enabled`

**Solution**: Set `ENABLE_VOICE_API=true` in `.env.local`

#### 5. Streaming Not Working

**Symptoms**: Response appears all at once

**Solutions**:
- Verify `Accept: text/event-stream` header is sent
- Check `?stream=true` query parameter
- Verify browser supports SSE (EventSource)
- Check network tab for SSE connection

#### 6. PII in Logs

**Symptoms**: Sensitive data appears in console/logs

**Solution**: Verify `safeLogger` is used instead of `console.log/error/warn`

---

## Performance Considerations

### Caching

- **Student Data**: Cached for 7.5 minutes (Next.js `unstable_cache`)
- **Request-Scope**: Memoized within single request
- **RAG Chunks**: No caching (always fresh from database)

### Optimization Tips

1. **Index RAG Content**: Run indexing after course updates
2. **Batch Job Matching**: Jobs are computed on-the-fly (consider caching if >100 jobs)
3. **Streaming**: Use streaming for better UX (reduces perceived latency)
4. **Voice**: Only enable if needed (adds API costs)

---

## Security Considerations

1. **PII Redaction**: All logs use `safeLogger` (CV text, transcripts never logged)
2. **Authentication**: All endpoints require authenticated user
3. **Authorization**: Student endpoints verify `role === 'student'`
4. **Input Validation**: Messages checked for sensitive info (passwords, API keys)
5. **Rate Limiting**: Consider adding rate limits for production

---

## Next Steps

1. **Monitor API Usage**: Track LLM API costs
2. **Optimize RAG**: Fine-tune chunk size and retrieval parameters
3. **Enhance Matching**: Add more factors (experience, location preferences)
4. **Voice Improvements**: Add language detection, better error handling
5. **Analytics**: Track conversation quality, user satisfaction

---

## Support

For issues or questions:
1. Check logs (with PII redacted)
2. Verify environment variables
3. Test endpoints individually
4. Review database schema
5. Check Supabase RLS policies
