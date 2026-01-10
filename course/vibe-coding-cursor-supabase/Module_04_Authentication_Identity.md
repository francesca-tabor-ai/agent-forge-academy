---
title: "Module 4: Authentication & Identity Primitives"
description: "Implement passwordless OTP, custom auth flows, and anonymous sign-ins"
module: "4"
order: 4
---

# Module 4: Authentication & Identity Primitives

**Duration:** Week 4  
**Learning Objectives:**
- Implement passwordless OTP authentication
- Build custom branded authentication flows
- Create anonymous sign-in experiences
- Understand identity as a "real-world ownership" primitive
- Integrate Twilio Verify for SMS/WhatsApp OTP

---

## 4.1 Identity Without Passwords

### The Password Problem

Traditional password-based authentication has issues:
- ❌ Users forget passwords
- ❌ Weak passwords are common
- ❌ Password reuse across sites
- ❌ Phishing attacks
- ❌ Password reset friction

### Passwordless Authentication

**Passwordless OTP (One-Time Password)** treats identity as **"real-world ownership"**:
- You own your phone number → You can receive SMS
- You own your email → You can receive email codes
- You own your WhatsApp → You can receive WhatsApp messages

**Benefits:**
- ✅ No passwords to remember
- ✅ More secure (possession-based)
- ✅ Better user experience
- ✅ Reduced support burden

### OTP Flow

```
1. User enters phone/email
   ↓
2. System sends OTP code
   ↓
3. User enters code
   ↓
4. System verifies code
   ↓
5. User is authenticated
```

### Implementing OTP with Twilio Verify

#### Step 1: Set Up Twilio

1. **Create Twilio Account:** https://www.twilio.com
2. **Get Credentials:**
   - Account SID
   - Auth Token
   - Verify Service SID

3. **Install Twilio SDK:**

```bash
npm install twilio
```

#### Step 2: Create Supabase Edge Function

**File: `supabase/functions/send-otp/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import twilio from 'npm:twilio@4.19.0'

const twilioClient = twilio(
  Deno.env.get('TWILIO_ACCOUNT_SID'),
  Deno.env.get('TWILIO_AUTH_TOKEN')
)

serve(async (req) => {
  try {
    const { phone } = await req.json()

    // Send OTP via Twilio Verify
    const verification = await twilioClient.verify.v2
      .services(Deno.env.get('TWILIO_VERIFY_SERVICE_SID'))
      .verifications
      .create({ to: phone, channel: 'sms' })

    return new Response(
      JSON.stringify({ success: true, sid: verification.sid }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### Step 3: Verify OTP

**File: `supabase/functions/verify-otp/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import twilio from 'npm:twilio@4.19.0'

const twilioClient = twilio(
  Deno.env.get('TWILIO_ACCOUNT_SID'),
  Deno.env.get('TWILIO_AUTH_TOKEN')
)

serve(async (req) => {
  try {
    const { phone, code } = await req.json()

    // Verify OTP
    const verificationCheck = await twilioClient.verify.v2
      .services(Deno.env.get('TWILIO_VERIFY_SERVICE_SID'))
      .verificationChecks
      .create({ to: phone, code })

    if (verificationCheck.status === 'approved') {
      // Create or sign in user with Supabase
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Sign in or create user
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          // Custom metadata
          data: {
            phone_verified: true
          }
        }
      })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, session: data }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### Step 4: Frontend Implementation

```typescript
// components/auth/OTPLogin.tsx
'use client'

import { useState } from 'react'

export function OTPLogin() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)

  const sendOTP = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const data = await response.json()
      if (data.success) {
        setStep('code')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      })
      const data = await response.json()
      if (data.success) {
        // User is authenticated
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {step === 'phone' ? (
        <div>
          <h2>Enter your phone number</h2>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={sendOTP}
            disabled={loading}
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </div>
      ) : (
        <div>
          <h2>Enter verification code</h2>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={verifyOTP}
            disabled={loading}
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      )}
    </div>
  )
}
```

### WhatsApp OTP

Twilio also supports WhatsApp:

```typescript
// Change channel to 'whatsapp'
const verification = await twilioClient.verify.v2
  .services(serviceSid)
  .verifications
  .create({ to: phone, channel: 'whatsapp' })
```

---

## 4.2 Custom Auth Flows

### Why Custom Auth Flows?

**Default Supabase Auth:**
- Generic UI
- Limited branding
- Basic email templates
- Standard flow

**Custom Auth Flows:**
- ✅ Branded experience
- ✅ Custom email templates
- ✅ Flexible UX
- ✅ Better conversion

### Building Branded Authentication

#### Step 1: Custom Email Templates

Use **React Email** and **Resend** for branded emails:

**Install:**
```bash
npm install react-email @react-email/components resend
```

**Create Email Template:**

```typescript
// emails/otp-email.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface OTPEmailProps {
  code: string
  companyName?: string
}

export function OTPEmail({ code, companyName = 'Your App' }: OTPEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code for {companyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email</Heading>
          <Text style={text}>
            Your verification code is:
          </Text>
          <Text style={codeStyle}>{code}</Text>
          <Text style={text}>
            This code will expire in 10 minutes.
          </Text>
          <Text style={text}>
            If you didn't request this code, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
}

const codeStyle = {
  background: '#f4f4f4',
  borderRadius: '4px',
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '8px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '20px 0',
}
```

#### Step 2: Send Email with Resend

**Edge Function: `supabase/functions/send-email-otp/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from 'npm:resend@2.0.0'
import { render } from 'npm:react-email@0.0.12'
import { OTPEmail } from './emails/otp-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const { email } = await req.json()
    
    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Render email
    const emailHtml = await render(OTPEmail({ code }))

    // Send email
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Your verification code',
      html: emailHtml,
    })

    // Store code in database (with expiration)
    // ... store code logic

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### Step 3: Auth Email Hooks

Supabase allows custom email hooks:

**Configure in Supabase Dashboard:**
- Settings → Auth → Email Templates
- Use custom SMTP (Resend)
- Customize email templates

**Or use Edge Functions:**

```typescript
// supabase/functions/auth-hook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { type, record } = await req.json()

  if (type === 'user.signup' || type === 'user.login') {
    // Custom logic when user signs up or logs in
    // Send welcome email, update analytics, etc.
  }

  return new Response(JSON.stringify({ success: true }))
})
```

### Custom Auth UI Components

Build your own branded auth components:

```typescript
// components/auth/BrandedAuth.tsx
'use client'

export function BrandedAuth() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to YourApp
            </h1>
            <p className="text-gray-600 mt-2">
              Sign in to continue
            </p>
          </div>
          
          <OTPLogin />
          
          <div className="mt-6 text-center text-sm text-gray-600">
            By continuing, you agree to our Terms and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 4.3 Anonymous Sign-ins

### Why Anonymous Sign-ins?

**Benefits:**
- ✅ Lower friction (no sign-up required)
- ✅ Better conversion rates
- ✅ Users can explore before committing
- ✅ Can convert to permanent account later

### Implementing Anonymous Auth

#### Step 1: Enable Anonymous Sign-in

Supabase supports anonymous users:

```typescript
// lib/auth/anonymous.ts
import { supabase } from '@/lib/supabase/client'

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously()
  
  if (error) throw error
  
  return data
}
```

#### Step 2: Anonymous User Experience

```typescript
// components/auth/AnonymousAuth.tsx
'use client'

import { useState } from 'react'
import { signInAnonymously } from '@/lib/auth/anonymous'

export function AnonymousAuth() {
  const [loading, setLoading] = useState(false)

  const handleAnonymousSignIn = async () => {
    setLoading(true)
    try {
      await signInAnonymously()
      // User is now signed in anonymously
      // Redirect to app
      window.location.href = '/app'
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleAnonymousSignIn}
        disabled={loading}
        className="w-full bg-gray-200 text-gray-800 p-3 rounded"
      >
        {loading ? 'Signing in...' : 'Continue as Guest'}
      </button>
    </div>
  )
}
```

#### Step 3: Convert to Permanent Account

Allow users to convert anonymous account to permanent:

```typescript
// lib/auth/convert-anonymous.ts
import { supabase } from '@/lib/supabase/client'

export async function convertAnonymousToPermanent(phone: string, code: string) {
  // Verify OTP first
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: 'sms'
  })

  if (verifyError) throw verifyError

  // Update anonymous user with phone
  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    phone,
    // This converts anonymous to permanent
  })

  if (updateError) throw updateError

  return updateData
}
```

#### Step 4: Handle Anonymous Users in Database

```sql
-- Migration: handle_anonymous_users.sql
-- Anonymous users have is_anonymous = true
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- RLS policy for anonymous users
CREATE POLICY "Anonymous users can create data"
  ON tasks FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (SELECT is_anonymous FROM auth.users WHERE id = auth.uid()) = true
  );
```

### Anonymous User Flow

```
1. User clicks "Continue as Guest"
   ↓
2. Anonymous session created
   ↓
3. User can use app (with limitations)
   ↓
4. User decides to create account
   ↓
5. Convert anonymous to permanent
   ↓
6. All data preserved
```

---

## 4.4 Key Takeaways

**Passwordless OTP:**
- Treat identity as "real-world ownership"
- Use Twilio Verify for SMS/WhatsApp
- Implement with Edge Functions
- Better UX and security

**Custom Auth Flows:**
- Build branded experiences
- Use React Email + Resend
- Customize email templates
- Create flexible UX

**Anonymous Sign-ins:**
- Lower friction for users
- Enable exploration before commitment
- Convert to permanent account later
- Handle in database with RLS

---

## Lab 4: Implement Passwordless Authentication

**Objective:** Build a complete passwordless authentication system

**Requirements:**
1. Set up Twilio Verify (or use email OTP)
2. Create Edge Functions for sending/verifying OTP
3. Build branded auth UI components
4. Implement anonymous sign-in option
5. Add conversion from anonymous to permanent
6. Test complete flow

**Deliverables:**
- Edge Functions for OTP
- Branded auth UI components
- Anonymous auth implementation
- Conversion flow
- Test documentation

**Evaluation Criteria:**
- OTP implementation (30%)
- UI/UX quality (25%)
- Anonymous auth (20%)
- Code quality (15%)
- Documentation (10%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- Twilio Verify Documentation
- Supabase Auth Guide
- React Email Documentation
- Passwordless Authentication Best Practices

**Videos:**
- "Implementing Passwordless Auth" (25 min)
- "Custom Auth Flows with Supabase" (20 min)
- "Anonymous Sign-ins Tutorial" (15 min)

**Tools to Explore:**
- Twilio Verify
- Resend
- React Email
- Supabase Auth

**Next Module Preview:**
Module 5 will teach you security and Row Level Security (RLS), moving security logic to the database level.

---

**Module 4 Complete** ✓  
**Next:** Module 5 - Security & Row Level Security (RLS)
