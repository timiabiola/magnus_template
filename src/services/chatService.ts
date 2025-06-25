import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.enlightenedmediacollective.com/webhook/df1ffdf6-241c-4b39-9def-88ad5add8675';
const MAX_RETRIES = 0; // NO RETRIES - Fixes duplicate calls
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Prevent concurrent duplicate requests
const activeRequests = new Map<string, boolean>();

// Track recent requests to prevent duplicates even after completion
const recentRequests = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 60000; // 60 seconds window to prevent duplicates

// Clean up old entries periodically
const cleanupRecentRequests = () => {
  const now = Date.now();
  for (const [key, timestamp] of recentRequests.entries()) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      recentRequests.delete(key);
    }
  }
};

// Simple, direct extraction with line break normalization
const extractContent = (responseData: any): string => {
  console.log('📥 Extracting from:', JSON.stringify(responseData).substring(0, 200));
  
  // Direct Airtable format
  if (Array.isArray(responseData) && responseData[0]?.fields?.Content) {
    let content = responseData[0].fields.Content;
    
    // Normalize line breaks (handle Windows \r\n, Mac \r, and Unix \n)
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Log for debugging
    console.log('📝 Extracted content has', (content.match(/\n/g) || []).length, 'line breaks');
    console.log('📝 First 100 chars:', content.substring(0, 100).replace(/\n/g, '\\n'));
    
    return content;
  }
  
  // String response
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
  
  // Fallback
  return 'Message processed successfully.';
};

export const sendMessageToWebhook = async (content: string, sessionId: string, retryCount = 0): Promise<any> => {
  const requestKey = `${sessionId}-${content}`;
  const now = Date.now();
  
  // Clean up old entries
  cleanupRecentRequests();
  
  // Check if this exact request was made recently
  const lastRequestTime = recentRequests.get(requestKey);
  if (lastRequestTime && (now - lastRequestTime < DUPLICATE_WINDOW_MS)) {
    console.log(`🚫 Blocking duplicate request - last sent ${Math.round((now - lastRequestTime) / 1000)}s ago`);
    throw new Error('Duplicate request - please wait before sending the same message again');
  }
  
  // Block concurrent requests
  if (activeRequests.get(requestKey)) {
    console.log('🚫 Blocking concurrent duplicate request');
    throw new Error('Request already in progress');
  }
  
  activeRequests.set(requestKey, true);
  recentRequests.set(requestKey, now);
  
  try {
    console.log(`🚀 SENDING: ${new Date().toISOString()} - "${content}"`);
    
    const timestamp = Date.now().toString();
    const queryParams = new URLSearchParams({
      UUID: sessionId,
      message: content,
      timestamp: timestamp
    }).toString();

    const response = await axios.get(`${N8N_WEBHOOK_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': `${sessionId}-${content}-${timestamp}` // Add unique header
      },
      timeout: 120000 // 2 minutes for complex operations like LinkedIn posts
    });

    console.log('📦 RAW RESPONSE:', JSON.stringify(response.data).substring(0, 500));
    
    const extractedContent = extractContent(response.data);
    console.log('✅ EXTRACTED:', extractedContent.substring(0, 100));
    
    return extractedContent;
  } catch (error) {
    console.error('❌ ERROR:', error);
    // Remove from recent requests on error to allow retry after some time
    if (error instanceof Error && !error.message.includes('Duplicate request')) {
      recentRequests.delete(requestKey);
    }
    throw error; // No retries, just throw
  } finally {
    // Always cleanup active requests
    activeRequests.delete(requestKey);
  }
};
