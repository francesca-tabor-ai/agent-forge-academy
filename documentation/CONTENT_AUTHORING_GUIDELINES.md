# Content Authoring Guidelines

This document outlines the rules and best practices for authoring lesson content in the Agent Forge Academy.

> **📋 Quick Link:** See [QA Checklist](QA_CHECKLIST.md) for a step-by-step verification checklist before publishing.

## Core Principle

> **"Code blocks are for code, not examples. If it's meant to be read, it must render."**

## Code Block Rules

### ✅ Use Code Blocks For

- **Executable code** (TypeScript, JavaScript, Python, SQL, Bash, etc.)
- **Structured machine-readable data** (JSON, YAML, XML)
- **CLI commands** that users will copy and run
- **Short inline snippets** referenced by surrounding text

### ❌ Do NOT Use Code Blocks For

- **Documentation examples** - These should render as markdown
- **Spec templates** - Use Template callouts instead
- **Planning outlines** - Render as regular markdown
- **Checklists** - Use markdown lists
- **Markdown examples meant to be *read*** - Only use ```markdown when teaching Markdown syntax itself
- **Conceptual models or prose** - Render as content
- **Workflow diagrams** - Use arrows and text, not code blocks
- **Conversational examples** - Render as regular text

## Template Pattern

When you need to show a reusable structure (template), use this pattern:

### Option A: Template Callout (Preferred)

Add a label before the content:

```markdown
> **Template: Integration Plan**

## Integrations

### Email Service
- Purpose
- Retry strategy
```

Then render the template as normal Markdown.

### Option B: Collapsible "Copy Template" UI

- Render content normally
- Add a "Copy template" button that copies the Markdown source
- Do NOT rely on code fencing for copyability

## Language-Specific Fencing

When a code block *is* valid (contains real executable code):

- **Always include the correct language:**
  - ```ts
  - ```json
  - ```bash
  - ```python
  - ```sql
  - etc.

- **Never use ```markdown** unless you are explicitly teaching Markdown syntax itself

If the lesson is **not about Markdown**, ` ```markdown ` should never appear.

## Content Guard

We have an automated content guard that enforces these rules:

```bash
npm run lint:content
```

**Rule enforced:** A code block may not contain Markdown headings (`#`, `##`, `###`)

This catches 90% of these issues early.

## Examples

### ❌ Incorrect

````markdown
```markdown
## Integrations
### Email Service
- Purpose
- Retry strategy
```
````

### ✅ Correct

```markdown
> **Template: Integration Plan**

## Integrations

### Email Service
- Purpose
- Retry strategy
```

### ❌ Incorrect

````markdown
```
Marketing → Defines Requirements
Analytics → Implements Tracking
```
````

### ✅ Correct

```markdown
Marketing → Defines Requirements
Analytics → Implements Tracking
```

### ❌ Incorrect

````markdown
```
AI Revenue: $2.5M/year
Total Revenue: $50M/year
```
````

### ✅ Correct

```markdown
AI Revenue: $2.5M/year
Total Revenue: $50M/year
```

### ✅ Correct (Real Code)

````markdown
```python
def calculate_revenue(ai_revenue, total_revenue):
    return ai_revenue / total_revenue * 100
```
````

## QA Checklist Before Publishing a Lesson

**Use this checklist before publishing any lesson to ensure content quality:**

### Code Block Verification

- [ ] **No prose appears in monospaced blocks**
  - Check: All code blocks contain only executable code or structured data
  - Fix: Remove code fences from prose, examples, and conceptual content

- [ ] **Headings are always rendered, never fenced**
  - Check: No code blocks contain Markdown headings (`#`, `##`, `###`)
  - Fix: Remove code fences and render headings as normal markdown

- [ ] **Lists render as lists, not code**
  - Check: Bullet points and numbered lists are not in code blocks
  - Fix: Use markdown list syntax (`-` or `1.`) outside of code blocks

- [ ] **Only executable or machine-readable content is fenced**
  - Check: Every code block contains real code (TypeScript, Python, SQL, etc.) or structured data (JSON, YAML)
  - Fix: Unfence any content that doesn't meet this criteria

### Content Guard Verification

- [ ] **Run automated content guard:**
  ```bash
  npm run lint:content
  ```
  - Must pass with exit code 0 (no violations)
  - Fix any reported violations before publishing

### Visual Review

- [ ] **Conceptual content renders as readable Markdown**
  - Preview the lesson and verify all prose, examples, and templates render correctly
  - No content should appear in monospaced code blocks unless it's actual code

- [ ] **Code blocks contain only real code**
  - Verify all fenced blocks have appropriate language tags
  - Verify all fenced blocks contain executable code or structured data

- [ ] **No ` ```markdown ` blocks exist unless explicitly teaching Markdown syntax**
  - Check: If lesson is not about Markdown, no ```markdown blocks should exist
  - Fix: Remove ```markdown fences and render as normal markdown

- [ ] **Lessons are visually scannable and readable**
  - Headings are properly formatted and visible
  - Lists are properly formatted
  - Code examples are clearly distinguished from content
  - Templates are clearly labeled

## Quick Checklist

Before publishing content, ask:

1. [ ] Does this code block contain executable code?
2. [ ] If it contains headings (`#`, `##`), should it be rendered as markdown instead?
3. [ ] If it's a template, did I add a Template callout?
4. [ ] If it's real code, does it have the correct language tag?
5. [ ] Did I run `npm run lint:content` to check for violations?

## Enforcement

- **Pre-commit:** Run `npm run lint:content` before committing
- **CI/CD:** Content guard runs automatically in build pipeline
- **Manual review:** Always run content guard before publishing

## Questions?

If you're unsure whether something should be a code block:

1. **Ask:** "Is this executable code or structured data?"
2. **If no:** Render as markdown
3. **If yes:** Use code block with appropriate language tag

Remember: **If it's meant to be read, it must render.**

## Definition of Done

A lesson is ready to publish when:

- ✅ **Conceptual content renders as readable Markdown**
  - All prose, examples, and templates are rendered as normal markdown
  - No conceptual content appears in code blocks

- ✅ **Code blocks contain only real code**
  - All fenced blocks contain executable code (TypeScript, Python, SQL, etc.) or structured data (JSON, YAML)
  - All code blocks have appropriate language tags

- ✅ **No ` ```markdown ` blocks exist unless explicitly teaching Markdown syntax**
  - If the lesson is not about Markdown, no ```markdown blocks should exist
  - Templates use Template callouts instead

- ✅ **Lessons are visually scannable and readable**
  - Headings are properly formatted and visible
  - Lists render as lists, not code
  - Code examples are clearly distinguished from content
  - Content flows naturally and is easy to read
