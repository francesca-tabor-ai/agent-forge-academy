# Content Authoring Guidelines

This document outlines the rules and best practices for authoring lesson content in the Agent Forge Academy.

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
