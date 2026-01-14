# Scripts

This directory contains utility scripts for the Agent Forge Academy project.

## Content Guard Linter

### `lint-content-guard.ts`

A content guard that detects code blocks containing Markdown headings.

**Rule:** A code block may not contain Markdown headings (`#`, `##`, `###`)

This catches cases where content that should be rendered as markdown is incorrectly placed in code blocks.

### Usage

```bash
# Run content guard
npm run lint:content

# Run both ESLint and content guard
npm run lint:all
```

### What it checks

- Scans all `.md` files in the `course/` directory
- Detects code blocks (``` blocks) that contain Markdown headings
- Reports violations with:
  - File path
  - Line number
  - The heading found
  - Code block preview

### Exit codes

- `0` - No violations found
- `1` - Violations found (fails content review)

### Integration

The content guard can be integrated into:

1. **Pre-commit hooks** - Prevent committing content with violations
2. **CI/CD pipeline** - Fail builds if violations are detected
3. **Manual review** - Run before content publication

### Example output

```
❌ Found 2 violation(s):

📄 course/example/Module_01.md:
   Line 45: Contains heading "## Integrations"
   Code block preview: ## Integrations...

💡 Fix: Remove code fences (```) from content that contains Markdown headings.
   These should render as normal markdown, not as code blocks.
```
