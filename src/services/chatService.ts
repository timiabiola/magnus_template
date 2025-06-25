import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.enlightenedmediacollective.com/webhook/df1ffdf6-241c-4b39-9def-88ad5add8675';
const MAX_RETRIES = 0; // NO RETRIES - Fixes duplicate calls
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Prevent concurrent duplicate requests
const activeRequests = new Map<string, boolean>();

// Simple, direct extraction
const extractContent = (responseData: any): string => {
  console.log('📥 Extracting from:', JSON.stringify(responseData).substring(0, 200));
  
  // Direct Airtable format
  if (Array.isArray(responseData) && responseData[0]?.fields?.Content) {
    return responseData[0].fields.Content;
  }
  
  // String response
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }
  
  // Fallback
  return 'Message processed successfully.';
};

export const sendMessageToWebhook = async (content: string, sessionId: string, retryCount = 0): Promise<any> => {
  const requestKey = `${sessionId}-${content}`;
  
  // Block duplicate requests
  if (activeRequests.get(requestKey)) {
    console.log('🚫 Blocking duplicate request');
    throw new Error('Request already in progress');
  }
  
  activeRequests.set(requestKey, true);
  
  try {
    console.log(`🚀 SENDING: ${new Date().toISOString()} - "${content}"`);
    
    const queryParams = new URLSearchParams({
      UUID: sessionId,
      message: content
    }).toString();

    const response = await axios.get(`${N8N_WEBHOOK_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // Reduced to 30 seconds
    });

    console.log('📦 RAW RESPONSE:', JSON.stringify(response.data).substring(0, 500));
    
    const extractedContent = extractContent(response.data);
    console.log('✅ EXTRACTED:', extractedContent.substring(0, 100));
    
    return extractedContent;
  } catch (error) {
    console.error('❌ ERROR:', error);
    throw error; // No retries, just throw
  } finally {
    // Always cleanup
    activeRequests.delete(requestKey);
  }
};
