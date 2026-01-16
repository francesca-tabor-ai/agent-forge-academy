# AI Advisor E2E Tests

## Overview

End-to-end tests for the AI Advisor feature using Playwright. These tests verify:
- Page loading and context display
- New Chat functionality
- Message sending and responses
- Error handling (Service unavailable)

## Prerequisites

1. **Test User Account**: A test user must exist in the database
   - Email: `professional@test.com`
   - Password: `TestPassword123!`
   - Must have a student profile

2. **Environment Variables**: Set `UAT_MOCK_AI=1` for deterministic mock responses

## Running Tests

### With Mock Mode (Recommended for UAT)

```bash
# Enable mock mode
export UAT_MOCK_AI=1

# Run tests
npm run test:e2e tests/e2e/ai-advisor.spec.ts

# Or run in headed mode to see browser
npm run test:e2e:headed tests/e2e/ai-advisor.spec.ts
```

### Without Mock Mode (Uses Real API)

```bash
# Disable mock mode
unset UAT_MOCK_AI

# Run tests (requires valid LLM API keys)
npm run test:e2e tests/e2e/ai-advisor.spec.ts
```

## Test Structure

### 1. Page Load and Context Display
- Verifies AI Advisor page loads correctly
- Checks that context bar is visible (if context is set)

### 2. New Chat Functionality
- Sends a message to create conversation history
- Clicks "New Chat" button
- Verifies message history is cleared (only initial greeting remains)

### 3. Message Sending (Mock Mode)
- Sends a text message
- Verifies user message bubble appears
- Verifies AI response bubble appears with mock response
- Verifies input is cleared after sending
- Tests streaming response handling

### 4. Error Handling
- **Service Unavailable (503)**: Intercepts API call and returns 503
  - Verifies service unavailable banner appears
  - Verifies request ID is displayed
- **Network Errors**: Simulates network failure
  - Verifies error message is displayed

### 5. Context Switching
- Verifies change context button is visible

## Mock Mode Behavior

When `UAT_MOCK_AI=1` is set:

- **Chat API** (`/api/ai-advisor/chat`):
  - Returns deterministic mock responses
  - Request ID: `mock-req-chat-12345`
  - Response includes "mock" or "UAT testing" text

- **Voice API** (`/api/ai-advisor/voice`):
  - Returns deterministic transcription
  - Request ID: `mock-req-voice-12345`

- **Realtime API** (`/api/realtime/*`):
  - Returns mock session credentials
  - Request ID: `mock-req-realtime-connect-12345`

## Test Data Requirements

### Test User
- Email: `professional@test.com`
- Password: `TestPassword123!`
- Must have:
  - User account in auth.users
  - Profile in profiles table (role: 'student')
  - Student profile in student_profiles table

### Optional: Test Context
For context-aware tests, the user should have:
- At least one enrolled course (for course context)
- At least one portfolio project (for project context)
- At least one job application (for job context)

## Troubleshooting

### Tests Fail with "Page not found"
- Ensure the dev server is running: `npm run dev`
- Check `PLAYWRIGHT_BASE_URL` or `NEXT_PUBLIC_APP_URL` is set correctly

### Tests Fail with "Authentication failed"
- Verify test user exists in database
- Check test user credentials match expected values
- Ensure Supabase is configured correctly

### Mock Responses Not Working
- Verify `UAT_MOCK_AI=1` is set in environment
- Check server logs for mock mode activation
- Ensure mock mode check happens before API calls

### Service Unavailable Test Fails
- The test uses route interception to simulate 503
- Verify the route pattern matches: `**/api/ai-advisor/chat*`
- Check that error banner has correct `data-testid="service-unavailable-banner"`

## Expected Test Results

With `UAT_MOCK_AI=1`:
- ✅ All tests should pass
- ✅ Responses are deterministic
- ✅ Request IDs are predictable
- ✅ No actual API calls to LLM services

Without `UAT_MOCK_AI=1`:
- ⚠️ Requires valid LLM API keys
- ⚠️ Responses may vary
- ⚠️ Tests may be slower
- ⚠️ May incur API costs

## CI/CD Integration

For CI/CD pipelines, set environment variables:

```yaml
env:
  UAT_MOCK_AI: "1"
  PLAYWRIGHT_BASE_URL: "http://localhost:3000"
```

Then run:
```bash
npm run test:e2e tests/e2e/ai-advisor.spec.ts
```
