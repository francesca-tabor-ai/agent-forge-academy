# Multi-Course System Guide

This guide explains how to add and manage multiple courses in AgentForge Academy.

## Overview

The multi-course system supports:
- **Multiple courses** organized in separate directories
- **Course metadata** stored in Supabase (title, description, enrollment, progress)
- **Backward compatibility** with existing flat lesson structure
- **Course-based routing** for better organization

## Directory Structure

### Recommended Structure

Organize courses in subdirectories under the `course/` directory:

```
course/
 multi-agent-deployment/          # Course 1
    Module_01_Foundations.md
    Module_02_Frameworks.md
    ...
 ai-fundamentals/                 # Course 2
    Introduction.md
    Neural_Networks.md
    ...
 [old lessons].md                 # Backward compatible (root level)
```

### Course Slug

The directory name becomes the **course slug** (e.g., `multi-agent-deployment`). This slug is used in:
- URLs: `/student/courses/multi-agent-deployment`
- Database: `courses.slug` field
- File system: directory name

## Database Setup

### 1. Run Migration

The migration creates two tables:
- `courses` - Course metadata
- `course_enrollments` - Student enrollment and progress tracking

```bash
supabase db push
```

### 2. Create Course Records

Add course records in Supabase (via dashboard or SQL):

```sql
INSERT INTO courses (slug, title, description, duration_weeks, difficulty_level, is_published)
VALUES (
  'multi-agent-deployment',
  'Multi-Agent Deployment',
  'Complete course on deploying multi-agent AI systems at scale',
  12,
  'intermediate',
  true
);
```

**Required fields:**
- `slug` - Must match directory name
- `title` - Display name
- `is_published` - Set to `true` to make course visible

**Optional fields:**
- `description` - Course description
- `thumbnail_url` - Course thumbnail image
- `duration_weeks` - Estimated duration
- `difficulty_level` - 'beginner', 'intermediate', or 'advanced'

## Adding a New Course

### Step 1: Create Directory

Create a new directory under `course/` with a URL-friendly slug:

```bash
mkdir course/my-new-course
```

### Step 2: Add Lesson Files

Add markdown lesson files to the directory:

```markdown
---
title: "Introduction to My Course"
module: "Module 1"
week: 1
order: 1
description: "Get started with the course"
---

# Lesson Content

Your lesson content here...
```

### Step 3: Create Course Record

Add the course to the database (see Database Setup above).

### Step 4: Verify

1. Visit `/student/courses` - Course should appear
2. Click course - Should show lessons
3. Click lesson - Should display content

## Lesson Frontmatter

Lessons can include course context in frontmatter:

```markdown
---
title: "Lesson Title"
module: "Module 1"
week: 1
order: 1
description: "Lesson description"
course: "multi-agent-deployment"  # Optional, auto-detected from directory
---
```

## Routing

### Course Pages

- **Browse courses:** `/student/courses`
- **Course detail:** `/student/courses/[courseSlug]`
- **Course lesson:** `/student/courses/[courseSlug]/lessons/[slug]`

### Legacy Pages (Backward Compatible)

- **All lessons:** `/student/lessons`
- **Filtered lessons:** `/student/lessons?course=[courseSlug]`
- **Legacy lesson:** `/student/lessons/[slug]`

## Enrollment System

### Automatic Enrollment

Students can enroll in published courses via the course detail page.

### Enrollment Tracking

The system tracks:
- Enrollment date
- Progress percentage (0-100)
- Completion status

### Progress Updates

Progress can be updated via:
- API: `POST /api/courses/enroll` (creates enrollment)
- Database: Update `course_enrollments.progress_percentage`

## API Reference

### Enroll in Course

```typescript
POST /api/courses/enroll?course_id=[uuid]
```

Creates an enrollment for the authenticated student.

## Code Reference

### Loading Lessons

```typescript
import { loadAllLessons, loadLessonBySlug, getAllCourseSlugs } from '@/lib/lessons';

// Get all course slugs
const courseSlugs = getAllCourseSlugs();

// Load all lessons (optionally filtered by course)
const allLessons = loadAllLessons();
const courseLessons = loadAllLessons(undefined, 'multi-agent-deployment');

// Load specific lesson
const lesson = loadLessonBySlug('module-01', undefined, 'multi-agent-deployment');
```

### Querying Courses

```typescript
const { data: courses } = await supabase
  .from('courses')
  .select('*')
  .eq('is_published', true);

// Get student enrollments
const { data: enrollments } = await supabase
  .from('course_enrollments')
  .select('*, courses(*)')
  .eq('student_profile_id', studentProfileId);
```

## Migration from Single Course

If you have existing lessons in the root `course/` directory:

1. **Option A: Keep as-is** - They'll continue to work (backward compatible)
2. **Option B: Move to course directory** - Create a course directory and move files

```bash
# Create course directory
mkdir course/multi-agent-deployment

# Move existing files
mv course/Module_*.md course/multi-agent-deployment/

# Create course record in database
```

## Best Practices

1. **Use descriptive slugs** - `multi-agent-deployment` not `course1`
2. **Keep slugs consistent** - Match directory name to database `slug`
3. **Organize by course** - Don't mix courses in same directory
4. **Use frontmatter** - Include `order`, `module`, `week` for sorting
5. **Publish carefully** - Only set `is_published=true` when ready

## Questions System

Questions can reference lessons by `context_id`. The system supports:
- Course-based lessons: `context_id = "course-slug/lesson-slug"`
- Legacy lessons: `context_id = "lesson-slug"`

The questions system automatically handles both formats.

## Troubleshooting

### Course not appearing

1. Check directory exists: `course/[course-slug]/`
2. Check database record exists with matching `slug`
3. Verify `is_published = true`
4. Check for markdown files in directory

### Lessons not loading

1. Verify file has `.md` extension
2. Check file is in correct course directory
3. Verify frontmatter is valid YAML

### Enrollment not working

1. Check student profile exists
2. Verify course is published
3. Check RLS policies allow enrollment

## Future Enhancements

Potential additions:
- Course prerequisites
- Course completion certificates
- Course ratings/reviews
- Course categories/tags
- Bulk enrollment
- Course progress analytics
