import { useState, useEffect, useCallback } from 'react';
import { getSessionUUID, generateUUID } from '@/utils/uuid';
import { useToast } from "@/components/ui/use-toast";
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

const N8N_WEBHOOK_URL = 'https://enlightenedinformatics.app.n8n.cloud/webhook/37e27a4b-c41c-4434-8e7e-66e2c8b23ca5';

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
      const queryParams = new URLSearchParams({
        UUID: state.sessionId,
        message: content
      }).toString();

      const response = await axios.get(`${N8N_WEBHOOK_URL}?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;
      
      const responseContent = data.output || data.reply || "I didn't understand that.";
      
      const assistantMessage: ChatMessage = {
        id: generateUUID(),
        content: responseContent,
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
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to send message. Please try again.'
      }));

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
