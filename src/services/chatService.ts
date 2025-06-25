import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.enlightenedmediacollective.com/webhook/df1ffdf6-241c-4b39-9def-88ad5add8675';
const MAX_RETRIES = 1; // Reduced from 2 to 1 to minimize duplicates
const RETRY_DELAY = 2000; // Increased to 2 seconds

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Track recent requests to prevent duplicates
const recentRequests = new Map<string, number>();
const REQUEST_COOLDOWN = 10000; // Increased to 10 seconds cooldown

const generateRequestKey = (content: string, sessionId: string): string => {
  // Create a stable key based on content and session, NOT timestamp
  const contentHash = content.trim().toLowerCase().substring(0, 100);
  return `${sessionId}-${contentHash}`;
};

const isRecentDuplicate = (content: string, sessionId: string): boolean => {
  const now = Date.now();
  const requestKey = generateRequestKey(content, sessionId);
  const lastRequest = recentRequests.get(requestKey);
  
  if (lastRequest && now - lastRequest < REQUEST_COOLDOWN) {
    console.log(`Duplicate detected: "${content.substring(0, 30)}..." was sent ${Math.round((now - lastRequest) / 1000)}s ago`);
    return true;
  }
  
  recentRequests.set(requestKey, now);
  
  // Cleanup old entries
  for (const [key, timestamp] of recentRequests.entries()) {
    if (now - timestamp > REQUEST_COOLDOWN * 2) {
      recentRequests.delete(key);
    }
  }
  
  return false;
};

// Track ongoing requests to prevent concurrent duplicates
const ongoingRequests = new Set<string>();

const extractN8NAutomationOutput = (responseData: any): any => {
  console.log('🔍 Processing N8N response:', responseData);
  
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
      console.log('🚫 Filtered out automated N8N message');
      return null; // Return null to indicate this should be ignored
    }
    
    // Return the actual response content
    console.log('✅ Returning string response');
    return response;
  }
  
  // If response is an array, check for Airtable records or other array structures
  if (Array.isArray(responseData)) {
    console.log(`📚 Processing array response with ${responseData.length} items`);
    
    for (let i = 0; i < responseData.length; i++) {
      const item = responseData[i];
      console.log(`🔍 Checking array item ${i}:`, typeof item);
      
      // Check for Airtable record structure
      if (item && typeof item === 'object' && item.fields && item.fields.Content) {
        console.log('🎯 Found Airtable record with Content field!');
        return item.fields.Content;
      }
      
      // Check for other common content fields in array items
      if (item && typeof item === 'object') {
        const contentFields = ['content', 'Content', 'message', 'text', 'body', 'data', 'output', 'result'];
        for (const field of contentFields) {
          if (item[field] && typeof item[field] === 'string' && item[field].trim()) {
            console.log(`✅ Found content in array item field: ${field}`);
            return item[field];
          }
        }
      }
      
      // If array item is a string, check it
      if (typeof item === 'string' && item.trim()) {
        const extractedFromString = extractN8NAutomationOutput(item);
        if (extractedFromString !== null) {
          console.log('✅ Extracted content from array string item');
          return extractedFromString;
        }
      }
    }
    
    console.log('❌ No valid content found in array items');
    return null;
  }
  
  // If response is an object, look for N8N workflow output fields
  if (typeof responseData === 'object' && responseData !== null) {
    console.log(`📦 Processing object response with keys: [${Object.keys(responseData).join(', ')}]`);
    
    // Check for Airtable record structure first
    if (responseData.fields && responseData.fields.Content) {
      console.log('🎯 Found Airtable record with Content field!');
      return responseData.fields.Content;
    }
    
    // Common N8N output field names (prioritized list)
    const n8nOutputFields = [
      'Content',        // Airtable Content field
      'content',        // Common content field
      'body',           // HTTP Request node output
      'data',           // General data field
      'output',         // Workflow output
      'result',         // Function result
      'response',       // API response
      'message',        // Message field
      'text',           // Text output
      'automation_output', // Custom field
      'workflow_result'    // Custom field
    ];
    
    // Try to find the actual automation output
    for (const field of n8nOutputFields) {
      if (responseData[field] !== undefined && responseData[field] !== null) {
        console.log(`🔍 Found field "${field}" with type: ${typeof responseData[field]}`);
        
        // If it's a string and not empty, return it
        if (typeof responseData[field] === 'string' && responseData[field].trim()) {
          console.log(`✅ Returning content from field: ${field}`);
          return responseData[field];
        }
        
        // If it's an object or array, recursively process it
        const fieldContent = extractN8NAutomationOutput(responseData[field]);
        if (fieldContent !== null) {
          console.log(`✅ Extracted content from nested field: ${field}`);
          return fieldContent;
        }
      }
    }
    
    // If we have a non-empty object with no recognized fields, stringify it
    if (Object.keys(responseData).length > 0) {
      console.log('📄 Returning formatted object response as fallback');
      return JSON.stringify(responseData, null, 2);
    }
  }
  
  console.log('❌ No valid N8N automation output found');
  return null;
};

export const sendMessageToWebhook = async (content: string, sessionId: string, retryCount = 0): Promise<any> => {
  const requestKey = generateRequestKey(content, sessionId);
  
  // Prevent duplicate requests (both recent duplicates and concurrent requests)
  if (retryCount === 0) {
    if (isRecentDuplicate(content, sessionId)) {
      console.log('Recent duplicate request detected, skipping...');
      throw new Error('Duplicate request detected. Please wait before sending another message.');
    }
    
    if (ongoingRequests.has(requestKey)) {
      console.log('Concurrent duplicate request detected, skipping...');
      throw new Error('This message is already being processed. Please wait.');
    }
    
    ongoingRequests.add(requestKey);
  }

  try {
    console.log(`Sending message to webhook (attempt ${retryCount + 1}):`, content);
    console.log(`Request key: ${requestKey}`);
    
    const queryParams = new URLSearchParams({
      UUID: sessionId,
      message: content,
      timestamp: Date.now().toString() // Add timestamp for N8N tracking
    }).toString();

    const response = await axios.get(`${N8N_WEBHOOK_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestKey // Add request ID for tracking
      },
      timeout: 30000 // Reduced timeout to 30 seconds
    });

    console.log("Raw webhook response:", response.data);
    
    // Extract the actual automation output
    const automationOutput = extractN8NAutomationOutput(response.data);
    
    if (automationOutput === null) {
      // If no valid output found, return a default message
      console.log('No automation output found, using default message');
      return 'Message processed successfully.';
    }
    
    console.log("Extracted automation output:", automationOutput);
    return automationOutput;
    
  } catch (error) {
    console.error(`Error in attempt ${retryCount + 1}:`, error);
    
    if (axios.isAxiosError(error)) {
      // Don't retry on client errors (4xx) to prevent duplicates
      if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        throw new Error(`Request failed: ${error.response.status} ${error.response.statusText}`);
      }
      
      if (error.response?.status === 500) {
        const errorData = error.response.data;
        console.log("Server error response:", errorData);
        
        if (errorData?.message?.includes("Workflow could not be started")) {
          throw new Error("The n8n workflow could not be started. Please check if the workflow is active and properly configured.");
        }
      }
    }
    
    // Only retry on network errors or 5xx server errors
    if (retryCount < MAX_RETRIES && 
        (axios.isAxiosError(error) && (!error.response || error.response.status >= 500))) {
      console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY * (retryCount + 1));
      return sendMessageToWebhook(content, sessionId, retryCount + 1);
    }
    
    throw error;
  } finally {
    // Always clean up ongoing request tracking
    if (retryCount === 0) {
      ongoingRequests.delete(requestKey);
    }
  }
};
