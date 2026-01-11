# Automated Test Plan: Subscription-Based Access Control

## Overview

This test plan ensures the subscription-based access control system works correctly and prevents unauthorized access, incorrect course visibility, and subscription mismatch bugs.

## Test Categories

### 1. Unit Tests
**Location**: `tests/unit/subscription-access.test.ts`

**Purpose**: Test individual functions in isolation

**Coverage**:
- ✅ `isCourseAccessible()` - All scenarios
- ✅ `isCourseLocked()` - All scenarios
- ✅ `getCourseLockReason()` - All scenarios
- ✅ `getUpgradeMessage()` - All scenarios
- ✅ Edge cases (empty strings, invalid inputs)
- ✅ Regression tests for course list changes

**Key Tests**:
- Professional tier can access all courses
- Essential tier can only access 5 allowed courses
- No subscription = no access
- Invalid inputs handled gracefully

### 2. Integration Tests
**Location**: `tests/integration/api/subscription-access.test.ts`

**Purpose**: Test API endpoints and database functions

**Coverage**:
- ✅ `GET /api/courses/:courseId` - Access control
- ✅ `POST /api/courses/enroll` - Enrollment access control
- ✅ `POST /api/subscription/change-tier` - Tier changes
- ✅ Database function `has_course_access()` - All scenarios
- ✅ Security tests (SQL injection, unauthorized access)

**Key Tests**:
- API returns 200 for allowed access
- API returns 403 for denied access
- API returns 401 for unauthenticated requests
- Database function handles edge cases
- Concurrent access checks work correctly

### 3. End-to-End Tests
**Location**: `tests/e2e/subscription-access.spec.ts`

**Purpose**: Test complete user flows in browser

**Coverage**:
- ✅ Professional user sees all courses as clickable
- ✅ Essential user sees allowed courses as clickable
- ✅ Essential user sees restricted courses as locked
- ✅ Upgrade modal appears on locked course click
- ✅ Subscription change flows
- ✅ UI updates after subscription changes

**Key Tests**:
- Course visibility matches subscription tier
- Locked courses show correct UI state
- Upgrade flow works end-to-end
- Access is enforced at API level

### 4. Regression Tests
**Location**: `tests/regression/course-changes.test.ts`

**Purpose**: Prevent bugs when courses are added/removed

**Coverage**:
- ✅ Essential tier course list integrity
- ✅ Adding course to Essential tier
- ✅ Removing course from Essential tier
- ✅ Professional tier unaffected by changes
- ✅ Database consistency checks

**Key Tests**:
- Course list maintains exactly 5 courses
- All required courses are included
- No restricted courses in Essential list
- Access logic remains consistent

## Test Scenarios

### Scenario 1: Professional User Access
**Objective**: Verify Professional users can access all courses

**Tests**:
- Unit: `isCourseAccessible()` returns true for all courses
- Integration: API returns 200 for any course
- E2E: All courses visible and clickable in UI

**Expected**: ✅ All tests pass

### Scenario 2: Essential User - Allowed Courses
**Objective**: Verify Essential users can access 5 allowed courses

**Tests**:
- Unit: `isCourseAccessible()` returns true for allowed courses
- Integration: API returns 200 for allowed courses
- E2E: Allowed courses visible and clickable

**Expected**: ✅ All tests pass

### Scenario 3: Essential User - Restricted Courses
**Objective**: Verify Essential users cannot access restricted courses

**Tests**:
- Unit: `isCourseLocked()` returns true for restricted courses
- Integration: API returns 403 for restricted courses
- E2E: Restricted courses show locked state

**Expected**: ✅ All tests pass (access denied)

### Scenario 4: No Subscription
**Objective**: Verify users without subscription have no access

**Tests**:
- Unit: `isCourseAccessible()` returns false
- Integration: API returns 403
- E2E: All courses show locked state

**Expected**: ✅ All tests pass (access denied)

### Scenario 5: Subscription Upgrade
**Objective**: Verify upgrade grants immediate access

**Tests**:
- Integration: Tier change updates database
- Integration: Cache invalidated
- E2E: UI updates immediately
- E2E: Previously locked courses become accessible

**Expected**: ✅ All tests pass

### Scenario 6: Subscription Downgrade
**Objective**: Verify downgrade shows warning and grace period

**Tests**:
- Integration: Warning shown for in-progress courses
- Integration: Access continues during grace period
- E2E: Warning modal appears
- E2E: Access restricted after period end

**Expected**: ✅ All tests pass

## Preventing Bugs

### Unauthorized Access Prevention

**Tests**:
1. ✅ API validates subscription on every request
2. ✅ Database function checks period_end
3. ✅ Client-side checks don't bypass server validation
4. ✅ Expired subscriptions are caught
5. ✅ SQL injection attempts are blocked

### Incorrect Course Visibility Prevention

**Tests**:
1. ✅ UI matches subscription tier
2. ✅ Locked courses show correct visual state
3. ✅ Allowed courses are clickable
4. ✅ Restricted courses are disabled
5. ✅ No subscription = all courses locked

### Subscription Mismatch Prevention

**Tests**:
1. ✅ Tier changes update database immediately
2. ✅ Cache invalidated on tier change
3. ✅ Access checks use current tier (not cached)
4. ✅ Period validation on every check
5. ✅ Grace period handled correctly

## Test Data Requirements

### Test Users

1. **Professional User**
   - User ID: `5d5182a0-f5ab-4f47-be2e-01fa70547bd6`
   - Tier: `professional`
   - Status: `active`
   - Period: Not expired

2. **Essential User**
   - User ID: `76db4904-b24f-487a-b443-9474aeb25dfa`
   - Tier: `essential`
   - Status: `active`
   - Period: Not expired

3. **No Subscription User** (for testing)
   - User ID: `test-no-sub@example.com`
   - Tier: `null`
   - Status: N/A

### Test Courses

- **Allowed (Essential)**: `prompt-engineering`, `ai-content-pipelines`, `reddit-ai-visibility`, `seo-to-aeo`, `ai-governance-eu-ai-act`
- **Restricted**: `multi-agent-systems`, `agentic-rag`, `ai-visibility`, etc.

## Running Tests

### Unit Tests
```bash
npm run test:unit
# or
npx vitest tests/unit
```

### Integration Tests
```bash
npm run test:integration
# or
npx vitest tests/integration
```

### E2E Tests
```bash
npm run test:e2e
# or
npx playwright test
```

### All Tests
```bash
npm run test
# Runs unit + integration + e2e
```

### Coverage Report
```bash
npm run test:coverage
# Generates coverage report
```

## Test Coverage Goals

- **Unit Tests**: 100% coverage of utility functions
- **Integration Tests**: 100% coverage of API routes
- **E2E Tests**: All critical user flows
- **Overall**: Minimum 80% code coverage

## Continuous Integration

### Pre-commit Hooks
- Run unit tests
- Run linting
- Check test coverage

### CI Pipeline
1. Install dependencies
2. Run unit tests
3. Run integration tests
4. Run E2E tests
5. Generate coverage report
6. Fail if coverage < 80%

## Regression Test Strategy

### When Adding Course to Essential Tier
1. ✅ Update `ESSENTIAL_TIER_COURSES` array
2. ✅ Run regression tests
3. ✅ Verify course is accessible
4. ✅ Verify other courses still work

### When Removing Course from Essential Tier
1. ✅ Remove from `ESSENTIAL_TIER_COURSES` array
2. ✅ Run regression tests
3. ✅ Verify course is locked
4. ✅ Verify other courses still work

### When Adding New Course to Platform
1. ✅ Verify Professional users can access
2. ✅ Verify Essential users cannot access (unless added to list)
3. ✅ Run all regression tests

## Security Test Checklist

- [ ] SQL injection prevention
- [ ] Unauthorized API access
- [ ] Subscription bypass attempts
- [ ] Period validation
- [ ] Tier manipulation prevention
- [ ] Cache poisoning prevention
- [ ] Race condition handling

## Test Maintenance

### When to Update Tests
- New course added/removed from Essential tier
- Subscription logic changes
- API endpoint changes
- Database schema changes
- New subscription tier added

### Test Review Process
1. Review test coverage after each feature
2. Update tests when requirements change
3. Add tests for any bugs found
4. Refactor tests for maintainability

## Known Test Limitations

1. **Database Dependency**: Integration tests require database connection
2. **Test Data**: Requires test users with active subscriptions
3. **E2E Setup**: Requires running application server
4. **Time-dependent**: Some tests depend on subscription periods

## Success Criteria

✅ All unit tests pass
✅ All integration tests pass
✅ All E2E tests pass
✅ Coverage ≥ 80%
✅ No unauthorized access possible
✅ Course visibility matches subscription
✅ Subscription changes work correctly
✅ Regression tests catch course list changes
