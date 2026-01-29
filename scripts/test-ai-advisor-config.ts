#!/usr/bin/env tsx
/**
 * Test script for AI Advisor configuration
 * 
 * Usage:
 *   npm run test:ai-config
 *   or
 *   tsx scripts/test-ai-advisor-config.ts
 * 
 * This script tests:
 * 1. Environment variable configuration
 * 2. Health endpoint (if server is running)
 * 3. Diagnostics endpoint (if server is running)
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
  'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Test 1: Check environment variable
function testEnvironmentVariable() {
  const apiKey = process.env.LLM_API_KEY;
  const provider = process.env.LLM_PROVIDER || 'openai';
  
  if (!apiKey) {
    results.push({
      name: 'Environment Variable Check',
      status: 'fail',
      message: 'LLM_API_KEY is not set in environment',
      details: {
        note: 'Make sure you have LLM_API_KEY in .env.local and restart the dev server',
      }
    });
    return;
  }

  const keyLength = apiKey.length;
  const keyPrefix = apiKey.substring(0, 7);
  const isValidFormat = apiKey.startsWith('sk-') || apiKey.startsWith('sk-ant-');

  results.push({
    name: 'Environment Variable Check',
    status: 'pass',
    message: `LLM_API_KEY is set (${keyLength} characters)`,
    details: {
      provider,
      keyPrefix: `${keyPrefix}...`,
      keyLength,
      isValidFormat,
      note: isValidFormat 
        ? 'Key format looks valid' 
        : 'Key format may be invalid (should start with sk- or sk-ant-)',
    }
  });
}

// Test 2: Health endpoint
async function testHealthEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/ai-advisor/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      const failedChecks = data.details?.filter((c: any) => c.status === 'fail') || [];
      const llmCheck = data.details?.find((c: any) => c.name === 'LLM Provider Configuration');

      if (failedChecks.length === 0) {
        results.push({
          name: 'Health Endpoint',
          status: 'pass',
          message: 'All health checks passed',
          details: {
            status: data.status,
            checks: data.checks,
            llmProvider: llmCheck?.details?.provider,
            upstreamHealthy: llmCheck?.details?.upstreamHealthy,
          }
        });
      } else {
        results.push({
          name: 'Health Endpoint',
          status: 'fail',
          message: `${failedChecks.length} health check(s) failed`,
          details: {
            status: data.status,
            failedChecks: failedChecks.map((c: any) => ({
              name: c.name,
              message: c.message,
            })),
          }
        });
      }
    } else {
      results.push({
        name: 'Health Endpoint',
        status: 'fail',
        message: `Health check returned ${response.status}`,
        details: {
          status: data.status,
          message: data.message || 'Unknown error',
        }
      });
    }
  } catch (error: any) {
    results.push({
      name: 'Health Endpoint',
      status: 'skip',
      message: 'Server not running or endpoint not accessible',
      details: {
        error: error.message,
        note: 'Start the dev server with: npm run dev',
      }
    });
  }
}

// Test 3: Diagnostics endpoint
async function testDiagnosticsEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/diagnostics/ai`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.providerConfigured) {
      results.push({
        name: 'Diagnostics Endpoint',
        status: 'pass',
        message: 'Provider is configured correctly',
        details: {
          provider: data.provider,
          model: data.model,
          hasApiKey: data.hasApiKey,
          providerConfigured: data.providerConfigured,
        }
      });
    } else {
      results.push({
        name: 'Diagnostics Endpoint',
        status: 'fail',
        message: 'Provider is not configured',
        details: {
          provider: data.provider,
          hasApiKey: data.hasApiKey,
          providerConfigured: data.providerConfigured,
        }
      });
    }
  } catch (error: any) {
    results.push({
      name: 'Diagnostics Endpoint',
      status: 'skip',
      message: 'Server not running or endpoint not accessible',
      details: {
        error: error.message,
        note: 'Start the dev server with: npm run dev',
      }
    });
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Testing AI Advisor Configuration\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Test 1: Environment variable
  testEnvironmentVariable();

  // Test 2 & 3: API endpoints (only if server is running)
  await testHealthEndpoint();
  await testDiagnosticsEndpoint();

  // Print results
  console.log('📊 Test Results:\n');
  
  let passCount = 0;
  let failCount = 0;
  let skipCount = 0;

  results.forEach((result, index) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
    console.log(`${index + 1}. ${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    
    if (result.details) {
      Object.entries(result.details).forEach(([key, value]) => {
        if (key !== 'note') {
          console.log(`   ${key}: ${JSON.stringify(value)}`);
        }
      });
      if (result.details.note) {
        console.log(`   💡 ${result.details.note}`);
      }
    }
    console.log('');

    if (result.status === 'pass') passCount++;
    else if (result.status === 'fail') failCount++;
    else skipCount++;
  });

  // Summary
  console.log('📈 Summary:');
  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log('');

  if (failCount === 0 && skipCount === 0) {
    console.log('🎉 All tests passed! AI Advisor is configured correctly.');
    process.exit(0);
  } else if (failCount > 0) {
    console.log('⚠️  Some tests failed. Please check the configuration.');
    process.exit(1);
  } else {
    console.log('ℹ️  Some tests were skipped (server not running).');
    console.log('   Start the dev server and run this script again to test endpoints.');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});
