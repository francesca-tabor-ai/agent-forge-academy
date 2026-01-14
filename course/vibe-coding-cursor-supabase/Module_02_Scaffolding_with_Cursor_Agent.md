---
title: "Module 2: Scaffolding with Cursor Agent"
description: "Master Cursor Agent Mode to execute build plans and generate modular components"
module: "2"
order: 2
email_takeaway: "Build plans act as blueprints for AI agents—describe architecture and structure, not implementation details."
email_action: "Open Cursor, press Cmd+I, and ask it to scaffold a simple React component—watch it generate the full structure."
---

# Module 2: Scaffolding with Cursor Agent

**Duration:** Week 2  
**Learning Objectives:**
- Create effective build plans using high-level LLMs
- Master Cursor Agent Mode (Cmd+I) for code generation
- Establish guardrails with .cursorrules
- Generate modular, maintainable components
- Remove boilerplate efficiently

---

## 2.1 The Build Plan

### What is a Build Plan?

A **Build Plan** is a Markdown document that acts as a blueprint for the AI agent. It describes:
- What you want to build
- The architecture and structure
- Technologies and patterns to use
- Step-by-step implementation approach

### Why Use Build Plans?

1. **Clarity:** Forces you to think through the architecture
2. **Consistency:** AI follows the plan, not random instructions
3. **Completeness:** Ensures nothing is missed
4. **Reusability:** Can reference the plan multiple times
5. **Documentation:** Serves as project documentation

### Creating Effective Build Plans

#### Step 1: Use High-Level LLMs

Use powerful LLMs (like Claude, GPT-4) to generate comprehensive build plans:

**Prompt Template:**
```
I want to build [FEATURE/DESCRIPTION]. 

Context:
- Tech stack: [Next.js, TypeScript, Tailwind, Supabase]
- Design system: [Your design system]
- Patterns: [Component patterns you use]

Please create a detailed build plan that includes:
1. Architecture overview
2. Component structure
3. Data flow
4. Implementation steps
5. File structure
```

#### Step 2: Structure Your Build Plan

A good build plan includes:

# Build Plan: [Feature Name]

## Overview
Brief description of what we're building

## Architecture
- High-level structure
- Component hierarchy
- Data flow

## Components
- List of components needed
- Props and interfaces
- State management

## Implementation Steps
1. Step 1: [Description]
2. Step 2: [Description]
3. ...

## File Structure
src/
  components/
    FeatureName/
      ComponentA.tsx
      ComponentB.tsx
  lib/
    featureName.ts
```

## Patterns & Conventions
- Code style
- Naming conventions
- Error handling
```

### Example: Build Plan for User Dashboard

```markdown
# Build Plan: User Dashboard

## Overview
A dashboard that displays user profile, recent activity, and statistics.

## Architecture
- Main Dashboard component (container)
- ProfileCard component (user info)
- ActivityList component (recent actions)
- StatsCard component (reusable stat display)

## Components

### Dashboard (Container)
- Props: userId
- State: user, activities, stats
- Fetches data on mount

### ProfileCard
- Props: user (User type)
- Displays: avatar, name, email, join date

### ActivityList
- Props: activities (Activity[])
- Displays: list of recent activities with timestamps

### StatsCard
- Props: label, value, icon
- Reusable for different statistics

## Implementation Steps
1. Create types/interfaces for User, Activity, Stats
2. Build ProfileCard component with mock data
3. Build ActivityList component with mock data
4. Build StatsCard component
5. Create Dashboard container that uses all components
6. Add data fetching logic
7. Add loading and error states
8. Style with Tailwind

## File Structure
```
app/
  dashboard/
    page.tsx
components/
  dashboard/
    ProfileCard.tsx
    ActivityList.tsx
    StatsCard.tsx
lib/
  types/
    dashboard.ts
  api/
    dashboard.ts
```

## Patterns & Conventions
- Use TypeScript interfaces for all props
- Use async/await for data fetching
- Implement loading skeletons
- Handle errors gracefully
- Use Tailwind utility classes
```

### Using Build Plans with Cursor

1. **Create the plan** (using Claude/GPT-4)
2. **Save as markdown** in your project
3. **Reference in Cursor Agent Mode:**
   ```
   @build-plan.md Follow this build plan to implement the user dashboard
   ```
4. **Let Agent execute** the plan step by step
5. **Review and refine** as needed

---

## 2.2 Agent Execution

### Cursor Agent Mode (Cmd+I / Ctrl+I)

Cursor Agent Mode is a powerful feature that allows the AI to:
- Read your entire codebase context
- Generate code based on instructions
- Make multiple file changes
- Follow patterns from existing code

### Activating Agent Mode

1. **Keyboard Shortcut:** `Cmd+I` (Mac) or `Ctrl+I` (Windows/Linux)
2. **Command Palette:** "Cursor: Start Agent Session"
3. **Context Menu:** Right-click → "Ask Cursor Agent"

### Effective Agent Prompts

#### Good Prompts 

**Specific and Clear:**
```
Create a UserProfile component that:
- Takes userId as prop
- Fetches user data from /api/users/[userId]
- Displays name, email, avatar
- Shows loading state while fetching
- Handles errors gracefully
- Uses our existing Button and Card components
- Follows the patterns in components/user/UserCard.tsx
```

**With Context:**
```
@components/user/UserCard.tsx @lib/api/users.ts
Create a similar component for displaying user profiles in a modal.
Use the same styling patterns but adapt for modal layout.
```

**With Build Plan:**
```
@build-plan.md
Follow this build plan to implement the dashboard feature.
Start with Step 1 and work through each step.
```

#### Bad Prompts 

**Too Vague:**
```
Make a user component
```

**No Context:**
```
Build a dashboard
```

**Too Complex:**
```
Build a complete e-commerce platform with payment, inventory, 
shipping, reviews, recommendations, analytics, admin panel...
```

### Agent Execution Workflow

```
1. Write Clear Prompt
   ↓
2. Agent Analyzes Context
   ↓
3. Agent Generates Code
   ↓
4. Review Generated Code
   ↓
5. Accept or Refine
   ↓
6. Test Implementation
   ↓
7. Iterate if Needed
```

### Working with Agent Output

#### Accepting Changes
- Review the diff carefully
- Check for correctness
- Verify it follows your patterns
- Test the code

#### Refining Output
```
Agent: [Generates code]
You: "Add error handling for network failures"
Agent: [Adds error handling]
You: "Use our custom ErrorBoundary component instead"
Agent: [Updates to use ErrorBoundary]
```

#### Handling Issues
- **Wrong approach?** Explain what you want differently
- **Missing features?** Add them in follow-up prompts
- **Style issues?** Reference your style guide
- **Bugs?** Describe the issue and ask for fix

### Multi-File Changes

Agent Mode can make changes across multiple files:

```
Prompt: "Create a new feature with:
- API route: app/api/tasks/route.ts
- Component: components/tasks/TaskList.tsx
- Types: lib/types/tasks.ts
- Hook: lib/hooks/useTasks.ts"
```

Agent will create all files with proper imports and connections.

---

## 2.3 Establishing Guardrails

### What are Guardrails?

**Guardrails** are rules and constraints that ensure the AI generates code that:
- Follows your tech stack
- Matches your coding style
- Uses your patterns and conventions
- Maintains consistency across the codebase

### The .cursorrules File

The `.cursorrules` file is where you define your guardrails. Place it in your project root.

### Creating .cursorrules

#### Basic Structure

```markdown
# Tech Stack
- Framework: Next.js 14+ (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth

# Code Style
- Use functional components with TypeScript
- Prefer named exports over default exports
- Use async/await over promises
- Use const assertions for type inference
- Prefer interfaces over types for object shapes

# File Organization
- Components: components/[feature]/ComponentName.tsx
- API routes: app/api/[route]/route.ts
- Utilities: lib/[category]/utility.ts
- Types: lib/types/[feature].ts

# Naming Conventions
- Components: PascalCase (UserProfile)
- Functions: camelCase (fetchUserData)
- Files: PascalCase for components, camelCase for utilities
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)

# Patterns
- Use Server Components by default
- Use Client Components only when needed ('use client')
- Extract reusable logic to custom hooks
- Use Zod for runtime validation
- Handle errors with try/catch and proper error boundaries

# Dependencies
- Use these libraries: [list your preferred libraries]
- Avoid: [list libraries to avoid]

# Supabase Patterns
- Use Supabase client from @/lib/supabase/client
- Use RLS policies for security
- Use generated types from Supabase CLI
- Prefer database functions over client-side logic

# Component Patterns
- Keep components small and focused
- Extract props to interfaces
- Use composition over configuration
- Implement loading and error states
- Use Tailwind for styling (no CSS modules)
```

### Example: Complete .cursorrules

```markdown
# Project: AI-Native App with Cursor & Supabase

## Tech Stack
- Next.js 14+ (App Router)
- TypeScript 5+ (strict mode)
- Tailwind CSS 3+
- Supabase (PostgreSQL, Auth, Storage)
- React 18+

## Code Style
- Functional components only
- TypeScript strict mode
- Named exports preferred
- Async/await for async operations
- Const assertions where helpful

## File Structure
```
app/
  (routes)/
    page.tsx
  api/
    [route]/
      route.ts
components/
  [feature]/
    ComponentName.tsx
lib/
  supabase/
    client.ts
    server.ts
  types/
    [feature].ts
  utils/
    [utility].ts
```

## Naming
- Components: PascalCase
- Functions: camelCase
- Files: Match component/function name
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

## React Patterns
- Server Components by default
- 'use client' only when needed
- Custom hooks for reusable logic
- Error boundaries for error handling
- Loading states with Suspense

## Supabase Patterns
- Import from @/lib/supabase/client or /server
- Always use RLS policies
- Use generated types: Database['public']['Tables']
- Prefer database functions for complex queries
- Use realtime subscriptions for live data

## Styling
- Tailwind CSS only
- Use design tokens from tailwind.config.js
- Responsive: mobile-first approach
- Dark mode: use dark: prefix
- No inline styles

## Error Handling
- Try/catch for async operations
- Error boundaries for React errors
- User-friendly error messages
- Log errors to console in development
- Use toast notifications for user feedback

## Testing
- Write tests for critical paths
- Use Vitest for unit tests
- Test user interactions, not implementation

## Dependencies
Preferred:
- @supabase/supabase-js
- zod (validation)
- date-fns (dates)
- clsx (classnames)

Avoid:
- moment.js (use date-fns)
- lodash (use native JS)
- classnames (use clsx)
```

### Advanced Guardrails

#### Project-Specific Rules

```markdown
# Design System
- Use components from @/components/ui
- Follow spacing scale: 4, 8, 12, 16, 24, 32
- Use color palette from design tokens
- Typography: Use text-sm, text-base, text-lg scale

# API Patterns
- All API routes in app/api/
- Use NextRequest/NextResponse
- Return JSON with { data, error } structure
- Include proper status codes
- Validate input with Zod

# Database Patterns
- All tables have: id, created_at, updated_at
- Use UUIDs for primary keys
- Foreign keys reference auth.users(id)
- Use timestamptz for all timestamps
- Enable RLS on all tables
```

#### Team Conventions

```markdown
# Git Workflow
- Branch naming: feature/[name], fix/[name]
- Commit messages: Conventional Commits
- PR titles: [Type] Brief description

# Documentation
- JSDoc comments for public functions
- README.md for each major feature
- Update CHANGELOG.md for releases
```

### Testing Your Guardrails

After creating `.cursorrules`, test it:

```
Prompt: "Create a new user profile component"
```

Check if the generated code:
-  Uses your tech stack
-  Follows naming conventions
-  Matches file structure
-  Uses your patterns
-  Includes proper types

If not, refine your `.cursorrules` file.

---

## 2.4 Removing Boilerplate

### Common Boilerplate Patterns

Agent Mode excels at removing repetitive code:

#### Pattern 1: CRUD Operations

**Before (Manual):**
```typescript
// Create
async function createTask(data: TaskInput) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Read
async function getTask(id: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Update
async function updateTask(id: string, data: Partial<TaskInput>) {
  const { data: updated, error } = await supabase
    .from('tasks')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated;
}

// Delete
async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
```

**After (Agent-Generated):**
```
Prompt: "Create CRUD functions for tasks table following our patterns"
```

Agent generates all functions with:
- Proper error handling
- Type safety
- Consistent patterns
- Documentation

#### Pattern 2: Form Components

**Before:** Manually creating form with validation, error handling, loading states

**After:**
```
Prompt: "Create a task form component with:
- Fields: title, description, dueDate, priority
- Validation using Zod
- Error handling
- Loading states
- Uses our Button and Input components"
```

#### Pattern 3: API Routes

**Before:** Writing boilerplate for each route

**After:**
```
Prompt: "Create API route for tasks CRUD operations:
- GET /api/tasks (list all)
- GET /api/tasks/[id] (get one)
- POST /api/tasks (create)
- PATCH /api/tasks/[id] (update)
- DELETE /api/tasks/[id] (delete)
- Include authentication check
- Use our error handling pattern"
```

### Boilerplate Removal Workflow

1. **Identify Pattern:** Notice repetitive code
2. **Describe to Agent:** Explain what you need
3. **Generate Once:** Let Agent create the pattern
4. **Reuse Pattern:** Reference it for similar cases
5. **Refine:** Improve the pattern over time

---

## 2.5 Generating Modular Components

### Component Architecture

Good components are:
- **Focused:** Single responsibility
- **Reusable:** Work in multiple contexts
- **Composable:** Can be combined
- **Testable:** Easy to test in isolation

### Agent-Assisted Component Design

#### Step 1: Design the Interface

```
Prompt: "Design a Card component that:
- Accepts children, title, footer as props
- Has optional header actions
- Supports different variants (default, elevated, outlined)
- Is fully accessible
- Uses Tailwind for styling"
```

#### Step 2: Generate Base Component

Agent creates:
```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  headerActions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export function Card({ 
  children, 
  title, 
  footer, 
  headerActions,
  variant = 'default',
  className 
}: CardProps) {
  // Implementation
}
```

#### Step 3: Compose into Features

```
Prompt: "Create a UserCard component using our Card component.
It should display user avatar, name, email, and a view profile button."
```

### Component Composition Patterns

#### Pattern 1: Container/Presentational

```
Container Component (logic)
    ↓
Presentational Component (UI)
```

#### Pattern 2: Compound Components

```
<Card>
  <Card.Header>
  <Card.Body>
  <Card.Footer>
</Card>
```

#### Pattern 3: Render Props

```
<DataFetcher
  url="/api/users"
  render={(data, loading, error) => (
    <UserList users={data} />
  )}
/>
```

---

## 2.6 Key Takeaways

**Build Plans:**
- Create comprehensive blueprints using high-level LLMs
- Structure plans with architecture, components, steps
- Reference plans in Agent Mode for consistent execution

**Agent Execution:**
- Use Cmd+I to activate Agent Mode
- Write clear, specific prompts with context
- Review and refine agent output
- Leverage multi-file changes

**Guardrails (.cursorrules):**
- Define tech stack constraints
- Establish coding conventions
- Ensure consistency across codebase
- Test and refine rules

**Boilerplate Removal:**
- Identify repetitive patterns
- Let Agent generate once
- Reuse and refine patterns

**Modular Components:**
- Design focused, reusable components
- Use composition patterns
- Build features from components

---

## Lab 2: Build a Feature with Agent Mode

**Objective:** Use Cursor Agent Mode to build a complete feature

**Requirements:**
1. Create a build plan for a feature (e.g., notification system, settings page)
2. Set up .cursorrules file with your conventions
3. Use Agent Mode to implement the feature
4. Refine and iterate on the output
5. Document the process

**Deliverables:**
- Build plan document
- .cursorrules file
- Generated code
- Refinement notes
- Working feature

**Evaluation Criteria:**
- Quality of build plan (25%)
- Effectiveness of .cursorrules (25%)
- Agent execution quality (25%)
- Final implementation (25%)

**Time Estimate:** 3-4 hours

---

## Additional Resources

**Readings:**
- Cursor Documentation - Agent Mode guide
- "Writing Effective AI Prompts" - Best practices
- "Component Architecture Patterns" - Design guide

**Videos:**
- "Mastering Cursor Agent Mode" (30 min)
- "Creating Effective Build Plans" (20 min)
- "Establishing Code Guardrails" (15 min)

**Tools to Explore:**
- Cursor IDE (practice Agent Mode)
- Claude/GPT-4 (for build plans)
- TypeScript Handbook (for type patterns)

**Next Module Preview:**
Module 3 will teach you database engineering with Supabase, including local development, migrations, and MCP integration for AI database introspection.

---

**Module 2 Complete**   
**Next:** Module 3 - Database Engineering & Schema-First Thinking
