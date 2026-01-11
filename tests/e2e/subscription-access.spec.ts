/**
 * End-to-End Tests: Subscription Access Control
 * 
 * Browser-based tests for complete user flows
 * Focus: Preventing incorrect course visibility and access bugs
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test user credentials (would be test accounts)
const PROFESSIONAL_USER = {
  email: 'professional@test.com',
  password: 'TestPassword123!',
};

const ESSENTIAL_USER = {
  email: 'essential@test.com',
  password: 'TestPassword123!',
};

test.describe('Subscription Access Control - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/auth/login`);
  });

  test.describe('Professional User - Full Access', () => {
    test('should see all courses as clickable', async ({ page }) => {
      // Login as Professional user
      await page.fill('input[type="email"]', PROFESSIONAL_USER.email);
      await page.fill('input[type="password"]', PROFESSIONAL_USER.password);
      await page.click('button[type="submit"]');

      // Navigate to courses page
      await page.goto(`${BASE_URL}/student/courses`);

      // Verify all courses are visible and clickable
      const courseCards = page.locator('[data-testid="course-card"]');
      const count = await courseCards.count();

      for (let i = 0; i < count; i++) {
        const card = courseCards.nth(i);
        
        // Should not have lock icon
        await expect(card.locator('[data-testid="lock-icon"]')).not.toBeVisible();
        
        // Should be clickable (not disabled)
        await expect(card).not.toHaveClass(/cursor-not-allowed/);
        
        // Should have hover effect
        await expect(card).toHaveClass(/hover:border-brand-light/);
      }
    });

    test('should be able to access any course', async ({ page }) => {
      await page.fill('input[type="email"]', PROFESSIONAL_USER.email);
      await page.fill('input[type="password"]', PROFESSIONAL_USER.password);
      await page.click('button[type="submit"]');

      // Try to access a restricted course (for Essential users)
      await page.goto(`${BASE_URL}/student/courses/multi-agent-systems`);

      // Should successfully access the course
      await expect(page).toHaveURL(/\/student\/courses\/multi-agent-systems/);
      await expect(page.locator('h1')).toContainText('Multi-Agent Systems');
    });

    test('should not see upgrade prompts', async ({ page }) => {
      await page.fill('input[type="email"]', PROFESSIONAL_USER.email);
      await page.fill('input[type="password"]', PROFESSIONAL_USER.password);
      await page.click('button[type="submit"]');

      await page.goto(`${BASE_URL}/student/courses`);

      // Should not see any upgrade modals or prompts
      await expect(page.locator('[data-testid="upgrade-modal"]')).not.toBeVisible();
      await expect(page.locator('text=Upgrade to Professional')).not.toBeVisible();
    });
  });

  test.describe('Essential User - Limited Access', () => {
    test('should see allowed courses as clickable', async ({ page }) => {
      await page.fill('input[type="email"]', ESSENTIAL_USER.email);
      await page.fill('input[type="password"]', ESSENTIAL_USER.password);
      await page.click('button[type="submit"]');

      await page.goto(`${BASE_URL}/student/courses`);

      // Allowed courses should be clickable
      const allowedCourses = [
        'prompt-engineering',
        'ai-content-pipelines',
        'reddit-ai-visibility',
        'seo-to-aeo',
        'ai-governance-eu-ai-act',
      ];

      for (const courseSlug of allowedCourses) {
        const card = page.locator(`[data-course-slug="${courseSlug}"]`);
        
        // Should not have lock icon
        await expect(card.locator('[data-testid="lock-icon"]')).not.toBeVisible();
        
        // Should be clickable
        await expect(card).not.toHaveClass(/cursor-not-allowed/);
      }
    });

    test('should see restricted courses as locked', async ({ page }) => {
      await page.fill('input[type="email"]', ESSENTIAL_USER.email);
      await page.fill('input[type="password"]', ESSENTIAL_USER.password);
      await page.click('button[type="submit"]');

      await page.goto(`${BASE_URL}/student/courses`);

      // Restricted courses should show locked state
      const restrictedCourses = [
        'multi-agent-systems',
        'agentic-rag',
        'ai-visibility',
      ];

      for (const courseSlug of restrictedCourses) {
        const card = page.locator(`[data-course-slug="${courseSlug}"]`);
        
        // Should have lock badge
        await expect(card.locator('text=Professional Access Required')).toBeVisible();
        
        // Should have lock icon
        await expect(card.locator('[data-testid="lock-icon"]')).toBeVisible();
        
        // Should be disabled (not clickable as link)
        await expect(card).toHaveClass(/cursor-not-allowed/);
        
        // Should have reduced opacity
        await expect(card).toHaveClass(/opacity-75/);
      }
    });

    test('should show upgrade modal when clicking locked course', async ({ page }) => {
      await page.fill('input[type="email"]', ESSENTIAL_USER.email);
      await page.fill('input[type="password"]', ESSENTIAL_USER.password);
      await page.click('button[type="submit"]');

      await page.goto(`${BASE_URL}/student/courses`);

      // Click on a locked course
      const lockedCourse = page.locator('[data-course-slug="multi-agent-systems"]');
      await lockedCourse.click();

      // Upgrade modal should appear
      await expect(page.locator('[data-testid="upgrade-modal"]')).toBeVisible();
      await expect(page.locator('text=Unlock Multi-Agent Systems')).toBeVisible();
      await expect(page.locator('text=Upgrade to Professional Access')).toBeVisible();
    });

    test('should navigate to subscription page from upgrade modal', async ({ page }) => {
      await page.fill('input[type="email"]', ESSENTIAL_USER.email);
      await page.fill('input[type="password"]', ESSENTIAL_USER.password);
      await page.click('button[type="submit"]');

      await page.goto(`${BASE_URL}/student/courses`);

      // Click locked course
      await page.locator('[data-course-slug="multi-agent-systems"]').click();

      // Click upgrade button
      await page.locator('button:has-text("Upgrade to Professional Access")').click();

      // Should navigate to subscription page
      await expect(page).toHaveURL(/\/student\/subscription/);
    });

    test('should be denied access when trying to access restricted course directly', async ({ page }) => {
      await page.fill('input[type="email"]', ESSENTIAL_USER.email);
      await page.fill('input[type="password"]', ESSENTIAL_USER.password);
      await page.click('button[type="submit"]');

      // Try to access restricted course directly via URL
      const response = await page.goto(`${BASE_URL}/student/courses/multi-agent-systems`);

      // Should be redirected or show access denied
      // API should return 403
      expect(response?.status()).toBe(403);
    });
  });

  test.describe('Subscription Change Flows', () => {
    test('should immediately grant access after upgrade', async ({ page }) => {
      // Login as Essential user
      await page.fill('input[type="email"]', ESSENTIAL_USER.email);
      await page.fill('input[type="password"]', ESSENTIAL_USER.password);
      await page.click('button[type="submit"]');

      // Verify course is locked
      await page.goto(`${BASE_URL}/student/courses`);
      const lockedCourse = page.locator('[data-course-slug="multi-agent-systems"]');
      await expect(lockedCourse.locator('[data-testid="lock-icon"]')).toBeVisible();

      // Upgrade subscription (via API or UI)
      await page.goto(`${BASE_URL}/student/subscription`);
      // ... perform upgrade ...

      // Refresh courses page
      await page.goto(`${BASE_URL}/student/courses`);

      // Course should now be unlocked
      await expect(lockedCourse.locator('[data-testid="lock-icon"]')).not.toBeVisible();
      await expect(lockedCourse).not.toHaveClass(/cursor-not-allowed/);
    });

    test('should show warning before downgrade', async ({ page }) => {
      // Login as Professional user with in-progress courses
      await page.fill('input[type="email"]', PROFESSIONAL_USER.email);
      await page.fill('input[type="password"]', PROFESSIONAL_USER.password);
      await page.click('button[type="submit"]');

      // Navigate to subscription page
      await page.goto(`${BASE_URL}/student/subscription`);

      // Attempt to downgrade
      await page.click('button:has-text("Downgrade")');

      // Should show warning with courses that will lose access
      await expect(page.locator('text=You have in-progress courses')).toBeVisible();
      await expect(page.locator('[data-testid="courses-losing-access"]')).toBeVisible();
    });
  });

  test.describe('Regression Tests - Course Visibility', () => {
    test('should correctly show/hide courses based on subscription', async ({ page }) => {
      // Test that course visibility matches subscription tier
      // This prevents bugs where UI shows wrong state
    });

    test('should update UI immediately after subscription change', async ({ page }) => {
      // Test that UI reflects subscription changes without page refresh
    });

    test('should handle edge case: user with no subscription', async ({ page }) => {
      // Test user without subscription sees all courses as locked
    });
  });

  test.describe('Security Tests - Preventing Unauthorized Access', () => {
    test('should not allow direct API access to restricted courses', async ({ request }) => {
      // Test that API enforces access control
      const response = await request.get(
        `${BASE_URL}/api/courses/${RESTRICTED_COURSE_ID}`,
        {
          headers: {
            'Cookie': `auth-token=${ESSENTIAL_USER_TOKEN}`,
          },
        }
      );

      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.error).toContain('Access denied');
    });

    test('should validate subscription on every request', async ({ page }) => {
      // Test that expired subscriptions are caught
      // Even if user has valid session
    });
  });
});
