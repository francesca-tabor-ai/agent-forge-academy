# AI Growth Hub Architecture Summary

<style>
/* Architecture/Flow/Diagram/Code Block Styling - White Text on Black Background */
pre, code, pre code {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  border: 1px solid #333333;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
}

/* Ensure all code blocks maintain black background */
pre {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

/* Selection state - dark background, white text */
pre::selection, code::selection, pre code::selection {
  background-color: #333333 !important;
  color: #FFFFFF !important;
}

pre ::selection, code ::selection {
  background-color: #333333 !important;
  color: #FFFFFF !important;
}

/* Highlight/Mark state - dark accent, white text */
pre mark, code mark, pre code mark {
  background-color: #444444 !important;
  color: #FFFFFF !important;
}

/* Hover state - stay black */
pre:hover, code:hover {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}

/* Focus state - stay black with subtle outline */
pre:focus, code:focus {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  outline: 1px solid #666666;
}

/* Nested elements inherit white text */
pre *, code *, pre code * {
  color: #FFFFFF !important;
}

/* Prevent theme overrides */
pre.prose, code.prose {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}
</style>

## Overview
AI Growth Hub is a Next.js 14+ (App Router) learning platform with Supabase backend, focused on multi-agent systems, AI infrastructure, and agent operations. It combines learning, student portfolios, recruiter discovery, and tutor support.

---

## 1. Routes & Routing

### Route Structure
- **Public Routes**: `/`, `/auth/login`, `/auth/signup`, `/auth/reset-password`
- **Protected Routes**: All routes under `/app`, `/student/*`, `/tutor/*`, `/recruiter/*`
- **Role-Based Routes**:
  - `/student/*` → Requires `student` role
  - `/tutor/*` → Requires `instructor` role (normalized from `tutor`)
  - `/recruiter/*` → Requires `recruiter` role
  - `/admin/*` → Requires `admin` role

### Key Student Routes
- `/student/dashboard` - Main dashboard
- `/student/courses` - Course listings
- `/student/courses/[courseSlug]` - Course detail
- `/student/courses/[courseSlug]/lessons` - Course lessons
- `/student/lessons/[slug]` - Individual lesson
- `/student/portfolio` - Portfolio management
- `/student/jobs` - Job opportunities
- `/student/jobs/[id]` - Job detail
- `/student/ai-advisor` - AI advisor chat interface
- `/student/questions` - Q&A system
- `/student/tools` - Tool discounts/offers (also accessible via `/student/offers` redirect)
- `/student/tools/[slug]` - Individual tool detail
- `/student/subscription` - Subscription management

### API Routes
- `/api/ai-advisor/chat` - AI advisor chat endpoint
- `/api/advisor/context` - Get/set active context
- `/api/advisor/conversations` - Conversation history
- `/api/jobs` - List jobs
- `/api/jobs/[id]` - Job details
- `/api/courses/enroll` - Course enrollment
- `/api/portfolio/*` - Portfolio operations
- `/api/questions` - Q&A operations

### Middleware
- **Location**: `middleware.ts`
- **Function**: 
  - Authentication check
  - Onboarding completion check
  - Role-based route protection
  - Session management via Supabase SSR

---

## 2. Authentication & Authorization

### Auth Provider
- **Supabase Auth** (Email/Password, OAuth support)
- **Session Management**: Server-side via `@supabase/ssr`

### User Roles
- `student` - Learners, portfolio creators
- `instructor` (normalized from `tutor`) - Course instructors, Q&A responders
- `recruiter` - Talent discovery, demo day attendance
- `admin` - Platform management

### Onboarding Flow
1. User signs up/logs in
2. If `onboarding_completed = false` → redirect to `/auth/onboarding`
3. User selects role
4. Role saved to `profiles` table
5. `onboarding_completed = true`
6. Redirect to role-specific dashboard

### Authorization Layers
1. **Middleware**: Route-level protection
2. **Server Components**: Role checks in layouts
3. **RLS Policies**: Database-level enforcement
4. **API Routes**: Server-side validation

---

## 3. Database Schema

### Core Tables

#### `profiles`
- Links to `auth.users`
- Stores: `id`, `user_id`, `role`, `onboarding_completed`
- One profile per user

#### `student_profiles`
- Extended profile for students
- Stores: `profile_id`, `headshot_image_url`, `cv_file_path`, portfolio visibility settings
- Links to `profiles.id`

#### `courses`
- Course metadata (lessons stored as Markdown files)
- Stores: `id`, `slug`, `title`, `description`, `thumbnail_url`, `duration_weeks`, `difficulty_level`, `is_published`

#### `course_enrollments`
- Student-course relationships
- Stores: `course_id`, `student_profile_id`, `progress_percentage`, `enrolled_at`, `completed_at`

#### `portfolio_projects`
- Student project portfolio
- Stores: `id`, `student_profile_id`, `title`, `description`, `tech_stack[]`, `github_url`, `demo_url`, `images[]`

#### `jobs`
- Job opportunities
- Stores: `id`, `title`, `company`, `description`, `job_type`, `experience_level`, `location`, `is_remote`, `salary_range`, `status`, `matching_score`, `skills[]`, `skills_missing[]`, `recommended_for_courses[]`, `external_url`

#### `advisor_context`
- Active context for AI advisor
- Stores: `student_profile_id`, `active_course_id`, `active_project_id`, `active_job_id`
- One row per student (UNIQUE constraint)

#### `advisor_conversations`
- Conversation history
- Stores: `student_profile_id`, `conversation_id`, `active_course_id`, `active_project_id`, `active_job_id`, `role`, `content`, `metadata` (JSONB)

#### `questions` & `answers`
- Q&A system
- Questions linked to lessons/labs/projects
- Tutors can mark accepted answers

#### `subscriptions`
- Subscription management
- Stores: `student_profile_id`, `tier` (essential/professional), `status`, `price_monthly`, `current_period_start/end`

#### `subscription_tier_courses`
- Maps subscription tiers to accessible courses

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce:
  - Students can only access their own data
  - Recruiters can only see students who opted in
  - Instructors can see student questions/answers
  - Public read access for published courses

---

## 4. Content Model

### Markdown-First Architecture
- **Lessons**: Stored as `.md` files in `/course/[courseSlug]/` directories
- **Frontmatter**: YAML metadata (title, module, week, order, description)
- **Not in Database**: Lesson content is file-based, only metadata in DB

### Course Structure
```
/course/
  /ai-recommender-systems/
    Module_01_*.md
    Module_02_*.md
    ...
  /multi-agent-systems/
    Module_01_*.md
    ...
```

### Content Loading
- **Library**: `lib/lessons.ts`
- **Functions**: 
  - `loadAllLessons(courseSlug?)` - Load lessons from file system
  - `loadLessonBySlug(slug, courseSlug?)` - Load single lesson
  - `getAllCourseSlugs()` - Get available courses

### Course Metadata
- **Library**: `lib/course-metadata.ts`
- **Purpose**: Dashboard cards, course listings
- **Stored**: In-memory TypeScript object (not in DB)

---

## 5. Existing AI/Tutor Features

### AI Advisor (Text-Based)
**Location**: `/student/ai-advisor`, `components/ai-advisor/AIAdvisor.tsx`

**Features**:
- Context-aware chat (course/project/job context)
- Quick actions (explain lesson, quiz, architecture review, etc.)
- Conversation history stored in `advisor_conversations`
- Active context stored in `advisor_context`
- Human escalation modal
- Context selector modal

**API**: `/api/ai-advisor/chat`
- Accepts: `message`, `context`, `studentProfileId`, `conversationHistory`, `intent`
- Returns: `response`, `conversationId`
- **Current Implementation**: Mock responses (TODO: integrate real LLM)

**Context Types**:
- Course context: Active course ID
- Project context: Active portfolio project ID
- Job context: Active job application ID
- General: No specific context

**Quick Actions**:
- Learning: "Explain this lesson", "Quiz me", "Practice task"
- Projects: "Review architecture", "Suggest improvements", "Help write description"
- Career: "Generate CV for this job", "Review application", "Career path advice"

### Jobs Matching
**Location**: `/student/jobs`, `components/jobs/JobOpportunitiesPage.tsx`

**Features**:
- Job listings with matching scores (0-100)
- Status-based filtering: `new`, `unlocked`, `recommended`, `locked`, `stretch`
- Skills matching: Shows required skills and missing skills
- Course recommendations: Jobs linked to courses that prepare for them
- Match explanation modal
- Apply with AI modal (CV/cover letter generation)

**API**: `/api/jobs`
- Returns: Jobs with `matching_score`, `status`, `skills[]`, `skills_missing[]`
- **Current Implementation**: Static matching scores (TODO: dynamic matching algorithm)

**Job Status Logic**:
- `recommended`: High match score, student has required skills
- `unlocked`: Good match, some skills missing but achievable
- `locked`: Missing critical skills
- `stretch`: Advanced role, aspirational
- `new`: Recently added

### Tutor Q&A System
**Location**: `/student/questions`, `/tutor/questions`

**Features**:
- Students ask questions linked to lessons/labs/projects
- Tutors answer questions
- Tutors can mark accepted answers
- Builds knowledge base over time

**Tables**: `questions`, `answers`
- Questions have `context_type` (lesson/lab/project) and `context_id`
- Answers have `is_accepted` flag

---

## 6. Key Components

### Layout Components
- `AuthenticatedLayout` - Shared layout for authenticated users
- `Sidebar` - Navigation sidebar with role-based menu items

### Dashboard Components
- `AIAdvisorSection` - Dashboard widget for AI advisor
- `CoursesSection` - Course cards
- `JobOpportunitiesSection` - Job preview cards
- `PortfolioSection` - Portfolio preview
- `OffersSection` - Tool discount offers

### AI Advisor Components
- `AIAdvisor` - Main chat interface
- `ChatPanel` - Message display
- `ContextBar` - Active context indicator
- `QuickActions` - Quick action buttons
- `ContextSelectorModal` - Select active context
- `HumanEscalationModal` - Escalate to human tutor

### Jobs Components
- `JobOpportunitiesPage` - Main jobs listing page
- `MatchExplanationModal` - Explains why job matches
- `ApplyWithAIModal` - AI-assisted application flow

### Portfolio Components
- `ProfileOverview` - Student profile display
- `ProjectsList` - Portfolio projects
- `NewProjectForm` - Create project
- `EditProjectForm` - Edit project
- `CVUpload` - CV management

---

## 7. Technology Stack

### Frontend
- **Next.js 14+** (App Router, TypeScript)
- **React Server Components** + Client Components
- **Tailwind CSS** - Styling
- **MDX** - Markdown rendering (if needed)

### Backend
- **Supabase**:
  - Auth (Email/Password, OAuth)
  - PostgreSQL database
  - Row Level Security (RLS)
  - Storage (for CVs, headshots, project images)
  - Realtime (if needed)

### Libraries
- `@supabase/ssr` - Server-side Supabase client
- `@supabase/supabase-js` - Supabase client
- `gray-matter` - Markdown frontmatter parsing
- `fs` - File system for reading Markdown lessons

---

## 8. Security & Privacy

### Privacy Model
- **Opt-in by default**: Students must explicitly opt-in for recruiter visibility
- **RLS enforcement**: Database-level access control
- **Consent logging**: Tracks when students opt-in/out

### Security Layers
1. **Middleware**: Route protection
2. **Server Components**: Role validation
3. **API Routes**: Request validation
4. **RLS Policies**: Database-level enforcement

---

## 9. Current Limitations & TODOs

### AI Advisor
- ✅ Context-aware chat UI
- ✅ Conversation history storage
- ❌ **TODO**: Integrate real LLM API (OpenAI, Anthropic, etc.)
- ❌ **TODO**: RAG for course content retrieval
- ❌ **TODO**: Voice input/output (not implemented)

### Jobs Matching
- ✅ Job listings with matching scores
- ✅ Skills matching display
- ❌ **TODO**: Dynamic matching algorithm (currently static scores)
- ❌ **TODO**: Real-time skill gap analysis
- ❌ **TODO**: Application tracking

### Apply with AI
- ✅ UI for CV/cover letter generation
- ❌ **TODO**: Actual AI generation API
- ❌ **TODO**: Export functionality (PDF/DOCX)

---

## 10. Data Flow Examples

### AI Advisor Chat Flow
1. User types message in `AIAdvisor` component
2. Component calls `/api/ai-advisor/chat` with message + context
3. API fetches context data (course/project/job) from Supabase
4. API generates response (currently mock, TODO: LLM)
5. API stores conversation in `advisor_conversations`
6. Response returned to component
7. Component displays message in chat

### Jobs Matching Flow
1. User visits `/student/jobs`
2. Page calls `/api/jobs`
3. API fetches jobs from `jobs` table
4. Jobs filtered/sorted by matching score
5. Component displays job cards
6. User clicks job → `/student/jobs/[id]`
7. Job detail page shows full description, skills, match explanation

### Course Enrollment Flow
1. User browses courses → `/student/courses`
2. User clicks course → `/student/courses/[courseSlug]`
3. User enrolls → POST `/api/courses/enroll`
4. API creates `course_enrollments` record
5. User redirected to course lessons

---

## Summary

The platform is well-structured with:
- ✅ Clear role-based routing
- ✅ Markdown-first content model
- ✅ Comprehensive RLS policies
- ✅ Context-aware AI advisor UI
- ✅ Jobs matching infrastructure
- ✅ Portfolio management
- ✅ Q&A system
