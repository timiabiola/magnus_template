import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.enlightenedmediacollective.com/webhook/df1ffdf6-241c-4b39-9def-88ad5add8675';
const MAX_RETRIES = 1; // Reduced from 2 to 1 to minimize duplicates
const RETRY_DELAY = 2000; // Increased to 2 seconds

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Track recent requests to prevent duplicates
const recentRequests = new Map<string, number>();
const REQUEST_COOLDOWN = 5000; // 5 seconds cooldown

const generateRequestKey = (content: string, sessionId: string): string => {
  return `${sessionId}-${content.substring(0, 50)}-${Date.now().toString().slice(-6)}`;
};

const isRecentDuplicate = (requestKey: string): boolean => {
  const now = Date.now();
  const lastRequest = recentRequests.get(requestKey);
  
  if (lastRequest && now - lastRequest < REQUEST_COOLDOWN) {
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

export const sendMessageToWebhook = async (content: string, sessionId: string, retryCount = 0): Promise<any> => {
  const requestKey = generateRequestKey(content, sessionId);
  
  // Prevent duplicate requests
  if (retryCount === 0 && isRecentDuplicate(requestKey)) {
    console.log('Duplicate request detected, skipping...');
    throw new Error('Duplicate request detected. Please wait before sending another message.');
  }

  try {
    console.log(`Sending message to webhook (attempt ${retryCount + 1}):`, content);
    
    const queryParams = new URLSearchParams({
      UUID: sessionId,
      message: content,
      timestamp: Date.now().toString() // Add timestamp for uniqueness
    }).toString();

    const response = await axios.get(`${N8N_WEBHOOK_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestKey // Add request ID for tracking
      },
      timeout: 30000 // Reduced timeout to 30 seconds
    });

    console.log("Webhook response:", response.data);
    
    // Check if response contains the automated message pattern
    if (typeof response.data === 'string' && response.data.includes('API ran successfully')) {
      console.log('Detected automated N8N response, filtering out...');
      return 'Message received and processed successfully.';
    }
    
    return response.data;
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
  }
};
