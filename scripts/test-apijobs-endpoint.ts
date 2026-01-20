#!/usr/bin/env tsx
/**
 * Test script for APIJobs endpoint
 * 
 * Usage:
 *   npm run test:apijobs
 *   or
 *   tsx scripts/test-apijobs-endpoint.ts
 * 
 * Environment:
 *   Requires APIJOBS_API_KEY in .env.local or environment
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
  'http://localhost:3000';

const API_ENDPOINT = `${BASE_URL}/api/jobs/fetch-apijobs`;

interface TestCase {
  name: string;
  params: Record<string, string>;
  description: string;
}

const testCases: TestCase[] = [
  {
    name: 'Basic search',
    params: { q: 'software engineer' },
    description: 'Search for software engineer jobs',
  },
  {
    name: 'AI/ML jobs',
    params: { q: 'AI engineer', remote: 'true' },
    description: 'Search for remote AI engineer jobs',
  },
  {
    name: 'With location',
    params: { q: 'data scientist', location: 'San Francisco' },
    description: 'Search for data scientist jobs in San Francisco',
  },
  {
    name: 'Remote only',
    params: { q: 'machine learning', remote: 'true' },
    description: 'Search for remote machine learning jobs',
  },
  {
    name: 'With pagination',
    params: { q: 'developer', page: '1', limit: '5' },
    description: 'Search with pagination (page 1, 5 results)',
  },
];

async function testEndpoint(testCase: TestCase): Promise<boolean> {
  const params = new URLSearchParams(testCase.params);
  const url = `${API_ENDPOINT}?${params}`;

  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`   Description: ${testCase.description}`);
  console.log(`   URL: ${url.replace(process.env.APIJOBS_API_KEY || '', '***')}`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    if (response.ok && data.ok === true) {
      console.log(`   ✅ Success (${response.status})`);
      console.log(`   ⏱️  Response time: ${responseTime}ms`);
      console.log(`   📊 Jobs found: ${data.total || 0}`);
      console.log(`   📄 Jobs returned: ${data.jobs?.length || 0}`);
      console.log(`   🔍 Request ID: ${data.requestId || 'N/A'}`);

      if (data.jobs && data.jobs.length > 0) {
        const firstJob = data.jobs[0];
        console.log(`   📝 Sample job: ${firstJob.title || 'N/A'} at ${firstJob.company || 'N/A'}`);
      }

      return true;
    } else {
      console.log(`   ❌ Failed (${response.status})`);
      console.log(`   ⏱️  Response time: ${responseTime}ms`);
      console.log(`   🔍 Request ID: ${data.requestId || 'N/A'}`);
      
      if (data.error) {
        console.log(`   ⚠️  Error: ${data.error.code || 'UNKNOWN'}: ${data.error.message || 'Unknown error'}`);
        if (data.error.details) {
          console.log(`   📋 Details: ${data.error.details}`);
        }
      }

      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ Exception: ${error.message}`);
    return false;
  }
}

async function checkEnvironment(): Promise<boolean> {
  console.log('🔍 Checking environment...');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Endpoint: ${API_ENDPOINT}`);

  const hasApiKey = !!process.env.APIJOBS_API_KEY;
  console.log(`   API Key configured: ${hasApiKey ? '✅ Yes' : '❌ No'}`);

  if (!hasApiKey) {
    console.log('\n⚠️  Warning: APIJOBS_API_KEY not found in environment');
    console.log('   Make sure to:');
    console.log('   1. Add APIJOBS_API_KEY to .env.local');
    console.log('   2. Or set it as an environment variable');
    console.log('   3. Or add it to Vercel Environment Variables');
  }

  return hasApiKey;
}

async function main() {
  console.log('🚀 APIJobs Endpoint Test Suite');
  console.log('=' .repeat(50));

  const envOk = await checkEnvironment();

  if (!envOk) {
    console.log('\n⚠️  Continuing without API key (will test endpoint error handling)');
  }

  console.log('\n📋 Running test cases...');
  const results: { name: string; passed: boolean }[] = [];

  for (const testCase of testCases) {
    const passed = await testEndpoint(testCase);
    results.push({ name: testCase.name, passed });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}`);
  });

  console.log(`\n   Total: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Test suite error:', error);
    process.exit(1);
  });
}

export { testEndpoint, checkEnvironment };
