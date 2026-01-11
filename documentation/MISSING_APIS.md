# Missing APIs for Full Functionality

This document lists the API endpoints that are missing to complete the Voice AI Advisor and Jobs Matching features.

---

## 🎤 Voice API: Do You Need ElevenLabs?

### **Answer: NO, ElevenLabs is NOT needed**

**Current Implementation:**
- ✅ **Client-Side STT**: Web Speech API (browser-native, free)
- ✅ **Server-Side STT**: OpenAI Whisper API (`/v1/audio/transcriptions`)
- ✅ **Server-Side TTS**: OpenAI TTS API (`/v1/audio/speech`)

**Voice Stack:**
```
User speaks → Web Speech API (client) OR Audio blob → OpenAI Whisper (server)
AI responds → OpenAI TTS (server) OR Browser SpeechSynthesis (client)
```

**Why Not ElevenLabs?**
- OpenAI TTS provides good quality voices (6 voices: alloy, echo, fable, onyx, nova, shimmer)
- Already using OpenAI for LLM, so no additional vendor needed
- Cost-effective: OpenAI TTS is cheaper than ElevenLabs for most use cases
- Simpler architecture: One API provider (OpenAI) for LLM + STT + TTS

**When You Might Want ElevenLabs:**
- Need more natural/expressive voices
- Need voice cloning
- Need multilingual voices with accents
- Need very high-quality production voices

**Current Voice API Endpoints:**
- ✅ `/api/ai-advisor/voice` - Already implemented
  - Uses OpenAI Whisper for STT
  - Uses OpenAI TTS for audio generation (optional)

---

## ❌ Missing API Endpoints

### 1. Human Escalation API

**Status**: UI exists, backend missing

**Missing Endpoint**: `POST /api/advisor/escalate`

**Purpose**: Escalate conversation to human advisor

**Request**:
```typescript
{
  studentProfileId: string;
  conversationId: string;
  reason?: string;
  context: {
    course?: { id: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  };
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}
```

**Response**:
```typescript
{
  escalationId: string;
  status: 'pending' | 'assigned' | 'in_progress';
  estimatedWaitTime?: number; // minutes
  advisorId?: string;
  message: string;
}
```

**Database Table Needed**:
```sql
CREATE TABLE advisor_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id),
  conversation_id UUID NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  assigned_advisor_id UUID REFERENCES profiles(id),
  messages JSONB NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);
```

**Additional Endpoints Needed**:
- `GET /api/advisor/escalations` - List escalations (for advisors)
- `PUT /api/advisor/escalations/[id]` - Update escalation status
- `GET /api/advisor/escalations/[id]` - Get escalation details

**Location**: `components/ai-advisor/HumanEscalationModal.tsx` (UI ready, line 24: `// TODO: Send escalation request to API`)

---

### 2. Job Application Tracking API

**Status**: UI exists, backend missing

**Missing Endpoints**:

#### `POST /api/jobs/applications`

**Purpose**: Create/save job application

**Request**:
```typescript
{
  jobId: string;
  studentProfileId: string;
  cvContent?: string;
  coverLetterContent?: string;
  selectedProjectIds?: string[];
  status: 'draft' | 'applied';
  notes?: string;
}
```

**Response**:
```typescript
{
  applicationId: string;
  jobId: string;
  status: 'draft' | 'applied' | 'interview' | 'rejected' | 'accepted';
  createdAt: string;
  updatedAt: string;
}
```

#### `GET /api/jobs/applications`

**Purpose**: List user's job applications

**Query Parameters**:
- `status?: string` - Filter by status
- `jobId?: string` - Filter by job

**Response**:
```typescript
{
  applications: Array<{
    id: string;
    jobId: string;
    job: {
      id: string;
      title: string;
      company: string;
    };
    status: 'draft' | 'applied' | 'interview' | 'rejected' | 'accepted';
    cvContent?: string;
    coverLetterContent?: string;
    selectedProjectIds: string[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

#### `GET /api/jobs/applications/[id]`

**Purpose**: Get single application details

#### `PUT /api/jobs/applications/[id]`

**Purpose**: Update application (status, notes, etc.)

#### `DELETE /api/jobs/applications/[id]`

**Purpose**: Delete draft application

**Database Table Needed**:
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  cv_content TEXT,
  cover_letter_content TEXT,
  selected_project_ids UUID[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  UNIQUE(student_profile_id, job_id) -- One application per job per student
);

CREATE INDEX idx_job_applications_student ON job_applications(student_profile_id);
CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
```

**Location**: `components/jobs/ApplyWithAIModal.tsx` (UI ready, lines 67-81: TODOs for API calls)

---

### 3. CV/Cover Letter Generation API

**Status**: UI exists, backend missing

**Missing Endpoint**: `POST /api/jobs/generate-application`

**Purpose**: Generate CV or cover letter tailored to a job

**Request**:
```typescript
{
  type: 'cv' | 'cover-letter';
  jobId: string;
  studentProfileId: string;
  useExistingCV?: boolean; // Use uploaded CV as base
  selectedProjectIds?: string[]; // Projects to highlight
  customInstructions?: string; // Additional instructions
}
```

**Response**:
```typescript
{
  content: string; // Generated CV or cover letter text
  metadata: {
    model: string;
    tokensUsed: number;
    generatedAt: string;
  };
}
```

**Implementation Notes**:
- Use LLM (same as chat) with job description + student profile
- Include portfolio projects if `selectedProjectIds` provided
- Use uploaded CV as base if `useExistingCV: true`
- Store generated content in `job_applications` table

**Location**: `components/jobs/ApplyWithAIModal.tsx` (lines 67-75: TODOs)

---

### 4. Application Export API (Optional)

**Status**: UI exists, backend missing

**Missing Endpoint**: `POST /api/jobs/applications/[id]/export`

**Purpose**: Export application as PDF/DOCX

**Request**:
```typescript
{
  format: 'pdf' | 'docx';
  includeCV: boolean;
  includeCoverLetter: boolean;
  includePortfolio: boolean;
}
```

**Response**: File download (PDF or DOCX)

**Implementation Notes**:
- Use libraries like `pdfkit` (PDF) or `docx` (DOCX)
- Combine CV, cover letter, and portfolio into single document
- Return as blob/download

**Location**: `components/jobs/ApplyWithAIModal.tsx` (line 77-81: TODO)

---

### 5. Job Notifications API (Optional Enhancement)

**Status**: Not implemented

**Missing Endpoints**:

#### `POST /api/jobs/notifications/preferences`

**Purpose**: Set notification preferences for new matching jobs

**Request**:
```typescript
{
  enabled: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
  minMatchScore?: number; // Only notify if match >= this score
  statuses?: string[]; // Only notify for these statuses (recommended, unlocked, etc.)
}
```

#### `GET /api/jobs/notifications/preferences`

**Purpose**: Get notification preferences

#### `POST /api/jobs/notifications/test`

**Purpose**: Send test notification

**Database Table Needed**:
```sql
CREATE TABLE job_notification_preferences (
  student_profile_id UUID PRIMARY KEY REFERENCES student_profiles(id),
  enabled BOOLEAN NOT NULL DEFAULT false,
  frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
  min_match_score INTEGER DEFAULT 60,
  statuses TEXT[] DEFAULT ARRAY['recommended', 'unlocked'],
  last_notified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Integration**: Use existing email system (`/api/cron/weekly-jobs-emails`)

---

### 6. Conversation Analytics API (Optional Enhancement)

**Status**: Not implemented

**Missing Endpoint**: `GET /api/advisor/analytics`

**Purpose**: Get conversation quality metrics (for admins/instructors)

**Query Parameters**:
- `studentProfileId?: string` - Filter by student
- `dateFrom?: string` - Date range start
- `dateTo?: string` - Date range end
- `intent?: string` - Filter by intent

**Response**:
```typescript
{
  totalConversations: number;
  totalMessages: number;
  averageResponseTime: number; // seconds
  intentDistribution: {
    learning_help: number;
    project_review: number;
    job_matching: number;
    // ...
  };
  satisfactionScores?: Array<{
    conversationId: string;
    score: number; // 1-5
    feedback?: string;
  }>;
  topIssues: Array<{
    issue: string;
    count: number;
  }>;
}
```

**Database Table Needed**:
```sql
CREATE TABLE conversation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 📋 Summary of Missing APIs

### High Priority (Core Functionality)

1. **Human Escalation API** (`POST /api/advisor/escalate`)
   - Status: UI ready, backend missing
   - Impact: Human escalation doesn't work
   - Effort: Medium (2-3 days)

2. **Job Application Tracking API** (`POST /api/jobs/applications`, `GET /api/jobs/applications`)
   - Status: UI ready, backend missing
   - Impact: Users can't track applications
   - Effort: Medium (3-4 days)

3. **CV/Cover Letter Generation API** (`POST /api/jobs/generate-application`)
   - Status: UI ready, backend missing
   - Impact: "Apply with AI" feature incomplete
   - Effort: Medium (2-3 days)

### Medium Priority (Enhancements)

4. **Application Export API** (`POST /api/jobs/applications/[id]/export`)
   - Status: UI ready, backend missing
   - Impact: Can't export applications
   - Effort: Low (1-2 days)

5. **Job Notifications API** (`POST /api/jobs/notifications/preferences`)
   - Status: Not implemented
   - Impact: No automatic job alerts
   - Effort: Medium (2-3 days)

### Low Priority (Analytics)

6. **Conversation Analytics API** (`GET /api/advisor/analytics`)
   - Status: Not implemented
   - Impact: No insights into advisor performance
   - Effort: Medium (3-4 days)

---

## 🎯 Quick Answer: Voice APIs

**Do you need ElevenLabs? NO.**

**Current Setup:**
- ✅ Client-side: Web Speech API (free, browser-native)
- ✅ Server-side: OpenAI Whisper (STT) + OpenAI TTS
- ✅ Already implemented in `/api/ai-advisor/voice`

**Environment Variables Needed:**
```env
OPENAI_API_KEY=sk-...  # For Whisper (STT) and TTS
ENABLE_VOICE_API=true  # Feature flag
```

**No Additional APIs Needed for Voice** - It's complete!

---

## 🚀 Implementation Priority

### Phase 1: Core Missing APIs (1-2 weeks)
1. Human Escalation API
2. Job Application Tracking API
3. CV/Cover Letter Generation API

### Phase 2: Enhancements (1 week)
4. Application Export API
5. Job Notifications API

### Phase 3: Analytics (1 week)
6. Conversation Analytics API

---

## 📝 Notes

- **Voice**: Fully functional with OpenAI, no ElevenLabs needed
- **Missing APIs**: 6 endpoints total (3 high priority, 3 optional)
- **UI Ready**: Most missing APIs have UI components ready
- **Database**: Need 3-4 new tables for full functionality
