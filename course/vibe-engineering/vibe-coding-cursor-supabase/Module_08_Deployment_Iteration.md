---
title: "Module 8: Deployment & the Iteration Loop"
description: "Deploy to Supabase Cloud and master rapid iteration with AI-powered debugging"
module: "8"
order: 8
email_takeaway: "Rapid iteration means deploying small changes frequently—each deployment is a learning opportunity, not a risk."
email_action: "Deploy your project to Supabase Cloud—push your local database schema and test it in production."
---

# Module 8: Deployment & the Iteration Loop

**Duration:** Week 8  
**Learning Objectives:**
- **local repository Integration**: Link local repository to Supabase Cloud
- **Push Migrations**: Push migrations safely to production
- **the AI-powered debug loop Understanding**: Master the AI-powered debug loop
- **Rapidly Iterate**: Rapidly iterate on features
- **to abandon bad ideas earlier Understanding**: Learn to abandon bad ideas earlier

---

## 8.1 Cloud Synchronisation

### Linking Local to Cloud

#### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Note your project URL and API keys

#### Step 2: Link Local Repository

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Or with project ID
supabase link --project-id your-project-id
```

This creates `.supabase/config.toml` with your project reference.

#### Step 3: Verify Connection

```bash
# Check linked project
supabase projects list

# Test connection
supabase db remote commit
```

### Migration Workflow

#### Local Development

```
1. Create migration: supabase migration new [name]
   ↓
2. Write SQL: Edit migration file
   ↓
3. Test locally: supabase db reset
   ↓
4. Verify in Studio: http://localhost:54323
   ↓
5. Commit to git: git add supabase/migrations/
```

#### Deploying to Cloud

```
1. Review migrations: Check what will be applied
   ↓
2. Push migrations: supabase db push
   ↓
3. Verify in Cloud Studio
   ↓
4. Test in production environment
   ↓
5. Monitor for issues
```

### Safe Migration Practices

#### 1. Review Before Pushing

```bash
# See what migrations will be applied
supabase db diff

# Review migration files
cat supabase/migrations/[timestamp]_[name].sql
```

#### 2. Test in Staging First

```bash
# Link to staging project
supabase link --project-ref staging-project-ref

# Push to staging
supabase db push

# Test thoroughly
# Then push to production
```

#### 3. Backup Before Major Changes

```bash
# Create backup (via Supabase Dashboard)
# Or use pg_dump
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

#### 4. Rollback Plan

Keep migrations reversible:

```sql
-- Up migration
CREATE TABLE tasks (...);

-- Down migration (for rollback)
DROP TABLE IF EXISTS tasks;
```

### Pushing Migrations

#### Method 1: Push All Migrations

```bash
# Push all pending migrations
supabase db push
```

#### Method 2: Push Specific Migration

```bash
# Not directly supported, but you can:
# 1. Temporarily remove other migrations
# 2. Push
# 3. Restore other migrations
```

#### Method 3: Manual Application

```bash
# Get SQL from migration
cat supabase/migrations/[file].sql

# Copy and paste into Supabase SQL Editor
# Execute manually
```

### Edge Functions Deployment

```bash
# Deploy single function
supabase functions deploy function-name

# Deploy all functions
supabase functions deploy

# Deploy with environment variables
supabase functions deploy function-name --no-verify-jwt
```

### Environment Variables

**Set in Supabase Dashboard:**
- Project Settings → Edge Functions → Secrets
- Add: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, etc.

**Or via CLI:**
```bash
# Set secret
supabase secrets set OPENAI_API_KEY=sk-...

# List secrets
supabase secrets list
```

---

## 8.2 The Debug Loop

### Traditional Debugging

**Old Approach:**
1. Encounter error
2. Search Google/Stack Overflow
3. Try random solutions
4. Hope it works
5. Repeat

**Problems:**
-  Time-consuming
-  Hit-or-miss
-  No learning
-  Frustrating

### AI-Powered Debug Loop

**New Approach:**
1. Encounter error
2. Copy exact error message
3. Paste into Cursor with context
4. Get targeted solution
5. Apply and verify
6. Learn from solution

**Benefits:**
-  Fast resolution
-  Targeted solutions
-  Learning opportunity
-  Less frustration

### Effective Debug Prompts

#### Good Debug Prompts 

**With Full Context:**
```
I'm getting this error when trying to create a task:

Error: new row violates row-level security policy for table "tasks"

Here's my code:
[code snippet]

And here's my RLS policy:
[policy SQL]

What's wrong?
```

**With Error Stack:**
```
Error: Failed to fetch
  at fetch (app/api/tasks/route.ts:15:23)
  at createTask (components/TaskForm.tsx:42:5)

Here's the API route:
[code]

And the component:
[code]

What's causing this?
```

**With Migration Error:**
```
Migration failed:

ERROR: relation "users" does not exist
  at migration: 20240101000000_create_tasks.sql:5

Migration file:
[SQL]

What's the issue?
```

#### Bad Debug Prompts 

**Too Vague:**
```
It's not working
```

**No Context:**
```
Error in my code
```

**Missing Error:**
```
Help me fix this
[code without error message]
```

### Debug Loop Workflow

```
1. Encounter Error
   ↓
2. Copy Exact Error Message
   ↓
3. Gather Context:
   - Relevant code
   - Database schema
   - Migration files
   - Environment
   ↓
4. Paste into Cursor with Context
   ↓
5. Review AI Solution
   ↓
6. Apply Fix
   ↓
7. Test
   ↓
8. If Still Broken → Repeat with New Error
```

### Common Debug Scenarios

#### Scenario 1: Migration Error

**Error:**
```
ERROR: column "user_id" does not exist
```

**Debug Prompt:**
```
Migration error:

ERROR: column "user_id" does not exist
  at: CREATE POLICY "users_select_own_tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);

Migration file:
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL
  -- Missing user_id column!
);

CREATE POLICY "users_select_own_tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

The policy references user_id but the table doesn't have it. Fix the migration.
```

**AI Solution:**
```sql
-- Add user_id column first
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Then create policy
CREATE POLICY "users_select_own_tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);
```

#### Scenario 2: RLS Policy Issue

**Error:**
```
new row violates row-level security policy
```

**Debug Prompt:**
```
RLS policy violation:

Error: new row violates row-level security policy for table "tasks"

Insert code:
await supabase.from('tasks').insert({
  title: 'New task',
  user_id: currentUser.id
})

RLS Policy:
CREATE POLICY "users_insert_own_tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

Current user: authenticated
auth.uid(): [user-id]
Inserting user_id: [user-id]

Why is this failing?
```

**AI Solution:**
The issue might be:
1. `auth.uid()` is NULL (not authenticated)
2. `user_id` doesn't match `auth.uid()`
3. Policy syntax issue

Check authentication and verify `auth.uid()` matches inserted `user_id`.

#### Scenario 3: Query Mismatch

**Error:**
```
Column "email" does not exist
```

**Debug Prompt:**
```
Query error:

Error: Column "email" does not exist
  at: SELECT id, email, name FROM users

Actual table schema:
CREATE TABLE users (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT
  -- No email column!
);

My query:
SELECT id, email, name FROM users

Fix the query to match the schema.
```

**AI Solution:**
```typescript
// Use actual columns
const { data } = await supabase
  .from('users')
  .select('id, full_name, phone')
```

### Learning from Debugging

**After fixing an error:**
1. **Understand why it failed** - Read AI's explanation
2. **Note the pattern** - Similar errors in future?
3. **Update your code** - Prevent similar issues
4. **Document the fix** - For team/yourself

---

## 8.3 Rapid Iteration

### The Iteration Advantage

**Traditional Development:**
- Plan extensively
- Build completely
- Test at end
- Deploy when "perfect"
- **Slow feedback loop**

**AI-Native Development:**
- Start with working version
- Iterate rapidly
- Test continuously
- Deploy early
- **Fast feedback loop**

### Rapid Iteration Workflow

```
1. Start with Minimal Working Version
   ↓
2. Deploy to Staging
   ↓
3. Get User Feedback
   ↓
4. Identify Improvements
   ↓
5. Implement Changes (with AI)
   ↓
6. Deploy Again
   ↓
7. Repeat
```

### Example: Feature Iteration

**Iteration 1: Basic Task List**
```typescript
// Minimal working version
function TaskList() {
  const [tasks] = useState([])
  return <div>{tasks.map(t => <div>{t.title}</div>)}</div>
}
```

**Iteration 2: Add Styling**
```
Prompt: "Style this task list with Tailwind, add cards, spacing, and hover effects"
```

**Iteration 3: Add Interactions**
```
Prompt: "Add ability to mark tasks as complete, delete tasks, and add new tasks"
```

**Iteration 4: Add Real-time**
```
Prompt: "Make this realtime so changes appear instantly without refresh"
```

**Iteration 5: Add Filtering**
```
Prompt: "Add filter buttons for 'all', 'active', 'completed' tasks"
```

**Each iteration:**
-  Small, focused change
-  Tested immediately
-  Deployed quickly
-  User feedback incorporated

### Abandoning Bad Ideas Earlier

**Key Principle:**
> "Fail fast, learn fast, iterate fast"

**Traditional Approach:**
- Spend weeks on feature
- Realize it's not working
- Too invested to abandon
- Waste more time

**AI-Native Approach:**
- Build MVP in hours
- Test with users
- If it doesn't work → abandon
- Try different approach
- **Low cost of experimentation**

### When to Abandon

**Abandon if:**
-  Users don't understand it
-  No one uses it
-  Too complex for value
-  Better alternative exists
-  Doesn't solve real problem

**Don't abandon if:**
-  Needs refinement (iterate instead)
-  Early negative feedback (might improve)
-  Technical challenges (solvable)
-  Learning opportunity

### Experimentation Mindset

**Treat features as experiments:**
1. **Hypothesis:** "Users want X feature"
2. **Build MVP:** Minimal version
3. **Test:** Deploy and observe
4. **Learn:** What worked? What didn't?
5. **Decide:** Iterate or abandon?

**Cost of experiment:**
- Traditional: Days/weeks
- AI-Native: Hours
- **10x cheaper to experiment**

---

## 8.4 Deployment Best Practices

### Pre-Deployment Checklist

- [ ] All migrations tested locally
- [ ] Edge Functions tested
- [ ] Environment variables set
- [ ] RLS policies verified
- [ ] Error handling in place
- [ ] Monitoring set up
- [ ] Backup created

### Staging Environment

**Always test in staging first:**
1. Create staging Supabase project
2. Push migrations to staging
3. Deploy Edge Functions to staging
4. Test complete flow
5. Then deploy to production

### Monitoring

**Set up monitoring:**
- Error tracking (Sentry, etc.)
- Performance monitoring
- Database query monitoring
- Edge Function logs
- User analytics

### Rollback Plan

**Have a rollback plan:**
1. Database migrations: Keep down migrations
2. Edge Functions: Keep previous versions
3. Frontend: Use feature flags
4. Environment: Can revert quickly

---

## 8.5 Key Takeaways

**Cloud Synchronisation:**
- Link local to cloud: `supabase link`
- Push migrations: `supabase db push`
- Deploy Edge Functions: `supabase functions deploy`
- Test in staging first

**The Debug Loop:**
- Copy exact error messages
- Provide full context
- Paste into Cursor
- Learn from solutions
- Fast resolution

**Rapid Iteration:**
- Start with MVP
- Deploy early
- Get feedback
- Iterate quickly
- Abandon bad ideas early

**Deployment:**
- Test in staging
- Monitor production
- Have rollback plan
- Learn from each deployment

---

## Lab 8: Deploy and Iterate

**Objective:** Deploy your application and practice rapid iteration

**Requirements:**
1. Link local repository to Supabase Cloud
2. Push migrations to cloud
3. Deploy Edge Functions
4. Set up monitoring
5. Deploy frontend
6. Create iteration plan for a feature
7. Implement 3 iterations
8. Document learnings

**Deliverables:**
- Deployed application
- Migration deployment log
- Iteration documentation
- Monitoring setup
- Reflection on iteration process

**Evaluation Criteria:**
- Successful deployment (25%)
- Migration management (20%)
- Iteration process (25%)
- Monitoring setup (15%)
- Documentation (15%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- Supabase Deployment Guide
- Migration Best Practices
- Rapid Iteration Principles
- Debugging with AI

**Videos:**
- "Deploying to Supabase Cloud" (20 min)
- "Mastering the Debug Loop" (25 min)
- "Rapid Iteration Strategies" (30 min)

**Tools to Explore:**
- Supabase CLI
- Supabase Dashboard
- Error Tracking (Sentry)
- Monitoring Tools

---

## Course Completion

**Congratulations!** You've completed the AI-Native App Delivery with Cursor & Supabase course.

**You've learned:**
-  Intent-Driven Development methodology
-  Cursor Agent Mode mastery
-  Database-first development
-  Secure authentication
-  Row Level Security
-  Edge Functions and events
-  Vector search and RAG
-  Deployment and iteration

**Next Steps:**
- **your own AI-native application Development**: Build your own AI-native application
- **Share Your**: Apply share your projects in relevant contexts
- **Continue Learning**: Continue learning and iterating
- **Help Others**: Apply help others learn in relevant contexts

**Remember:**
> "The best code is code you don't have to write. The best features are ones that solve real problems. The best applications are built through rapid iteration."

**Happy Building! **

---

**Module 8 Complete**   
**Course Complete** 
