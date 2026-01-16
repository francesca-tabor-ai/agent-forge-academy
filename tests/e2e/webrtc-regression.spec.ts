/**
 * Regression Tests: WebRTC Realtime Isolation
 * 
 * Ensures WebRTC Realtime does not initialize or make API calls on pages other than /student/ai-advisor
 * This prevents WebRTC from breaking other pages or making unnecessary API calls.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test user credentials
const TEST_USER = {
  email: 'professional@test.com',
  password: 'TestPassword123!',
};

test.describe('WebRTC Realtime Isolation - Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Login as test user
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForURL(/\/student/, { timeout: 10000 });
  });

  test('should NOT call /api/realtime/connect on /student/portfolio page', async ({ page }) => {
    // Track API calls to realtime endpoints
    const realtimeApiCalls: string[] = [];
    
    // Intercept all realtime API calls
    await page.route('**/api/realtime/**', async (route) => {
      const url = route.request().url();
      realtimeApiCalls.push(url);
      // Continue with the request (don't block, just track)
      await route.continue();
    });
    
    // Navigate to portfolio page
    await page.goto(`${BASE_URL}/student/portfolio`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait a bit more to ensure no delayed API calls
    await page.waitForTimeout(2000);
    
    // Verify NO realtime API calls were made
    const connectCalls = realtimeApiCalls.filter(url => url.includes('/api/realtime/connect'));
    expect(connectCalls.length).toBe(0);
    
    // Verify NO session API calls were made
    const sessionCalls = realtimeApiCalls.filter(url => url.includes('/api/realtime/session'));
    expect(sessionCalls.length).toBe(0);
    
    // Log for debugging
    if (realtimeApiCalls.length > 0) {
      console.log('Unexpected realtime API calls:', realtimeApiCalls);
    }
  });

  test('should NOT call /api/realtime/connect on /student/courses page', async ({ page }) => {
    // Track API calls to realtime endpoints
    const realtimeApiCalls: string[] = [];
    
    // Intercept all realtime API calls
    await page.route('**/api/realtime/**', async (route) => {
      const url = route.request().url();
      realtimeApiCalls.push(url);
      await route.continue();
    });
    
    // Navigate to courses page
    await page.goto(`${BASE_URL}/student/courses`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait a bit more to ensure no delayed API calls
    await page.waitForTimeout(2000);
    
    // Verify NO realtime API calls were made
    const connectCalls = realtimeApiCalls.filter(url => url.includes('/api/realtime/connect'));
    expect(connectCalls.length).toBe(0);
    
    const sessionCalls = realtimeApiCalls.filter(url => url.includes('/api/realtime/session'));
    expect(sessionCalls.length).toBe(0);
  });

  test('should NOT call /api/realtime/connect on /student/dashboard page', async ({ page }) => {
    // Track API calls to realtime endpoints
    const realtimeApiCalls: string[] = [];
    
    // Intercept all realtime API calls
    await page.route('**/api/realtime/**', async (route) => {
      const url = route.request().url();
      realtimeApiCalls.push(url);
      await route.continue();
    });
    
    // Navigate to dashboard page
    await page.goto(`${BASE_URL}/student/dashboard`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait a bit more to ensure no delayed API calls
    await page.waitForTimeout(2000);
    
    // Verify NO realtime API calls were made
    const connectCalls = realtimeApiCalls.filter(url => url.includes('/api/realtime/connect'));
    expect(connectCalls.length).toBe(0);
    
    const sessionCalls = realtimeApiCalls.filter(url => url.includes('/api/realtime/session'));
    expect(sessionCalls.length).toBe(0);
  });

  test('should ONLY call /api/realtime/connect when WebRTC mode is selected and Connect is clicked on /student/ai-advisor', async ({ page }) => {
    // Enable mock mode for WebRTC testing
    await page.addInitScript(() => {
      (window as any).__UAT_MOCK_REALTIME = true;
    });
    
    // Track API calls to realtime endpoints
    const realtimeApiCalls: string[] = [];
    
    // Intercept all realtime API calls
    await page.route('**/api/realtime/**', async (route) => {
      const url = route.request().url();
      realtimeApiCalls.push(url);
      
      // Mock successful response for connect
      if (url.includes('/api/realtime/connect')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sdp: 'v=0\r\no=- 1234567890 1234567890 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2\r\n',
            session_id: 'mock-session-123',
          }),
        });
      } else {
        await route.continue();
      }
    });
    
    // Navigate to AI Advisor page
    await page.goto(`${BASE_URL}/student/ai-advisor`);
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="ai-advisor-page"]', { timeout: 10000 });
    
    // Wait a bit to ensure no auto-connect happens
    await page.waitForTimeout(2000);
    
    // Verify NO realtime API calls were made on page load
    const initialConnectCalls = realtimeApiCalls.filter(url => url.includes('/api/realtime/connect'));
    expect(initialConnectCalls.length).toBe(0);
    
    // Now switch to WebRTC mode
    await page.locator('[data-testid="voice-mode-webrtc-button"]').click();
    
    // Wait for WebRTC controls
    await page.waitForSelector('[data-testid="webrtc-connect-button"]', { timeout: 5000 });
    
    // Wait a bit more - still should not auto-connect
    await page.waitForTimeout(1000);
    
    // Verify still NO connect calls (user must click Connect button)
    const beforeConnectCalls = realtimeApiCalls.filter(url => url.includes('/api/realtime/connect'));
    expect(beforeConnectCalls.length).toBe(0);
    
    // Now click Connect button
    await page.locator('[data-testid="webrtc-connect-button"]').click();
    
    // Wait for API call
    await page.waitForTimeout(1000);
    
    // Verify connect API was called ONLY after user clicked Connect
    const afterConnectCalls = realtimeApiCalls.filter(url => url.includes('/api/realtime/connect'));
    expect(afterConnectCalls.length).toBe(1);
  });
});
