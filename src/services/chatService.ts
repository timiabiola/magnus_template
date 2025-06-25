import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.enlightenedmediacollective.com/webhook/df1ffdf6-241c-4b39-9def-88ad5add8675';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Extract content from N8N/Airtable response
const extractContent = (responseData: any): string => {
  console.log('🔍 Extracting content from response:', responseData);
  
  // Handle array responses (typical Airtable format)
  if (Array.isArray(responseData) && responseData.length > 0) {
    const firstItem = responseData[0];
    
    // Check for Airtable record structure
    if (firstItem && firstItem.fields && firstItem.fields.Content) {
      console.log('✅ Found Airtable Content field');
      return firstItem.fields.Content;
    }
    
    // Check for other content fields in array items
    if (firstItem && typeof firstItem === 'object') {
      const contentFields = ['content', 'message', 'text', 'body', 'output'];
      for (const field of contentFields) {
        if (firstItem[field] && typeof firstItem[field] === 'string') {
          console.log(`✅ Found content in field: ${field}`);
          return firstItem[field];
        }
      }
    }
  }
  
  // Handle object responses
  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    // Check for Airtable record structure
    if (responseData.fields && responseData.fields.Content) {
      console.log('✅ Found Airtable Content field in object');
      return responseData.fields.Content;
    }
    
    // Check for other content fields
    const contentFields = ['content', 'message', 'text', 'body', 'output'];
    for (const field of contentFields) {
      if (responseData[field] && typeof responseData[field] === 'string') {
        console.log(`✅ Found content in field: ${field}`);
        return responseData[field];
      }
    }
  }
  
  // Handle string responses
  if (typeof responseData === 'string' && responseData.trim()) {
    console.log('✅ Returning string response');
    return responseData;
  }
  
  console.log('❌ No extractable content found, returning formatted response');
  return JSON.stringify(responseData, null, 2);
};

export const sendMessageToWebhook = async (content: string, sessionId: string, retryCount = 0): Promise<any> => {
  try {
    console.log(`📤 Sending message to webhook (attempt ${retryCount + 1}):`, content);
    
    const queryParams = new URLSearchParams({
      UUID: sessionId,
      message: content
    }).toString();

    const response = await axios.get(`${N8N_WEBHOOK_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 40000 // 40 seconds timeout
    });

    console.log("📦 Raw webhook response:", response.data);
    
    // Extract the actual content from the response
    const extractedContent = extractContent(response.data);
    console.log("🎯 Extracted content:", extractedContent.substring(0, 100) + '...');
    
    return extractedContent;
  } catch (error) {
    console.error(`❌ Error in attempt ${retryCount + 1}:`, error);
    
    if (axios.isAxiosError(error) && error.response?.status === 500) {
      const errorData = error.response.data;
      console.log("Server error response:", errorData);
      
      if (errorData?.message?.includes("Workflow could not be started")) {
        throw new Error("The n8n workflow could not be started. Please check if the workflow is active and properly configured.");
      }
    }
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY * (retryCount + 1));
      return sendMessageToWebhook(content, sessionId, retryCount + 1);
    }
    
    throw error;
  }
};
