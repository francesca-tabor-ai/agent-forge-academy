#!/usr/bin/env tsx
/**
 * Diagnostic script to query logs and conversations for a specific request ID
 * 
 * Usage:
 *   tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze
 * 
 * Or set REQUEST_ID environment variable:
 *   REQUEST_ID=req_1768902621265_7sy30ze tsx scripts/diagnose-request-id.ts
 */

import { createServerSupabaseClient } from '../lib/supabase/server';

const REQUEST_ID = process.argv[2] || process.env.REQUEST_ID;

if (!REQUEST_ID) {
  console.error('❌ Error: Request ID required');
  console.error('Usage: tsx scripts/diagnose-request-id.ts <request-id>');
  console.error('   Or: REQUEST_ID=<request-id> tsx scripts/diagnose-request-id.ts');
  process.exit(1);
}

async function diagnoseRequest() {
  console.log(`\n🔍 Diagnosing Request ID: ${REQUEST_ID}\n`);
  console.log('=' .repeat(80));

  const supabase = createServerSupabaseClient();

  // 1. Query request_logs table
  console.log('\n📋 1. Request Logs (request_logs table)');
  console.log('-'.repeat(80));
  
  const { data: requestLogs, error: logsError } = await supabase
    .from('request_logs')
    .select('*')
    .eq('request_id', REQUEST_ID)
    .order('created_at', { ascending: false });

  if (logsError) {
    console.error('❌ Error querying request_logs:', logsError);
  } else if (!requestLogs || requestLogs.length === 0) {
    console.log('⚠️  No request logs found for this request ID');
    console.log('   This could mean:');
    console.log('   - Request was logged before request_logs table was created');
    console.log('   - Request failed before logging could occur');
    console.log('   - Request ID is incorrect');
  } else {
    requestLogs.forEach((log, idx) => {
      console.log(`\n   Log Entry ${idx + 1}:`);
      console.log(`   - Path: ${log.path}`);
      console.log(`   - Method: ${log.method}`);
      console.log(`   - Status: ${log.status} ${getStatusLabel(log.status)}`);
      console.log(`   - Duration: ${log.duration}ms`);
      console.log(`   - User ID: ${log.user_id || 'N/A'}`);
      console.log(`   - IP Address: ${log.ip_address || 'N/A'}`);
      console.log(`   - Created At: ${new Date(log.created_at).toISOString()}`);
      
      if (log.error_message) {
        console.log(`   - Error Message: ${log.error_message}`);
      }
      
      if (log.error_stack) {
        console.log(`   - Error Stack:`);
        // Show first 500 chars of stack trace
        const stackPreview = log.error_stack.length > 500 
          ? log.error_stack.substring(0, 500) + '...'
          : log.error_stack;
        console.log(`     ${stackPreview.split('\n').join('\n     ')}`);
      }
    });
  }

  // 2. Query advisor_conversations table for metadata.requestId
  console.log('\n\n💬 2. Conversation Messages (advisor_conversations table)');
  console.log('-'.repeat(80));
  
  const { data: conversations, error: convError } = await supabase
    .from('advisor_conversations')
    .select('*')
    .order('created_at', { ascending: true });

  if (convError) {
    console.error('❌ Error querying advisor_conversations:', convError);
  } else {
    // Filter conversations where metadata.requestId matches
    const matchingConversations = conversations?.filter(conv => 
      conv.metadata?.requestId === REQUEST_ID
    ) || [];

    if (matchingConversations.length === 0) {
      console.log('⚠️  No conversation messages found with this request ID');
      console.log('   This could mean:');
      console.log('   - Request failed before storing conversation');
      console.log('   - Request was not associated with a student profile');
      console.log('   - Request ID is incorrect');
    } else {
      console.log(`   Found ${matchingConversations.length} message(s):\n`);
      
      matchingConversations.forEach((conv, idx) => {
        console.log(`   Message ${idx + 1}:`);
        console.log(`   - Role: ${conv.role}`);
        console.log(`   - Conversation ID: ${conv.conversation_id}`);
        console.log(`   - Student Profile ID: ${conv.student_profile_id}`);
        console.log(`   - Created At: ${new Date(conv.created_at).toISOString()}`);
        console.log(`   - Content Preview: ${conv.content.substring(0, 200)}${conv.content.length > 200 ? '...' : ''}`);
        
        if (conv.metadata) {
          console.log(`   - Metadata:`);
          if (conv.metadata.intent) {
            console.log(`     * Intent: ${conv.metadata.intent} (confidence: ${conv.metadata.intentConfidence || 'N/A'})`);
          }
          if (conv.metadata.tools) {
            console.log(`     * Tools: ${JSON.stringify(conv.metadata.tools)}`);
          }
          if (conv.metadata.ragChunks) {
            console.log(`     * RAG Chunks: ${conv.metadata.ragChunks.length} chunks retrieved`);
          }
          if (conv.metadata.citations) {
            console.log(`     * Citations: ${conv.metadata.citations.length} citations`);
          }
          if (conv.metadata.next_actions) {
            console.log(`     * Next Actions: ${conv.metadata.next_actions.length} actions`);
          }
        }
        console.log('');
      });
    }
  }

  // 3. Extract timestamp from request ID and show time range
  console.log('\n\n⏰ 3. Request Timeline Analysis');
  console.log('-'.repeat(80));
  
  // REQUEST_ID is guaranteed to be defined here due to early exit check above
  const timestampMatch = REQUEST_ID!.match(/req_(\d+)_/);
  if (timestampMatch) {
    const timestamp = parseInt(timestampMatch[1], 10);
    const requestTime = new Date(timestamp);
    console.log(`   Request Time: ${requestTime.toISOString()}`);
    console.log(`   Request Time (Local): ${requestTime.toLocaleString()}`);
    
    // Check for logs around this time
    const timeWindowStart = new Date(timestamp - 60000); // 1 minute before
    const timeWindowEnd = new Date(timestamp + 60000);   // 1 minute after
    
    const { data: nearbyLogs, error: nearbyError } = await supabase
      .from('request_logs')
      .select('request_id, path, status, created_at')
      .gte('created_at', timeWindowStart.toISOString())
      .lte('created_at', timeWindowEnd.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (!nearbyError && nearbyLogs && nearbyLogs.length > 0) {
      console.log(`\n   Nearby requests (±1 minute):`);
      nearbyLogs.forEach(log => {
        const isMatch = log.request_id === REQUEST_ID;
        const marker = isMatch ? '👉' : '  ';
        console.log(`   ${marker} ${log.request_id} - ${log.path} - ${log.status} - ${new Date(log.created_at).toISOString()}`);
      });
    }
  } else {
    console.log('⚠️  Could not extract timestamp from request ID');
  }

  // 4. Summary and recommendations
  console.log('\n\n📊 4. Diagnosis Summary');
  console.log('='.repeat(80));
  
  if (requestLogs && requestLogs.length > 0) {
    const log = requestLogs[0];
    console.log(`\n✅ Request was logged`);
    console.log(`   Status: ${log.status} ${getStatusLabel(log.status)}`);
    console.log(`   Duration: ${log.duration}ms`);
    
    if (log.status >= 400) {
      console.log(`\n❌ Request failed with status ${log.status}`);
      
      if (log.error_message) {
        console.log(`\n   Error Analysis:`);
        
        // Analyze error message
        const errorMsg = log.error_message.toLowerCase();
        
        if (errorMsg.includes('llm_api_key') || errorMsg.includes('api key') || errorMsg.includes('not configured')) {
          console.log(`   🔴 Configuration Error: Missing or invalid LLM_API_KEY`);
          console.log(`      Fix: Check environment variables in deployment`);
          console.log(`      Check: Vercel Dashboard → Settings → Environment Variables`);
        }
        
        if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
          console.log(`   🔴 Authentication Error: Invalid API key`);
          console.log(`      Fix: Verify LLM_API_KEY is correct and not expired`);
        }
        
        if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
          console.log(`   🟡 Rate Limit Error: Too many requests`);
          console.log(`      Fix: Wait and retry, or upgrade API plan`);
        }
        
        if (errorMsg.includes('timeout') || errorMsg.includes('504')) {
          console.log(`   🟡 Timeout Error: Request took too long`);
          console.log(`      Fix: Check LLM provider status, increase timeout if needed`);
        }
        
        if (errorMsg.includes('500') || errorMsg.includes('502') || errorMsg.includes('503')) {
          console.log(`   🔴 Provider Error: LLM provider API issue`);
          console.log(`      Fix: Check provider status page, wait for recovery`);
        }
      }
      
      if (log.error_stack) {
        console.log(`\n   Stack Trace Available: Check full error_stack in database`);
      }
    } else {
      console.log(`\n✅ Request succeeded`);
    }
  } else {
    console.log(`\n⚠️  Request was not logged`);
    console.log(`   Possible reasons:`);
    console.log(`   - Request failed before logging could occur`);
    console.log(`   - Request was made before request_logs table existed`);
    console.log(`   - Request ID is incorrect`);
    console.log(`\n   Next steps:`);
    console.log(`   - Check Vercel logs for this request ID`);
    console.log(`   - Check application logs for [AI_ADVISOR] entries`);
    console.log(`   - Verify request ID format: req_{timestamp}_{random}`);
  }
  
  if (matchingConversations && matchingConversations.length > 0) {
    console.log(`\n✅ Conversation messages were stored`);
    console.log(`   Found ${matchingConversations.length} message(s) in database`);
  } else {
    console.log(`\n⚠️  No conversation messages found`);
    console.log(`   Request may have failed before storing conversation`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📝 Next Steps:');
  console.log('   1. Check Vercel deployment logs for this request ID');
  console.log('   2. Search logs for [AI_ADVISOR] entries with this requestId');
  console.log('   3. Verify environment variables are set correctly');
  console.log('   4. Check LLM provider status page');
  console.log('   5. Review error taxonomy documentation:');
  console.log('      documentation/ai-advisor/ERROR_TAXONOMY.md');
  console.log('\n');
}

function getStatusLabel(status: number): string {
  if (status >= 200 && status < 300) return '✅ Success';
  if (status >= 300 && status < 400) return '🔄 Redirect';
  if (status >= 400 && status < 500) return '❌ Client Error';
  if (status >= 500) return '🔴 Server Error';
  return '❓ Unknown';
}

// Run diagnosis
diagnoseRequest().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
