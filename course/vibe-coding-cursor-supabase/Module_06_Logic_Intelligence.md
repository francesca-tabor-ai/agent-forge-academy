---
title: "Module 6: Logic, Intelligence, & Side Effects"
description: "Build Edge Functions, event-driven architectures, and realtime-first UIs"
module: "6"
order: 6
email_takeaway: "Edge Functions run serverless code at the edge, reducing latency and enabling real-time features without managing infrastructure."
email_action: "Create a simple Supabase Edge Function—deploy a 'hello world' function and call it from your frontend."
---

# Module 6: Logic, Intelligence, & Side Effects

**Duration:** Week 6  
**Learning Objectives:**
- Build Supabase Edge Functions with Deno
- Implement event-driven architectures
- Create "Backend Primitives" for side effects
- Enable realtime-first user interfaces
- Integrate AI models (OpenAI) securely

---

## 6.1 Edge Functions

### What are Edge Functions?

**Supabase Edge Functions** are:
- Serverless Deno functions
- Deployed globally (edge network)
- Fast execution (< 100ms cold start)
- Secure (runs in isolated environment)
- TypeScript/JavaScript support

### Why Use Edge Functions?

**Use Edge Functions for:**
-  Business logic that shouldn't be in frontend
-  Secure API calls (API keys, secrets)
-  Webhook handlers
-  Background processing
-  Integration with external services

**Don't Use Edge Functions for:**
-  Simple database queries (use Supabase client)
-  Static content (use CDN)
-  Heavy computation (use dedicated services)

### Creating Your First Edge Function

#### Step 1: Initialize Edge Functions

```bash
# In your project root
supabase functions new hello-world
```

Creates: `supabase/functions/hello-world/index.ts`

#### Step 2: Write Function

```typescript
// supabase/functions/hello-world/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { name } = await req.json()

  return new Response(
    JSON.stringify({ 
      message: `Hello, ${name || 'World'}!`,
      timestamp: new Date().toISOString()
    }),
    { 
      headers: { 'Content-Type': 'application/json' } 
    }
  )
})
```

#### Step 3: Test Locally

```bash
# Start Supabase
supabase start

# Serve function locally
supabase functions serve hello-world

# Test
curl -X POST http://localhost:54321/functions/v1/hello-world \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'
```

#### Step 4: Deploy

```bash
# Deploy to Supabase Cloud
supabase functions deploy hello-world
```

### Edge Function Patterns

#### Pattern 1: API Proxy

```typescript
// supabase/functions/proxy-openai/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { prompt } = await req.json()

  // Secure API key (not exposed to client)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

#### Pattern 2: Webhook Handler

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  // Verify webhook signature
  // ... verification logic

  const event = JSON.parse(body)

  // Handle event
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Update database
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('stripe_payment_id', event.data.id)
      break
    // ... other event types
  }

  return new Response(JSON.stringify({ received: true }))
})
```

#### Pattern 3: Background Processing

```typescript
// supabase/functions/process-image/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { imageUrl, userId } = await req.json()

  // Process image (resize, optimize, etc.)
  const processedImage = await processImage(imageUrl)

  // Upload to Supabase Storage
  const supabase = createClient(...)
  await supabase.storage
    .from('processed-images')
    .upload(`${userId}/${Date.now()}.jpg`, processedImage)

  return new Response(JSON.stringify({ success: true }))
})
```

### Environment Variables

**Set in Supabase Dashboard:**
- Settings → Edge Functions → Secrets
- Add: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, etc.

**Access in Function:**
```typescript
const apiKey = Deno.env.get('OPENAI_API_KEY')
```

### CORS Configuration

```typescript
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  // Your function logic
  const data = await processRequest(req)

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
```

---

## 6.2 Event-Driven Architecture

### What is Event-Driven Architecture?

**Event-Driven Architecture** means:
- Components communicate via events
- Loose coupling between services
- Asynchronous processing
- Scalable and flexible

### Supabase Database Webhooks

Supabase can trigger webhooks (Edge Functions) on database events:

**Events:**
- `INSERT` - New row created
- `UPDATE` - Row modified
- `DELETE` - Row deleted

### Setting Up Database Webhooks

#### Step 1: Create Webhook Function

```typescript
// supabase/functions/handle-task-created/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const payload = await req.json()
  const { record, old_record, type } = payload

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  if (type === 'INSERT' && record.table === 'tasks') {
    // New task created
    const task = record

    // Send notification
    await sendNotification(task.user_id, `New task: ${task.title}`)

    // Update analytics
    await supabase
      .from('analytics')
      .insert({
        event: 'task_created',
        user_id: task.user_id,
        metadata: { task_id: task.id }
      })
  }

  return new Response(JSON.stringify({ success: true }))
})
```

#### Step 2: Configure Webhook in Supabase

1. Go to Database → Webhooks
2. Create new webhook
3. Set:
   - Table: `tasks`
   - Events: `INSERT`, `UPDATE`, `DELETE`
   - HTTP Request: `https://your-project.supabase.co/functions/v1/handle-task-created`
   - HTTP Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

### Backend Primitives Pattern

**Backend Primitives** are reusable Edge Functions that handle common side effects:

#### Example: Notification Primitive

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { userId, type, message, data } = await req.json()

  // Determine notification channel
  const channel = determineChannel(type)

  switch (channel) {
    case 'email':
      await sendEmail(userId, message, data)
      break
    case 'sms':
      await sendSMS(userId, message)
      break
    case 'push':
      await sendPushNotification(userId, message, data)
      break
  }

  // Store notification in database
  const supabase = createClient(...)
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      message,
      data,
      sent_at: new Date().toISOString()
    })

  return new Response(JSON.stringify({ success: true }))
})
```

#### Using Backend Primitives

```typescript
// In webhook handler
await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: task.user_id,
    type: 'task_created',
    message: `New task: ${task.title}`,
    data: { task_id: task.id }
  })
})
```

### Event-Driven Workflow

```
Database Event (INSERT/UPDATE/DELETE)
    ↓
Database Webhook Triggered
    ↓
Edge Function Executes
    ↓
Side Effects (Notifications, Analytics, etc.)
    ↓
Update Database (if needed)
```

### Example: Complete Event Flow

**Scenario:** User creates a task

1. **Frontend:** User creates task
   ```typescript
   await supabase.from('tasks').insert({ title: 'New task' })
   ```

2. **Database:** Task inserted, webhook triggered

3. **Edge Function:** `handle-task-created`
   ```typescript
   // Send notification
   await sendNotification(userId, 'Task created')
   
   // Update user stats
   await updateUserStats(userId, 'tasks_created')
   
   // Trigger AI analysis
   await analyzeTask(task)
   ```

4. **Side Effects:**
   - Email notification sent
   - Analytics updated
   - AI analysis completed
   - UI updates via realtime

---

## 6.3 Realtime-First UI

### What is Realtime-First?

**Realtime-First UI** means:
- UI updates automatically when data changes
- No manual refresh needed
- Instant feedback
- Collaborative experiences

### Enabling Postgres Replication

Supabase uses Postgres Replication to enable realtime:

**Enable Replication:**
```sql
-- In migration
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
```

**Or in Supabase Dashboard:**
- Database → Replication
- Enable replication for tables

### Using Realtime in Frontend

#### Basic Subscription

```typescript
// lib/realtime/tasks.ts
import { supabase } from '@/lib/supabase/client'

export function subscribeToTasks(callback: (task: Task) => void) {
  return supabase
    .channel('tasks')
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'tasks',
      },
      (payload) => {
        callback(payload.new as Task)
      }
    )
    .subscribe()
}
```

#### Using in Component

```typescript
// components/TaskList.tsx
'use client'

import { useEffect, useState } from 'react'
import { subscribeToTasks } from '@/lib/realtime/tasks'

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Initial load
    loadTasks()

    // Subscribe to changes
    const subscription = subscribeToTasks((task) => {
      setTasks(prev => {
        // Handle INSERT, UPDATE, DELETE
        if (subscription.event === 'INSERT') {
          return [...prev, task]
        } else if (subscription.event === 'UPDATE') {
          return prev.map(t => t.id === task.id ? task : t)
        } else if (subscription.event === 'DELETE') {
          return prev.filter(t => t.id !== task.id)
        }
        return prev
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
```

### Realtime Patterns

#### Pattern 1: Live Updates

```typescript
// Real-time task updates
const subscription = supabase
  .channel('tasks')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'tasks',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Update task in UI
    updateTaskInState(payload.new)
  })
  .subscribe()
```

#### Pattern 2: Collaborative Editing

```typescript
// Multiple users editing same document
const subscription = supabase
  .channel('document-edits')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'documents',
    filter: `id=eq.${documentId}`
  }, (payload) => {
    // Show other user's changes
    displayRemoteEdit(payload.new)
  })
  .subscribe()
```

#### Pattern 3: Presence (Who's Online)

```typescript
// Track user presence
const channel = supabase.channel('room:1')

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    // Update UI with online users
    setOnlineUsers(Object.keys(state))
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // User joined
    addUserToOnlineList(newPresences[0])
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    // User left
    removeUserFromOnlineList(leftPresences[0])
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        online_at: new Date().toISOString(),
        user: currentUser
      })
    }
  })
```

### Optimistic Updates

Combine realtime with optimistic updates:

```typescript
async function createTask(task: TaskInput) {
  // Optimistic update (immediate UI feedback)
  const optimisticTask = { ...task, id: 'temp-' + Date.now() }
  setTasks(prev => [...prev, optimisticTask])

  try {
    // Create in database
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error

    // Realtime will update with real data
    // Remove optimistic task
    setTasks(prev => prev.filter(t => t.id !== optimisticTask.id))
  } catch (error) {
    // Rollback optimistic update
    setTasks(prev => prev.filter(t => t.id !== optimisticTask.id))
    showError(error)
  }
}
```

---

## 6.4 Integrating AI Models

### Secure AI Integration

**Problem:** API keys shouldn't be exposed to frontend

**Solution:** Use Edge Functions as proxy

#### Example: OpenAI Integration

```typescript
// supabase/functions/chat-completion/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Verify authentication
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: authHeader } }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    )
  }

  const { messages, model = 'gpt-4' } = await req.json()

  // Call OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      user: user.id, // For usage tracking
    }),
  })

  const data = await response.json()

  // Log usage
  await supabase
    .from('ai_usage')
    .insert({
      user_id: user.id,
      model,
      tokens_used: data.usage?.total_tokens,
      cost: calculateCost(data.usage),
    })

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

#### Frontend Usage

```typescript
// lib/ai/chat.ts
export async function chatCompletion(messages: Message[]) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/chat-completion`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, model: 'gpt-4' }),
    }
  )

  return response.json()
}
```

---

## 6.5 Key Takeaways

**Edge Functions:**
- Serverless Deno functions
- Secure API key storage
- Webhook handlers
- Background processing
- Deploy with `supabase functions deploy`

**Event-Driven Architecture:**
- Database webhooks trigger Edge Functions
- Backend Primitives for reusable side effects
- Loose coupling, scalable
- Asynchronous processing

**Realtime-First UI:**
- Enable Postgres Replication
- Subscribe to database changes
- UI updates automatically
- Combine with optimistic updates

**AI Integration:**
- Use Edge Functions as secure proxy
- Never expose API keys to frontend
- Track usage and costs
- Authenticate requests

---

## Lab 6: Build Event-Driven Feature

**Objective:** Create an event-driven feature with Edge Functions and realtime UI

**Requirements:**
1. Create database table with replication enabled
2. Create Edge Function for webhook handler
3. Configure database webhook
4. Build realtime UI component
5. Test complete flow
6. Add AI integration (optional)

**Deliverables:**
- Edge Function code
- Webhook configuration
- Realtime UI component
- Test documentation
- Working demonstration

**Evaluation Criteria:**
- Edge Function implementation (30%)
- Event-driven architecture (25%)
- Realtime UI (25%)
- Code quality (10%)
- Documentation (10%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- Supabase Edge Functions Guide
- Deno Documentation
- Event-Driven Architecture Patterns
- Postgres Replication Guide

**Videos:**
- "Building Edge Functions" (30 min)
- "Event-Driven Architecture" (25 min)
- "Realtime UI with Supabase" (20 min)

**Tools to Explore:**
- Supabase Edge Functions
- Deno Deploy
- Postgres Replication
- Webhook Testing Tools

**Next Module Preview:**
Module 7 will teach you AI-native features including vector search, RAG pipelines, and semantic understanding.

---

**Module 6 Complete**   
**Next:** Module 7 - AI-Native Features (Vector & RAG)
