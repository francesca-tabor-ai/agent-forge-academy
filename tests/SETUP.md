# Test Setup Guide

## Prerequisites

Install testing dependencies:

```bash
npm install -D vitest @vitest/ui @playwright/test
npm install -D @types/node
```

For coverage:
```bash
npm install -D @vitest/coverage-v8
```

## Configuration Files

- `vitest.config.ts` - Unit and integration test configuration
- `playwright.config.ts` - E2E test configuration

## Test Structure

```
tests/
├── unit/                    # Unit tests (isolated functions)
│   └── subscription-access.test.ts
├── integration/             # Integration tests (API + DB)
│   └── api/
│       └── subscription-access.test.ts
├── e2e/                     # End-to-end tests (browser)
│   └── subscription-access.spec.ts
├── regression/              # Regression tests
│   └── course-changes.test.ts
├── TEST_PLAN.md            # Comprehensive test plan
└── SETUP.md                # This file
```

## Environment Setup

### 1. Test Database

Create a test Supabase project or use local Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start
```

### 2. Test Users

Create test users in your test database:

```sql
-- Professional user
INSERT INTO auth.users (id, email) VALUES 
  ('5d5182a0-f5ab-4f47-be2e-01fa70547bd6', 'professional@test.com');

-- Essential user
INSERT INTO auth.users (id, email) VALUES 
  ('76db4904-b24f-487a-b443-9474aeb25dfa', 'essential@test.com');
```

### 3. Environment Variables

Create `.env.test`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-test-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Running Tests

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
# First, install Playwright browsers
npx playwright install

# Then run tests
npm run test:e2e
```

### All Tests
```bash
npm run test:all
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Data Setup

Before running tests, ensure:

1. ✅ Test database has required tables
2. ✅ Test users exist with subscriptions
3. ✅ Courses exist in database
4. ✅ Subscription tiers are configured

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```
