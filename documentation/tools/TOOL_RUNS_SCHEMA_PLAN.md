# Tool Runs Schema Plan

This document outlines the planned database schema for tracking tool runs (tool executions that produce portfolio artifacts).

## Table: `tool_runs`

**Purpose**: Track when students use tools, what inputs they provided, and what outputs were generated. This enables:
- Portfolio artifact generation from tool outputs
- Analytics on tool usage
- Tool improvement based on usage patterns
- Student progress tracking

### Schema Plan

```sql
create table if not exists public.tool_runs (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles(id) on delete cascade,
  tool_id text not null, -- References tool registry id (e.g., 'gtm-system-designer')
  inputs jsonb, -- Tool-specific input parameters
  outputs jsonb, -- Tool-generated outputs (can be used for portfolio artifacts)
  created_at timestamptz not null default now(),
  
  -- Indexes for common queries
  constraint tool_runs_student_profile_id_fkey foreign key (student_profile_id) 
    references public.student_profiles(id) on delete cascade
);

-- Indexes
create index if not exists idx_tool_runs_student_profile_id 
  on public.tool_runs(student_profile_id);
create index if not exists idx_tool_runs_tool_id 
  on public.tool_runs(tool_id);
create index if not exists idx_tool_runs_created_at 
  on public.tool_runs(created_at desc);

-- RLS Policies (to be added when implementing)
-- Students can only see their own tool runs
alter table public.tool_runs enable row level security;

create policy "Students can view their own tool runs"
  on public.tool_runs
  for select
  using (
    student_profile_id in (
      select id from public.student_profiles 
      where profile_id in (
        select id from public.profiles 
        where user_id = auth.uid()
      )
    )
  );

create policy "Students can insert their own tool runs"
  on public.tool_runs
  for insert
  with check (
    student_profile_id in (
      select id from public.student_profiles 
      where profile_id in (
        select id from public.profiles 
        where user_id = auth.uid()
      )
    )
  );
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `student_profile_id` | UUID (FK) | References `student_profiles.id` |
| `tool_id` | TEXT | Tool identifier from registry (e.g., 'gtm-system-designer') |
| `inputs` | JSONB | Tool-specific input parameters (flexible schema per tool) |
| `outputs` | JSONB | Tool-generated outputs (can include artifacts, results, etc.) |
| `created_at` | TIMESTAMPTZ | When the tool run was executed |

### Example Data

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "student_profile_id": "123e4567-e89b-12d3-a456-426614174000",
  "tool_id": "gtm-system-designer",
  "inputs": {
    "targetAudience": "B2B SaaS companies",
    "budget": 50000,
    "timeline": "6 months"
  },
  "outputs": {
    "systemMap": "...",
    "recommendations": [...],
    "artifacts": [
      {
        "type": "diagram",
        "url": "...",
        "title": "GTM System Architecture"
      }
    ]
  },
  "created_at": "2025-01-20T10:00:00Z"
}
```

### Usage Notes

- **Inputs**: Tool-specific, flexible JSONB structure allows each tool to define its own input schema
- **Outputs**: Can include generated artifacts, results, or references to stored files
- **Portfolio Integration**: Tool outputs can be automatically converted to portfolio projects
- **Analytics**: Tool runs can be aggregated to show tool usage statistics

### Migration Status

**Status**: Planned (not yet implemented)

This schema will be implemented in a future migration when tool functionality is built out.
