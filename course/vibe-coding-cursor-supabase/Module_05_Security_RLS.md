---
title: "Module 5: Security & Row Level Security (RLS)"
description: "Move security logic to the database with Postgres RLS policies"
module: "5"
order: 5
---

# Module 5: Security & Row Level Security (RLS)

**Duration:** Week 5  
**Learning Objectives:**
- Understand database-enforced security
- Write effective RLS policies
- Implement least-privilege access
- Test authorization in Supabase
- Move security logic from application to database

---

## 5.1 Database-Enforced Correctness

### The Security Problem

**Traditional Approach (Application-Level Security):**
```typescript
// Frontend code
async function getTasks() {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', currentUser.id) // Security in application code
  return data
}
```

**Problems:**
- ❌ Security logic scattered across codebase
- ❌ Easy to forget checks
- ❌ Bypassable if API called directly
- ❌ Hard to audit
- ❌ Different logic in different places

### Database-Enforced Security

**RLS Approach:**
```sql
-- Security in database
CREATE POLICY "Users can only see own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);
```

**Benefits:**
- ✅ Security at the database level
- ✅ Cannot be bypassed
- ✅ Single source of truth
- ✅ Easy to audit
- ✅ Consistent across all access methods

### Why RLS Matters

**Security Principle:**
> "Never trust the client. Enforce security at the database level."

Even if:
- Frontend code is correct
- API routes check permissions
- Middleware validates requests

**RLS ensures:**
- Direct database access is secure
- API bypasses are prevented
- All queries respect policies
- Security is consistent

---

## 5.2 Understanding RLS

### What is Row Level Security?

**Row Level Security (RLS)** is a PostgreSQL feature that:
- Restricts which rows users can access
- Applies to SELECT, INSERT, UPDATE, DELETE
- Evaluates policies for every query
- Works with Supabase Auth

### How RLS Works

```
User Query → RLS Policies → Filtered Results
```

**Example:**
```sql
-- User queries: SELECT * FROM tasks
-- RLS Policy: WHERE user_id = auth.uid()
-- Result: Only user's own tasks returned
```

### Enabling RLS

```sql
-- Enable RLS on a table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Disable RLS (not recommended)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

**Important:** Once RLS is enabled, **all access is denied by default**. You must create policies to allow access.

---

## 5.3 Least-Privilege Policies

### Policy Structure

```sql
CREATE POLICY policy_name
  ON table_name
  FOR operation
  USING (condition)  -- For SELECT, UPDATE, DELETE
  WITH CHECK (condition);  -- For INSERT, UPDATE
```

### Policy Operations

- **SELECT:** Read rows
- **INSERT:** Create rows
- **UPDATE:** Modify rows
- **DELETE:** Remove rows
- **ALL:** All operations

### Basic Policy Patterns

#### Pattern 1: Users Own Their Data

```sql
-- Users can only see their own tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create tasks for themselves
CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own tasks
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

#### Pattern 2: Public Read, Authenticated Write

```sql
-- Anyone can read
CREATE POLICY "Public read access"
  ON posts FOR SELECT
  USING (true);

-- Only authenticated users can write
CREATE POLICY "Authenticated users can insert"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners can update/delete
CREATE POLICY "Owners can modify"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```

#### Pattern 3: Team/Organization Access

```sql
-- Users can see tasks in their organization
CREATE POLICY "Users can view org tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_id = auth.uid()
      AND organization_id = tasks.organization_id
    )
  );
```

#### Pattern 4: Role-Based Access

```sql
-- Admins can do everything
CREATE POLICY "Admins have full access"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Regular users have limited access
CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### USING vs WITH CHECK

**USING:** Filters existing rows
- Used for SELECT, UPDATE, DELETE
- Determines which rows are visible/modifiable

**WITH CHECK:** Validates new/updated rows
- Used for INSERT, UPDATE
- Validates data being inserted/updated

**Example:**
```sql
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)  -- Can only update own tasks
  WITH CHECK (auth.uid() = user_id);  -- Must remain own task
```

### Complex Policies

#### Policy with Multiple Conditions

```sql
CREATE POLICY "Users can view published or own posts"
  ON posts FOR SELECT
  USING (
    is_published = true
    OR auth.uid() = user_id
  );
```

#### Policy with Joins

```sql
CREATE POLICY "Users can view team projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id
      AND user_id = auth.uid()
    )
  );
```

#### Policy with Functions

```sql
-- Create helper function
CREATE OR REPLACE FUNCTION is_user_in_org(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = org_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Use in policy
CREATE POLICY "Users can view org data"
  ON tasks FOR SELECT
  USING (is_user_in_org(organization_id));
```

---

## 5.4 Common RLS Patterns

### Pattern 1: User-Owned Resources

**Schema:**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ...
);
```

**Policies:**
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see only their tasks
CREATE POLICY "Users select own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only create tasks for themselves
CREATE POLICY "Users insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their tasks
CREATE POLICY "Users update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their tasks
CREATE POLICY "Users delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

### Pattern 2: Public Content with Ownership

**Schema:**
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  ...
);
```

**Policies:**
```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT: Anyone can see published posts, authors see all
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  USING (
    is_published = true
    OR auth.uid() = user_id
  );

-- INSERT: Authenticated users can create
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only authors can update
CREATE POLICY "Authors can update posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Only authors can delete
CREATE POLICY "Authors can delete posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```

### Pattern 3: Team/Organization Resources

**Schema:**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  ...
);

CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT,
  PRIMARY KEY (project_id, user_id)
);
```

**Policies:**
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see projects they're members of
CREATE POLICY "Members can view projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id
      AND user_id = auth.uid()
    )
  );

-- INSERT: Only org admins can create
CREATE POLICY "Org admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = projects.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

### Pattern 4: Soft Deletes

**Schema:**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  ...
);
```

**Policies:**
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see only non-deleted tasks
CREATE POLICY "Users see active tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
  );
```

---

## 5.5 Testing Authorization

### Testing in Supabase Studio

#### Step 1: Create Test Users

1. Go to Supabase Studio → Authentication → Users
2. Create test users with different roles
3. Note their user IDs

#### Step 2: Test as Different Users

1. Open SQL Editor
2. Set role context:

```sql
-- Test as user 1
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-1-uuid';

-- Query tasks
SELECT * FROM tasks;

-- Should only see user 1's tasks
```

#### Step 3: Verify Policies

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List all policies
SELECT * FROM pg_policies 
WHERE tablename = 'tasks';
```

### Testing in Application

#### Test Helper Function

```typescript
// lib/test-auth.ts
import { createClient } from '@supabase/supabase-js'

export async function testAsUser(userId: string) {
  // Create client with user's access token
  const { data: { session } } = await supabase.auth.getSession()
  
  const testClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      }
    }
  )
  
  return testClient
}
```

#### Test Cases

```typescript
// tests/auth.test.ts
describe('RLS Policies', () => {
  it('users can only see own tasks', async () => {
    const user1Client = await testAsUser('user-1-id')
    const user2Client = await testAsUser('user-2-id')
    
    // User 1's tasks
    const { data: user1Tasks } = await user1Client
      .from('tasks')
      .select('*')
    
    // User 2's tasks
    const { data: user2Tasks } = await user2Client
      .from('tasks')
      .select('*')
    
    // Verify isolation
    expect(user1Tasks).not.toContainEqual(
      expect.objectContaining({ user_id: 'user-2-id' })
    )
  })
})
```

### Common Testing Scenarios

1. **User Isolation:** Users can't see each other's data
2. **Ownership:** Users can only modify their own data
3. **Public Access:** Unauthenticated users see public content
4. **Role-Based:** Admins have elevated permissions
5. **Team Access:** Team members see team data

---

## 5.6 Migration Strategy

### Adding RLS to Existing Tables

**Step 1: Audit Current Access**

```sql
-- Check current access patterns
-- Review application code
-- Identify all queries
```

**Step 2: Create Policies Gradually**

```sql
-- Start with SELECT (read-only)
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Test thoroughly
-- Then add INSERT
CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Continue with UPDATE, DELETE
```

**Step 3: Enable RLS**

```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Test in production-like environment
-- Monitor for issues
```

**Step 4: Monitor and Refine**

- Watch for access denied errors
- Refine policies as needed
- Document any exceptions

### Migration Example

```sql
-- Migration: add_rls_to_tasks.sql

-- Step 1: Create policies (RLS not enabled yet)
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Step 2: Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Step 3: Verify
-- Test queries in SQL Editor
-- Test in application
```

---

## 5.7 Key Takeaways

**Database-Enforced Security:**
- Move security logic to database
- RLS cannot be bypassed
- Single source of truth
- Consistent across all access methods

**RLS Policies:**
- Enable RLS: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Create policies for each operation
- Use `USING` for filtering, `WITH CHECK` for validation
- Default: deny all access (must create policies)

**Common Patterns:**
- User-owned resources
- Public content with ownership
- Team/organization access
- Role-based access
- Soft deletes

**Testing:**
- Test in Supabase Studio
- Test as different users
- Verify policies work correctly
- Monitor for access denied errors

---

## Lab 5: Implement RLS Policies

**Objective:** Add RLS policies to secure your database

**Requirements:**
1. Choose a table from your schema
2. Design RLS policies (SELECT, INSERT, UPDATE, DELETE)
3. Create migration with policies
4. Enable RLS
5. Test policies in Supabase Studio
6. Test in application
7. Document policies

**Deliverables:**
- Migration file with RLS policies
- Test cases
- Documentation of policies
- Test results

**Evaluation Criteria:**
- Policy design (30%)
- Correctness (25%)
- Testing (20%)
- Documentation (15%)
- Code quality (10%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- PostgreSQL RLS Documentation
- Supabase RLS Guide
- Security Best Practices
- Policy Design Patterns

**Videos:**
- "Introduction to RLS" (20 min)
- "RLS Policy Patterns" (25 min)
- "Testing RLS Policies" (15 min)

**Tools to Explore:**
- Supabase Studio (SQL Editor)
- pgAdmin (PostgreSQL GUI)
- PostgREST (API layer)

**Next Module Preview:**
Module 6 will teach you logic, intelligence, and side effects using Edge Functions and event-driven architecture.

---

**Module 5 Complete** ✓  
**Next:** Module 6 - Logic, Intelligence, & Side Effects
