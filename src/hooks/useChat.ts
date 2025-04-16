import { useState, useEffect, useCallback } from 'react';
import { getSessionUUID, generateUUID } from '@/utils/uuid';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sessionId: string;
}

interface ChatHook {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  sessionId: string;
}

const N8N_WEBHOOK_URL = 'https://n8n.enlightenedmediacollective.com/webhook/96c90609-027b-4c79-ae36-d7bd7eaa896e';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const formatResponse = (data: any): string => {
  if (typeof data === 'string') {
    // Split text by double newlines or ### to handle section headers
    const sections = data.split(/\n\n|(?=###)/);
    
    // Process each section and preserve intentional line breaks
    return sections
      .map(section => section.trim())
      .filter(section => section.length > 0)
      .join('\n\n');
  }
  
  const possibleFields = ['output', 'reply', 'response', 'message', 'text', 'content', 'result'];
  for (const field of possibleFields) {
    if (data[field]) {
      const content = data[field];
      if (typeof content === 'string') {
        return formatResponse(content); // Apply the same formatting to nested content
      }
      if (typeof content === 'object') {
        return JSON.stringify(content, null, 2);
      }
    }
  }
  
  return JSON.stringify(data, null, 2);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const useChat = (): ChatHook => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    loading: false,
    error: null,
    sessionId: getSessionUUID()
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages) as ChatMessage[];
        setState(prev => ({ ...prev, messages: parsedMessages }));
      } catch (error) {
        console.error('Error parsing stored messages:', error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive"
        });
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(state.messages));
  }, [state.messages]);

  const sendMessageWithRetry = async (content: string, retryCount = 0): Promise<any> => {
    try {
      console.log(`Sending message to webhook (attempt ${retryCount + 1}):`, content);
      
      const queryParams = new URLSearchParams({
        UUID: state.sessionId,
        message: content
      }).toString();

      const response = await axios.get(`${N8N_WEBHOOK_URL}?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 40000 // 40 seconds timeout
      });

      console.log("Webhook response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error in attempt ${retryCount + 1}:`, error);
      
      // Check if it's a 500 error from n8n
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        const errorData = error.response.data;
        console.log("Server error response:", errorData);
        
        // Specific error for n8n workflow errors
        if (errorData?.message?.includes("Workflow could not be started")) {
          throw new Error("The n8n workflow could not be started. Please check if the workflow is active and properly configured.");
        }
      }
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await delay(RETRY_DELAY * (retryCount + 1));
        return sendMessageWithRetry(content, retryCount + 1);
      }
      
      throw error;
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: generateUUID(),
      content,
      sender: 'user',
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      loading: true,
      error: null
    }));

    try {
      const data = await sendMessageWithRetry(content);
      
      if (!data) {
        throw new Error('Empty response from webhook');
      }

      const formattedResponse = formatResponse(data);
      console.log("Formatted response:", formattedResponse);

      if (!formattedResponse) {
        throw new Error('Could not format webhook response');
      }

      const assistantMessage: ChatMessage = {
        id: generateUUID(),
        content: formattedResponse,
        sender: 'assistant',
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        loading: false
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('timeout')) {
          errorMessage = 'Network error: The webhook is currently unreachable. Please check your connection or try again later.';
        } else if (error.message.includes('n8n workflow could not be started')) {
          errorMessage = 'The n8n workflow could not be started. Please check if the workflow is active and properly configured.';
        } else if (axios.isAxiosError(error) && error.response?.status === 500) {
          errorMessage = 'Server error (500): The n8n server encountered an error processing your request. Please try a different prompt or try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [state.sessionId, toast]);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: []
    }));
    toast({
      description: "Chat history cleared",
    });
  }, [toast]);

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    sendMessage,
    clearMessages,
    sessionId: state.sessionId
  };
};

export default useChat;
