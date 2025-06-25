import dotenv from 'dotenv';
dotenv.config();

// Test different N8N response formats to ensure proper extraction
const testResponses = [
  {
    name: "Simple String Response",
    data: "This is the actual automation output from my N8N workflow",
    expected: "This is the actual automation output from my N8N workflow"
  },
  {
    name: "Object with 'body' field (HTTP Request node)",
    data: { body: "Response from API call in N8N automation" },
    expected: "Response from API call in N8N automation"
  },
  {
    name: "Object with 'data' field",
    data: { data: "Processed data from N8N workflow" },
    expected: "Processed data from N8N workflow"
  },
  {
    name: "Object with 'output' field",
    data: { output: "Final output of N8N automation" },
    expected: "Final output of N8N automation"
  },
  {
    name: "Nested object response",
    data: { 
      status: "success",
      result: {
        data: "Nested automation result"
      }
    },
    expected: "Nested automation result"
  },
  {
    name: "Array response",
    data: [{ message: "First item in array response" }],
    expected: "First item in array response"
  },
  {
    name: "Automated N8N message (should be filtered)",
    data: "API ran successfully! But most people miss this next step.",
    expected: null
  },
  {
    name: "Complex object without recognized fields",
    data: { 
      custom_field: "Some value",
      another_field: "Another value"
    },
    expected: '{\n  "custom_field": "Some value",\n  "another_field": "Another value"\n}'
  }
];

// Import the extraction function (we'll need to mock it for testing)
const extractN8NAutomationOutput = (responseData: any): any => {
  console.log('Processing N8N response:', responseData);
  
  // If response is a string, check for various patterns
  if (typeof responseData === 'string') {
    const response = responseData.trim();
    
    // Filter out generic N8N success messages
    const automatedPatterns = [
      /API ran successfully/i,
      /Update the PROMPT in your URL/i,
      /no need to restart or troubleshoot/i,
      /Make this simple change and keep building/i
    ];
    
    const isAutomatedMessage = automatedPatterns.some(pattern => pattern.test(response));
    
    if (isAutomatedMessage) {
      console.log('Filtered out automated N8N message');
      return null; // Return null to indicate this should be ignored
    }
    
    // Return the actual response content
    return response;
  }
  
  // If response is an object, look for N8N workflow output fields
  if (typeof responseData === 'object' && responseData !== null) {
    // Common N8N output field names
    const n8nOutputFields = [
      'body',           // HTTP Request node output
      'data',           // General data field
      'output',         // Workflow output
      'result',         // Function result
      'response',       // API response
      'content',        // Content field
      'message',        // Message field
      'text',           // Text output
      'automation_output', // Custom field
      'workflow_result'    // Custom field
    ];
    
    // Try to find the actual automation output
    for (const field of n8nOutputFields) {
      if (responseData[field] !== undefined && responseData[field] !== null) {
        console.log(`Found N8N output in field: ${field}`);
        
        // Recursively process the field content
        const fieldContent = extractN8NAutomationOutput(responseData[field]);
        if (fieldContent !== null) {
          return fieldContent;
        }
      }
    }
    
    // If it's an array, try to extract from the first item
    if (Array.isArray(responseData) && responseData.length > 0) {
      console.log('Processing N8N array response');
      return extractN8NAutomationOutput(responseData[0]);
    }
    
    // If we have a non-empty object with no recognized fields, stringify it
    if (Object.keys(responseData).length > 0) {
      console.log('Returning formatted object response');
      return JSON.stringify(responseData, null, 2);
    }
  }
  
  console.log('No valid N8N automation output found');
  return null;
};

const runTests = () => {
  console.log('🧪 Testing N8N Response Extraction\n');
  
  let passed = 0;
  let failed = 0;
  
  testResponses.forEach((test, index) => {
    console.log(`\n${index + 1}. Testing: ${test.name}`);
    console.log(`Input:`, test.data);
    
    const result = extractN8NAutomationOutput(test.data);
    console.log(`Output:`, result);
    console.log(`Expected:`, test.expected);
    
    const success = result === test.expected;
    console.log(success ? '✅ PASS' : '❌ FAIL');
    
    if (success) {
      passed++;
    } else {
      failed++;
      console.log(`   Expected: ${test.expected}`);
      console.log(`   Got: ${result}`);
    }
  });
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! N8N response extraction is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the extraction logic.');
  }
};

// Tips for N8N workflow configuration
const showN8NTips = () => {
  console.log('\n💡 N8N Workflow Configuration Tips:');
  console.log('');
  console.log('To ensure your automation output is properly captured:');
  console.log('');
  console.log('1. 📤 Return Response Node:');
  console.log('   - Add a "Respond to Webhook" node at the end of your workflow');
  console.log('   - Set the response body to your desired output');
  console.log('   - Example: {{ $json.your_automation_result }}');
  console.log('');
  console.log('2. 🎯 Use Standard Field Names:');
  console.log('   - body, data, output, result, response, content, message, text');
  console.log('   - These are automatically detected by the extraction logic');
  console.log('');
  console.log('3. 🚫 Avoid Generic Messages:');
  console.log('   - The system filters out "API ran successfully" type messages');
  console.log('   - Return your actual automation results instead');
  console.log('');
  console.log('4. 🔍 Debug Your Workflow:');
  console.log('   - Check browser console for "Raw webhook response" logs');
  console.log('   - Check browser console for "Extracted automation output" logs');
  console.log('');
  console.log('5. 🧪 Test Your Responses:');
  console.log('   - Run this script to test different response formats');
  console.log('   - npm run test-n8n-responses');
};

// Run tests if this file is executed directly
runTests();
showN8NTips();

export { extractN8NAutomationOutput, runTests, showN8NTips }; 