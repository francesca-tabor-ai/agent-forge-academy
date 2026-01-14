# QA Checklist: Before Publishing a Lesson

**Use this checklist before publishing any lesson to ensure content quality and proper rendering.**

## Automated Checks

### 1. Run Content Guard

```bash
npm run lint:content
```

**Requirement:** Must pass with exit code 0 (no violations)

**What it checks:**
- Code blocks containing Markdown headings (`#`, `##`, `###`)
- Reports file, line number, and heading found

**If violations found:**
- Review each violation
- Remove code fences from content that should render as markdown
- Re-run until all violations are resolved

---

## Manual Verification Checklist

### Code Block Verification

#### ✅ No prose appears in monospaced blocks

- [ ] **Check:** All code blocks contain only executable code or structured data
- [ ] **Verify:** No prose, examples, or conceptual content in code blocks
- [ ] **Fix:** Remove code fences from any prose content

**Examples to check:**
- Workflow diagrams (should use arrows: `→`)
- Metric examples (should render as text)
- Conversational examples (should render as text)
- Planning outlines (should render as markdown)

#### ✅ Headings are always rendered, never fenced

- [ ] **Check:** No code blocks contain Markdown headings (`#`, `##`, `###`)
- [ ] **Verify:** All headings appear as normal markdown, not in code blocks
- [ ] **Fix:** Remove code fences from any content containing headings

**What to look for:**
- Template structures with headings
- Documentation examples with headings
- Section outlines with headings

#### ✅ Lists render as lists, not code

- [ ] **Check:** Bullet points and numbered lists are not in code blocks
- [ ] **Verify:** Lists use markdown syntax (`-` or `1.`) outside of code blocks
- [ ] **Fix:** Remove code fences from any lists

**What to look for:**
- Checklists in code blocks
- Feature lists in code blocks
- Step-by-step instructions in code blocks

#### ✅ Only executable or machine-readable content is fenced

- [ ] **Check:** Every code block contains real code or structured data
- [ ] **Verify:** All fenced blocks have appropriate language tags
- [ ] **Fix:** Unfence any content that doesn't meet this criteria

**Valid code block content:**
- TypeScript/JavaScript code
- Python code
- SQL queries
- Bash/Shell commands
- JSON data
- YAML configuration
- XML data

**Invalid code block content:**
- Documentation examples
- Templates (use Template callouts instead)
- Prose and explanations
- Workflow diagrams
- Metric examples

---

### Content Guard Verification

- [ ] **Run automated content guard:**
  ```bash
  npm run lint:content
  ```
- [ ] **Verify:** Exit code is 0 (no violations)
- [ ] **Fix:** Any reported violations before publishing

---

### Visual Review

#### ✅ Conceptual content renders as readable Markdown

- [ ] **Preview the lesson** and verify all prose, examples, and templates render correctly
- [ ] **Check:** No content appears in monospaced code blocks unless it's actual code
- [ ] **Verify:** All conceptual content is readable and properly formatted

#### ✅ Code blocks contain only real code

- [ ] **Verify:** All fenced blocks have appropriate language tags (ts, json, bash, python, etc.)
- [ ] **Verify:** All fenced blocks contain executable code or structured data
- [ ] **Check:** No prose or examples in code blocks

#### ✅ No ` ```markdown ` blocks exist unless explicitly teaching Markdown syntax

- [ ] **Check:** If lesson is not about Markdown, no ```markdown blocks should exist
- [ ] **Verify:** Templates use Template callouts instead of ```markdown
- [ ] **Fix:** Remove ```markdown fences and render as normal markdown

#### ✅ Lessons are visually scannable and readable

- [ ] **Headings:** Properly formatted and visible
- [ ] **Lists:** Properly formatted as markdown lists
- [ ] **Code examples:** Clearly distinguished from content
- [ ] **Templates:** Clearly labeled with Template callouts
- [ ] **Content flow:** Natural and easy to read

---

## Definition of Done

A lesson is ready to publish when **all** of the following are true:

### ✅ Conceptual content renders as readable Markdown
- All prose, examples, and templates are rendered as normal markdown
- No conceptual content appears in code blocks
- Content is visually scannable and easy to read

### ✅ Code blocks contain only real code
- All fenced blocks contain executable code (TypeScript, Python, SQL, etc.) or structured data (JSON, YAML)
- All code blocks have appropriate language tags
- No prose or examples in code blocks

### ✅ No ` ```markdown ` blocks exist unless explicitly teaching Markdown syntax
- If the lesson is not about Markdown, no ```markdown blocks should exist
- Templates use Template callouts instead
- Only use ```markdown when teaching Markdown syntax itself

### ✅ Lessons are visually scannable and readable
- Headings are properly formatted and visible
- Lists render as lists, not code
- Code examples are clearly distinguished from content
- Content flows naturally and is easy to read

---

## Quick Reference

### When to Use Code Blocks

✅ **Use code blocks for:**
- Executable code (TypeScript, JavaScript, Python, SQL, Bash, etc.)
- Structured machine-readable data (JSON, YAML, XML)
- CLI commands that users will copy and run

❌ **Don't use code blocks for:**
- Documentation examples
- Templates (use Template callouts)
- Planning outlines
- Checklists
- Conceptual models or prose
- Workflow diagrams
- Conversational examples

### Template Pattern

Use Template callouts for reusable structures:

```markdown
> **Template: Integration Plan**

## Integrations
### Email Service
- Purpose
- Retry strategy
```

---

## Questions?

If you're unsure whether something should be a code block:

1. **Ask:** "Is this executable code or structured data?"
2. **If no:** Render as markdown
3. **If yes:** Use code block with appropriate language tag

**Remember:** "Code blocks are for code, not examples. If it's meant to be read, it must render."
