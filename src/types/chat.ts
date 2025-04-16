
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sessionId: string;
}

export interface ChatHook {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  sessionId: string;
}
