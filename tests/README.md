# Test Scenarios for Subscription Access Control

## Overview

This directory contains test scenarios and specifications for validating the subscription-based course access control system.

## Test Users

| User ID | Subscription Tier | Expected Behavior |
|---------|-------------------|-------------------|
| `5d5182a0-f5ab-4f47-be2e-01fa70547bd6` | Professional | Access to ALL courses |
| `76db4904-b24f-487a-b443-9474aeb25dfa` | Essential | Access to 5 predefined courses only |

## Test Files

1. **`subscription-access.test.md`** - Test case table with all scenarios
2. **`subscription-access.test.ts`** - Executable test file with assertions

## Quick Reference: Test Case Table

### Professional User Tests (All Should ALLOW)

| Course Slug | Expected Result |
|------------|----------------|
| `prompt-engineering` | ✅ ALLOW |
| `ai-content-pipelines` | ✅ ALLOW |
| `reddit-ai-visibility` | ✅ ALLOW |
| `seo-to-aeo` | ✅ ALLOW |
| `ai-governance-eu-ai-act` | ✅ ALLOW |
| `ai-native-software-delivery-pipelines` | ✅ ALLOW |
| `spec-driven-development` | ✅ ALLOW |
| `vibe-coding-cursor-supabase` | ✅ ALLOW |
| `agentic-rag` | ✅ ALLOW |
| `amazon-rufus-optimisation` | ✅ ALLOW |
| `hyper-personalised-marketing-advertising` | ✅ ALLOW |
| `ai-visibility` | ✅ ALLOW |
| `llm-first-websites` | ✅ ALLOW |
| `agentic-commerce` | ✅ ALLOW |
| `conversational-commerce-intelligence` | ✅ ALLOW |
| `ai-recommender-systems` | ✅ ALLOW |
| `3d-for-ecommerce` | ✅ ALLOW |
| `ai-driven-video-synthetic-media` | ✅ ALLOW |
| `multi-agent-systems` | ✅ ALLOW |

### Essential User Tests

#### Allowed Courses (Should ALLOW)

| Course Slug | Expected Result |
|------------|----------------|
| `prompt-engineering` | ✅ ALLOW |
| `ai-content-pipelines` | ✅ ALLOW |
| `reddit-ai-visibility` | ✅ ALLOW |
| `seo-to-aeo` | ✅ ALLOW |
| `ai-governance-eu-ai-act` | ✅ ALLOW |

#### Restricted Courses (Should DENY)

| Course Slug | Expected Result |
|------------|----------------|
| `ai-native-software-delivery-pipelines` | ❌ DENY |
| `spec-driven-development` | ❌ DENY |
| `vibe-coding-cursor-supabase` | ❌ DENY |
| `agentic-rag` | ❌ DENY |
| `amazon-rufus-optimisation` | ❌ DENY |
| `hyper-personalised-marketing-advertising` | ❌ DENY |
| `ai-visibility` | ❌ DENY |
| `llm-first-websites` | ❌ DENY |
| `agentic-commerce` | ❌ DENY |
| `conversational-commerce-intelligence` | ❌ DENY |
| `ai-recommender-systems` | ❌ DENY |
| `3d-for-ecommerce` | ❌ DENY |
| `ai-driven-video-synthetic-media` | ❌ DENY |
| `multi-agent-systems` | ❌ DENY |

## Test Scenarios

### Scenario 1: Professional User - Full Access
**Objective**: Verify Professional tier user can access ALL courses

**Test Cases**: 19 courses
**Expected**: All return `true` (access granted)

### Scenario 2: Essential User - Allowed Courses
**Objective**: Verify Essential tier user can access the 5 predefined courses

**Test Cases**: 5 courses
**Expected**: All return `true` (access granted)

### Scenario 3: Essential User - Denied Access
**Objective**: Verify Essential tier user is denied access to courses NOT in allowed list

**Test Cases**: 14 courses
**Expected**: All return `false` (access denied)

## Example Assertions

### TypeScript/Jest Format

```typescript
const hasAccess = await canUserAccessCourse(userId, courseId);
expect(hasAccess).toBe(true);  // or .toBe(false)
```

### Pseudo-code Format

```
FUNCTION test_course_access(userId, courseId, expectedResult):
  hasAccess = canUserAccessCourse(userId, courseId)
  ASSERT hasAccess == expectedResult
END FUNCTION
```

### Given/When/Then Format

```
GIVEN user has Professional subscription
WHEN checking access to any course
THEN access should be granted (true)

GIVEN user has Essential subscription
WHEN checking access to allowed course (e.g., prompt-engineering)
THEN access should be granted (true)

GIVEN user has Essential subscription
WHEN checking access to restricted course (e.g., multi-agent-systems)
THEN access should be denied (false)
```

## Running Tests

To run the test file:

```bash
# Using Jest
npm test tests/subscription-access.test.ts

# Using Vitest
npm run test:vitest tests/subscription-access.test.ts
```

## Test Coverage

- **Total Test Cases**: 38
- **Professional User**: 19 tests (all should pass)
- **Essential User**: 19 tests (5 should pass, 14 should fail/deny)
- **Edge Cases**: 4 additional tests

## Notes

- Tests require database connection to Supabase
- Course IDs must be retrieved from database using course slugs
- Ensure test users have active subscriptions before running tests
- Subscription status must be 'active' and period must not be expired
