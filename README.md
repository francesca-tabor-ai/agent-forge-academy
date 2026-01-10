# AgentForge Academy

AgentForge Academy is a Markdown-first, production-grade learning and talent platform focused on multi-agent systems, AI infrastructure, and agent operations.

It combines:

- a technical learning environment
- student portfolios and recruiter discovery
- tutor-led remote support
- demo days and hiring signals

**Built for engineers. Designed for scale.**

## 1. Tech Stack

### Core

- **Next.js** (App Router, TypeScript)
- **Supabase** (Auth, Postgres, RLS, Storage, Realtime)
- **Markdown / MDX** (lesson content)
- **Cursor** (primary development environment)

### Deployment

- **Vercel** (frontend)
- **Supabase Cloud** (backend)

## 2. Repository Structure

```
agentforge/
 apps/
    web/                 # Next.js application

 packages/
    content/             # Markdown lessons + media registry
    ui/                  # Shared UI components
    lib/                 # Supabase clients & helpers

 supabase/
    migrations/          # SQL migrations
    seed.sql
    policies.sql         # RLS policies

 docs/
    cursor-prompts.md    # Cursor agent prompt pack

 README.md
```

## 3. Core Principles (Read Before Coding)

### Markdown is the source of truth

- Lesson content lives in Git
- Supabase stores metadata only

### Privacy by default

- Students must opt-in to recruiter visibility
- All access enforced via Supabase RLS

### Minimal first

- Ship vertical slices
- Defer automation, rankings, and AI features

### Explicit > clever

- Clear schemas
- Simple queries
- Obvious permission boundaries

## 4. Content System (Lessons & Media)

### 4.1 Lessons

Lessons are written as Markdown files with frontmatter.

**Example:**

```markdown
---
id: lesson-02-architecture
title: Multi-Agent Architecture Patterns
module: week-01-foundations
duration_minutes: 45
media_refs:
  - video:mcp-overview
  - book:designing-mas
---

## Lesson Content
```

Lessons are **not** stored in Supabase.

### 4.2 Media Registry

All external content is registered centrally:

```
packages/content/media/
 videos.yaml
 books.yaml
 blogs.yaml
```

Lessons reference media by ID, not URLs.

This enables:

- reuse across lessons
- validation
- easy updates
- clean MD files

## 5. Application Roles

| Role | Description |
|------|-------------|
| **Student** | Learns, builds projects, creates portfolio |
| **Tutor** | Answers questions, runs office hours |
| **Recruiter** | Discovers talent, attends demo days |
| **Admin** | Manages content and events |

Roles are enforced server-side using Supabase + RLS.

## 6. Student Portfolios & Directory

Students can:

- create profiles
- showcase projects
- control visibility:
  - `private`
  - `recruiters_only`
  - `public`

Recruiters:

- cannot cold-message students
- must request contact
- only see what students allow

## 7. Tutor Q&A System

- Structured Q&A (not chat)
- Questions linked to lessons, labs, or projects
- Tutors can mark accepted answers
- Builds a long-term knowledge base

## 8. Events & Demo Days

Supports:

- virtual demo days
- student project presentations
- recruiter attendance
- recordings and follow-ups

Demo day participation becomes portfolio evidence.

## 9. Supabase Setup

### 9.1 Create Project

1. Create a new Supabase project
2. Enable Email + OAuth auth providers
3. Enable Row Level Security (RLS)

### 9.2 Run Migrations

```bash
supabase db push
```

### 9.3 Environment Variables

Create `.env.local` in `apps/web`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 10. Local Development

```bash
pnpm install
pnpm dev
```

Visit:

- http://localhost:3000

## 11. Cursor Usage

Cursor is the primary development tool.

**Recommended workflow:**

- Use `docs/cursor-prompts.md`
- Build one feature end-to-end
- Validate RLS early
- Keep schemas small
- Refactor only after working

**Do not** let Cursor invent features or abstractions.

## 12. MVP Scope (Initial Release)

### Included:

-  Auth & roles
-  Markdown lessons
-  Student profiles & portfolios
-  Recruiter directory
-  Demo day pages
-  Tutor Q&A

### Deferred:

-  Automated skill scoring
-  Ranking algorithms
-  Agent telemetry
-  Enterprise features

## 13. Security & Privacy Notes

- All recruiter access is gated
- Consent events are logged
- GDPR delete flow anonymizes user data
- Audit logs are preserved

## 14. Contributing

- Keep PRs small
- Do not mix schema + UI changes without reason
- Update content via Markdown only
- Document decisions in PR descriptions

## 15. License & Status

- **Status:** Active development
- **License:** TBD
- **Contact:** multiagent-course@example.com

## 16. Vision

AgentForge Academy is not just a course platform.

It is:

- a training ground for agent engineers
- a signal layer for hiring
- a bridge between learning and production

**Build it carefully.**

