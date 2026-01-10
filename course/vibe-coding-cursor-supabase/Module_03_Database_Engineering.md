---
title: "Module 3: Database Engineering & Schema-First Thinking"
description: "Set up local Supabase, manage migrations, and integrate with MCP for AI database introspection"
module: "3"
order: 3
---

# Module 3: Database Engineering & Schema-First Thinking

**Duration:** Week 3  
**Learning Objectives:**
- Set up local Supabase development environment
- Understand schema-first development approach
- Create and manage database migrations
- Integrate MCP for AI database introspection
- Design effective database schemas

---

## 3.1 Local-First Development

### Why Local-First?

**Local-First Development** means running Supabase on your machine using Docker, rather than connecting to a cloud instance during development.

**Benefits:**
- ✅ **Fast:** No network latency
- ✅ **Free:** No cloud costs during development
- ✅ **Isolated:** Won't affect production data
- ✅ **Offline:** Works without internet
- ✅ **Version Control:** Database state in migrations

### Setting Up Local Supabase

#### Prerequisites

1. **Docker Desktop** installed and running
2. **Supabase CLI** installed

#### Installation Steps

**1. Install Supabase CLI:**

```bash
# macOS
brew install supabase/tap/supabase

# npm (cross-platform)
npm install -g supabase

# Verify installation
supabase --version
```

**2. Initialize Supabase in Your Project:**

```bash
cd your-project
supabase init
```

This creates:
```
supabase/
  config.toml          # Supabase configuration
  migrations/          # SQL migration files
  seed.sql            # Seed data (optional)
```

**3. Start Local Supabase:**

```bash
supabase start
```

This command:
- Downloads Docker images (first time only)
- Starts PostgreSQL, PostgREST, GoTrue, Storage, etc.
- Creates local database
- Prints connection details

**Output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**4. Access Supabase Studio:**

Open http://localhost:54323 in your browser to access:
- Table Editor
- SQL Editor
- Authentication
- Storage
- API Documentation

#### Stopping Local Supabase

```bash
supabase stop
```

#### Resetting Local Database

```bash
supabase db reset
```

This:
- Stops Supabase
- Drops all data
- Re-runs all migrations
- Re-seeds if seed.sql exists

### Local Development Workflow

```
1. Start Supabase: supabase start
   ↓
2. Create Migration: supabase migration new [name]
   ↓
3. Write SQL: Edit migration file
   ↓
4. Apply Migration: supabase db reset (or auto-applied)
   ↓
5. Test in Studio: http://localhost:54323
   ↓
6. Commit Migration: git add supabase/migrations/
```

### Connecting Your App to Local Supabase

**Environment Variables (.env.local):**

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Client Setup:**

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 3.2 Migrations as Code

### What are Migrations?

**Migrations** are SQL files that define changes to your database schema. They:
- Version control your database
- Enable reproducible setups
- Allow rollbacks
- Document schema evolution

### Migration Philosophy

**❌ Bad: Manual Changes**
- Making changes in Supabase Studio
- No version control
- Can't reproduce
- Hard to rollback

**✅ Good: Migration Files**
- All changes in SQL files
- Version controlled
- Reproducible
- Easy to rollback

### Creating Migrations

#### Method 1: Manual Creation

```bash
supabase migration new create_users_table
```

Creates: `supabase/migrations/20240101000000_create_users_table.sql`

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Method 2: Generate from Diff

```bash
# Make changes in Studio (for exploration)
# Then generate migration from diff
supabase db diff -f create_users_table
```

#### Method 3: Using Cursor Agent

```
Prompt: "Create a migration for a tasks table with:
- id (UUID, primary key)
- title (text, required)
- description (text, optional)
- status (enum: todo, in-progress, done)
- user_id (UUID, foreign key to auth.users)
- created_at, updated_at timestamps
- RLS enabled
- Index on user_id"
```

### Migration Best Practices

#### 1. One Logical Change Per Migration

**❌ Bad:**
```sql
-- Too many changes
CREATE TABLE users (...);
CREATE TABLE posts (...);
CREATE TABLE comments (...);
ALTER TABLE users ADD COLUMN avatar_url TEXT;
```

**✅ Good:**
```sql
-- Migration 1: create_users_table.sql
CREATE TABLE users (...);

-- Migration 2: create_posts_table.sql
CREATE TABLE posts (...);

-- Migration 3: create_comments_table.sql
CREATE TABLE comments (...);

-- Migration 4: add_avatar_to_users.sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
```

#### 2. Make Migrations Reversible

```sql
-- Up migration
CREATE TABLE tasks (...);

-- Down migration (for rollback)
DROP TABLE IF EXISTS tasks;
```

#### 3. Use Transactions

```sql
BEGIN;

CREATE TABLE users (...);
CREATE INDEX idx_users_email ON users(email);

COMMIT;
```

#### 4. Test Migrations

```bash
# Test locally
supabase db reset

# Verify in Studio
# Check tables, columns, indexes
```

#### 5. Name Migrations Clearly

**Good Names:**
- `create_users_table`
- `add_email_to_users`
- `create_tasks_table_with_rls`
- `add_index_on_user_id`

**Bad Names:**
- `migration1`
- `update`
- `fix`
- `changes`

### Migration Workflow

```
1. Create Migration: supabase migration new [descriptive_name]
   ↓
2. Write SQL: Edit the migration file
   ↓
3. Test Locally: supabase db reset
   ↓
4. Verify: Check in Studio
   ↓
5. Commit: git add supabase/migrations/
   ↓
6. Deploy: supabase db push (to cloud)
```

### Common Migration Patterns

#### Pattern 1: Create Table with RLS

```sql
-- Create table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policy (users can only see their own posts)
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

#### Pattern 2: Add Column

```sql
ALTER TABLE users 
ADD COLUMN avatar_url TEXT;
```

#### Pattern 3: Create Enum Type

```sql
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status task_status DEFAULT 'todo',
  ...
);
```

#### Pattern 4: Add Foreign Key

```sql
ALTER TABLE posts
ADD CONSTRAINT fk_posts_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

---

## 3.3 MCP Integration

### What is MCP?

**Model Context Protocol (MCP)** is a standard that allows AI assistants to:
- Introspect your database schema
- Understand data relationships
- Generate accurate queries
- Provide context-aware suggestions

### Why Use MCP?

Without MCP:
- ❌ AI doesn't know your schema
- ❌ Generates incorrect queries
- ❌ Suggests non-existent columns
- ❌ Can't understand relationships

With MCP:
- ✅ AI knows your exact schema
- ✅ Generates correct queries
- ✅ Suggests real columns and tables
- ✅ Understands relationships

### Setting Up MCP with Supabase

#### Step 1: Install MCP Server

```bash
npm install -g @modelcontextprotocol/server-supabase
```

#### Step 2: Configure MCP in Cursor

Create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

#### Step 3: Restart Cursor

Restart Cursor to load MCP configuration.

### Using MCP in Cursor Agent

Once configured, Cursor Agent can:

**1. Understand Your Schema:**
```
You: "Create a query to get all tasks for the current user"
Agent: [Knows your tasks table structure, user_id column, RLS policies]
```

**2. Generate Accurate Queries:**
```typescript
// Agent knows your schema, so it generates:
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**3. Suggest Schema Changes:**
```
You: "I need to track task priority"
Agent: "I see your tasks table. Should I add a priority column? 
        What values should it have? (low, medium, high?)"
```

**4. Understand Relationships:**
```
You: "Get all posts with their author information"
Agent: [Knows posts.user_id → auth.users relationship]
// Generates join query automatically
```

### MCP Features

#### Schema Introspection

Agent can see:
- All tables and columns
- Data types and constraints
- Foreign key relationships
- Indexes
- RLS policies
- Functions and triggers

#### Query Generation

Agent generates queries that:
- Use correct column names
- Respect RLS policies
- Use proper joins
- Include necessary filters
- Follow your patterns

#### Migration Suggestions

Agent can suggest migrations:
```
You: "I need to add a comments feature"
Agent: "I'll create a comments table with:
        - id, content, post_id (FK), user_id (FK)
        - RLS policies for user access
        - Indexes for performance
        Should I create the migration?"
```

### MCP Best Practices

1. **Keep Schema in Sync:** MCP reads from your local database
2. **Use Descriptive Names:** Helps AI understand relationships
3. **Document with Comments:** Add SQL comments for clarity
4. **Test Queries:** Verify AI-generated queries work correctly

---

## 3.4 Schema-First Thinking

### What is Schema-First?

**Schema-First Thinking** means:
1. Design your database schema first
2. Build migrations before writing application code
3. Let the schema drive your application structure
4. Use the database as the source of truth

### Schema-First Workflow

```
1. Design Schema (tables, relationships, constraints)
   ↓
2. Create Migrations
   ↓
3. Apply Migrations (local)
   ↓
4. Generate TypeScript Types
   ↓
5. Build Application Code
```

### Designing Effective Schemas

#### Step 1: Identify Entities

What are the main "things" in your app?

Example: Task Management App
- Users
- Tasks
- Projects
- Comments

#### Step 2: Define Relationships

- Users have many Tasks (one-to-many)
- Tasks belong to one Project (many-to-one)
- Tasks have many Comments (one-to-many)

#### Step 3: Design Tables

```sql
-- Users (handled by auth.users, but we might extend)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Step 4: Add Constraints and Indexes

```sql
-- Status constraint
ALTER TABLE tasks 
ADD CONSTRAINT check_status 
CHECK (status IN ('todo', 'in_progress', 'done'));

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_comments_task_id ON comments(task_id);
```

#### Step 5: Enable RLS

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies (covered in Module 5)
```

### Schema Design Principles

#### 1. Normalization

Avoid data duplication:
- ✅ Store user_id, not user name/email in every table
- ✅ Create separate tables for related data
- ✅ Use foreign keys for relationships

#### 2. Naming Conventions

- Tables: plural, snake_case (`user_profiles`, `task_comments`)
- Columns: snake_case (`user_id`, `created_at`)
- Indexes: descriptive (`idx_tasks_user_id`)
- Constraints: descriptive (`check_status`)

#### 3. Timestamps

Always include:
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()` (with trigger)

#### 4. UUIDs vs Auto-Increment

Use UUIDs for:
- ✅ Distributed systems
- ✅ Security (harder to guess)
- ✅ Client-side generation

Use auto-increment for:
- ✅ Simple apps
- ✅ Performance-critical (slightly faster)

#### 5. Soft Deletes

Consider soft deletes for important data:

```sql
ALTER TABLE tasks 
ADD COLUMN deleted_at TIMESTAMPTZ;

-- Filter deleted items
SELECT * FROM tasks 
WHERE deleted_at IS NULL;
```

### Generating TypeScript Types

After creating migrations, generate types:

```bash
supabase gen types typescript --local > lib/types/database.ts
```

Use in your code:

```typescript
import { Database } from '@/lib/types/database'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']
```

---

## 3.5 Key Takeaways

**Local-First Development:**
- Run Supabase locally with Docker
- Fast, free, isolated development
- Use `supabase start` to begin
- Access Studio at localhost:54323

**Migrations as Code:**
- All schema changes in SQL files
- Version controlled and reproducible
- One logical change per migration
- Test locally before deploying

**MCP Integration:**
- Enables AI to understand your schema
- Generates accurate queries
- Suggests schema improvements
- Configure in `.cursor/mcp.json`

**Schema-First Thinking:**
- Design database before application code
- Let schema drive application structure
- Use database as source of truth
- Generate TypeScript types from schema

---

## Lab 3: Design and Implement a Database Schema

**Objective:** Design and implement a complete database schema using migrations

**Requirements:**
1. Choose an application domain (e.g., blog, e-commerce, social network)
2. Design the schema (tables, relationships, constraints)
3. Create migration files for all tables
4. Set up local Supabase and apply migrations
5. Configure MCP integration
6. Generate TypeScript types
7. Test schema in Studio

**Deliverables:**
- Schema design document
- Migration files
- MCP configuration
- Generated TypeScript types
- Screenshots of Studio showing tables

**Evaluation Criteria:**
- Schema design quality (30%)
- Migration structure (25%)
- MCP integration (20%)
- Type generation (15%)
- Documentation (10%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- Supabase Local Development Guide
- PostgreSQL Best Practices
- Database Design Fundamentals
- MCP Documentation

**Videos:**
- "Setting Up Local Supabase" (15 min)
- "Database Migrations Best Practices" (20 min)
- "MCP Integration Tutorial" (25 min)

**Tools to Explore:**
- Supabase CLI
- Supabase Studio
- pgAdmin (PostgreSQL GUI)
- Database Design Tools

**Next Module Preview:**
Module 4 will teach you authentication and identity primitives, including passwordless OTP, custom auth flows, and anonymous sign-ins.

---

**Module 3 Complete** ✓  
**Next:** Module 4 - Authentication & Identity Primitives
