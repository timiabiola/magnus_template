/**
 * Debug script to analyze N8N webhook response structure
 * This will help us understand the exact format of responses
 */

import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.enlightenedmediacollective.com/webhook/df1ffdf6-241c-4b39-9def-88ad5add8675';

async function debugN8NResponse() {
  console.log('🔍 Debugging N8N webhook response structure...\n');
  
  const testMessage = "debug test message";
  const sessionId = "debug-session-" + Date.now();
  
  console.log(`📝 Test message: "${testMessage}"`);
  console.log(`🆔 Session ID: ${sessionId}`);
  console.log(`🌐 Webhook URL: ${N8N_WEBHOOK_URL}`);
  
  try {
    const queryParams = new URLSearchParams({
      UUID: sessionId,
      message: testMessage,
      timestamp: Date.now().toString()
    }).toString();

    const fullUrl = `${N8N_WEBHOOK_URL}?${queryParams}`;
    console.log(`📡 Full request URL: ${fullUrl}\n`);

    console.log('⏳ Sending request...');
    const response = await axios.get(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': `debug-${Date.now()}`
      },
      timeout: 30000
    });

    console.log('\n✅ Response received!');
    console.log('='.repeat(60));
    console.log('📊 RESPONSE ANALYSIS:');
    console.log('='.repeat(60));
    
    console.log(`🔢 Status Code: ${response.status}`);
    console.log(`📋 Status Text: ${response.statusText}`);
    
    console.log('\n📦 Response Headers:');
    Object.entries(response.headers).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n📄 Raw Response Data:');
    console.log('Type:', typeof response.data);
    console.log('Value:', JSON.stringify(response.data, null, 2));
    
    console.log('\n🔍 Detailed Structure Analysis:');
    
    if (typeof response.data === 'string') {
      console.log('📝 String Response:');
      console.log(`   Length: ${response.data.length}`);
      console.log(`   First 200 chars: "${response.data.substring(0, 200)}..."`);
      console.log(`   Contains "API ran successfully": ${response.data.includes('API ran successfully')}`);
    } else if (Array.isArray(response.data)) {
      console.log('📚 Array Response:');
      console.log(`   Length: ${response.data.length}`);
      response.data.forEach((item, index) => {
        console.log(`   [${index}]:`, typeof item, JSON.stringify(item, null, 4));
      });
    } else if (typeof response.data === 'object' && response.data !== null) {
      console.log('📦 Object Response:');
      console.log(`   Keys: [${Object.keys(response.data).join(', ')}]`);
      
      Object.entries(response.data).forEach(([key, value]) => {
        console.log(`   ${key}:`, typeof value);
        if (typeof value === 'string' && value.length < 200) {
          console.log(`      Value: "${value}"`);
        } else if (typeof value === 'object') {
          console.log(`      Object keys: [${Object.keys(value || {}).join(', ')}]`);
        } else {
          console.log(`      Value: ${JSON.stringify(value)}`);
        }
      });
    } else {
      console.log('❓ Unknown Response Type:', response.data);
    }
    
    console.log('\n🎯 EXTRACTION SIMULATION:');
    console.log('='.repeat(40));
    
    // Simulate our extraction logic
    const testFields = [
      'body', 'data', 'output', 'result', 'response', 
      'content', 'message', 'text', 'automation_output', 'workflow_result'
    ];
    
    testFields.forEach(field => {
      if (response.data && typeof response.data === 'object' && response.data[field] !== undefined) {
        console.log(`✅ Found field "${field}":`, typeof response.data[field]);
        if (typeof response.data[field] === 'string' && response.data[field].length < 200) {
          console.log(`   Content: "${response.data[field]}"`);
        }
      } else {
        console.log(`❌ Field "${field}": not found`);
      }
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('='.repeat(30));
    
    if (typeof response.data === 'string') {
      console.log('📝 The response is a string - check if it contains the actual automation output');
    } else if (Array.isArray(response.data)) {
      console.log('📚 The response is an array - check first element for automation output');
    } else if (typeof response.data === 'object') {
      const keys = Object.keys(response.data || {});
      if (keys.length === 0) {
        console.log('📦 Empty object response - N8N might not be returning automation output');
      } else {
        console.log(`📦 Object with keys: ${keys.join(', ')} - check these for automation output`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (axios.isAxiosError(error)) {
      console.log(`Status: ${error.response?.status}`);
      console.log(`Status Text: ${error.response?.statusText}`);
      console.log(`Response Data:`, error.response?.data);
    } else {
      console.error(error);
    }
  }
}

// Run if called directly
if (require.main === module) {
  debugN8NResponse().catch(console.error);
}

export { debugN8NResponse }; 