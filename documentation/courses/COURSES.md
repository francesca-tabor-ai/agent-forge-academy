# Course Directory Structure

This document lists all available courses and their directory slugs.

## Course Directories

| Course Name | Directory Slug | URL Path |
|------------|----------------|----------|
| Multi agent systems | `multi-agent-systems` | `/student/courses/multi-agent-systems` |
| AI-Native Software Delivery Pipelines | `ai-native-software-delivery-pipelines` | `/student/courses/ai-native-software-delivery-pipelines` |
| Spec Driven Development | `spec-driven-development` | `/student/courses/spec-driven-development` |
| Vibe coding with Cursor and Supabase | `vibe-coding-cursor-supabase` | `/student/courses/vibe-coding-cursor-supabase` |
| Prompt Engineering | `prompt-engineering` | `/student/courses/prompt-engineering` |
| Agentic RAG | `agentic-rag` | `/student/courses/agentic-rag` |
| Agentic Commerce | `agentic-commerce` | `/student/courses/agentic-commerce` |
| Amazon Rufus Optimisation | `amazon-rufus-optimisation` | `/student/courses/amazon-rufus-optimisation` |
| Reddit AI Visibility | `reddit-ai-visibility` | `/student/courses/reddit-ai-visibility` |
| SEO to AEO | `seo-to-aeo` | `/student/courses/seo-to-aeo` |
| AI-driven video and synthetic media | `ai-driven-video-synthetic-media` | `/student/courses/ai-driven-video-synthetic-media` |
| AI Recommender Systems | `ai-recommender-systems` | `/student/courses/ai-recommender-systems` |
| Conversational Commerce Intelligence Systems | `conversational-commerce-intelligence` | `/student/courses/conversational-commerce-intelligence` |
| 3D for E-Commerce | `3d-for-ecommerce` | `/student/courses/3d-for-ecommerce` |
| AI Governance and the EU AI Act | `ai-governance-eu-ai-act` | `/student/courses/ai-governance-eu-ai-act` |
| Hyper Personalised Marketing & Advertising | `hyper-personalised-marketing-advertising` | `/student/courses/hyper-personalised-marketing-advertising` |
| AI-Content Pipelines | `ai-content-pipelines` | `/student/courses/ai-content-pipelines` |

## Next Steps

1. **Add lesson files** to each course directory (`.md` files)
2. **Create course records** in the database with matching `slug` values
3. **Set `is_published = true`** when ready to make courses visible

## Example: Adding a Course Record

```sql
INSERT INTO courses (slug, title, description, is_published)
VALUES (
  'multi-agent-systems',
  'Multi Agent Systems',
  'Complete course on multi-agent systems',
  true
);
```

See `documentation/MULTI_COURSE_GUIDE.md` for detailed instructions.
