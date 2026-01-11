# Subscription Access Control - Test Suite

## Quick Start

```bash
# Install dependencies
npm install -D vitest @playwright/test @vitest/ui

# Run all tests
npm run test:all

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Test Files

### Unit Tests
- `tests/unit/subscription-access.test.ts` - Utility function tests

### Integration Tests
- `tests/integration/api/subscription-access.test.ts` - API and database tests

### E2E Tests
- `tests/e2e/subscription-access.spec.ts` - Browser-based user flow tests

### Regression Tests
- `tests/regression/course-changes.test.ts` - Course list change tests

## Documentation

- `TEST_PLAN.md` - Comprehensive test plan and strategy
- `SETUP.md` - Test environment setup guide
- `subscription-access.test.md` - Test case table reference

## Test Coverage

See `TEST_PLAN.md` for detailed coverage goals and test scenarios.
