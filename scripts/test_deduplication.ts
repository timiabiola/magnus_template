/**
 * Test script to verify webhook deduplication logic
 * Simulates rapid multiple calls to ensure only one goes through
 */

import { sendMessageToWebhook } from '../src/services/chatService';

interface TestResult {
  success: boolean;
  request: number;
  result?: any;
  error?: string;
}

async function testDeduplication() {
  console.log('🧪 Testing webhook deduplication logic...\n');
  
  const testMessage = "test duplicate message";
  const sessionId = "test-session-123";
  
  console.log(`📝 Test message: "${testMessage}"`);
  console.log(`🆔 Session ID: ${sessionId}`);
  console.log('⏱️  Sending 3 rapid requests...\n');
  
  const promises: Promise<TestResult>[] = [];
  
  // Send 3 rapid requests (should only execute 1)
  for (let i = 0; i < 3; i++) {
    console.log(`🚀 Starting request ${i + 1}`);
    promises.push(
      sendMessageToWebhook(testMessage, sessionId)
        .then(result => {
          console.log(`✅ Request ${i + 1} succeeded:`, result);
          return { success: true, request: i + 1, result };
        })
        .catch(error => {
          console.log(`🚫 Request ${i + 1} blocked:`, error.message);
          return { success: false, request: i + 1, error: error.message };
        })
    );
  }
  
  console.log('⏳ Waiting for all requests to complete...\n');
  
  const results = await Promise.all(promises);
  
  console.log('📊 Results Summary:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const blocked = results.filter(r => !r.success);
  
  console.log(`✅ Successful requests: ${successful.length}`);
  console.log(`🚫 Blocked requests: ${blocked.length}`);
  
  if (successful.length === 1 && blocked.length === 2) {
    console.log('\n🎉 TEST PASSED: Deduplication working correctly!');
    console.log('   - Only 1 request went through');
    console.log('   - 2 requests were properly blocked');
  } else {
    console.log('\n❌ TEST FAILED: Deduplication not working correctly!');
    console.log(`   - Expected: 1 success, 2 blocked`);
    console.log(`   - Actual: ${successful.length} success, ${blocked.length} blocked`);
  }
  
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    console.log(`   Request ${index + 1}: ${result.success ? '✅ Success' : '🚫 Blocked'}`);
    if (!result.success && result.error) {
      console.log(`      Reason: ${result.error}`);
    }
  });
  
  // Test with different message after delay
  console.log('\n⏰ Waiting 12 seconds before testing different message...');
  await new Promise(resolve => setTimeout(resolve, 12000));
  
  console.log('\n🔄 Testing with different message (should work)...');
  try {
    const result = await sendMessageToWebhook("different message", sessionId);
    console.log('✅ Different message sent successfully:', result);
  } catch (error) {
    console.log('❌ Different message failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDeduplication().catch(console.error);
}

export { testDeduplication }; 