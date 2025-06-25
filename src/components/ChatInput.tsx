import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSubmissionRef = useRef<number>(0);
  const lastMessageRef = useRef<string>('');

  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Reset submission state when loading changes
  useEffect(() => {
    if (!isLoading) {
      setIsSubmitting(false);
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    const messageToSend = message.trim();
    
    // Prevent empty messages
    if (!messageToSend) return;
    
    // Prevent submissions while loading or already submitting
    if (isLoading || isSubmitting) {
      console.log('🚫 Submission blocked: already processing');
      return;
    }
    
    // Prevent rapid duplicate submissions (same message within 3 seconds)
    if (
      messageToSend === lastMessageRef.current && 
      now - lastSubmissionRef.current < 3000
    ) {
      console.log('🚫 Duplicate submission blocked:', messageToSend);
      return;
    }
    
    // Prevent any submissions within 1 second of last submission
    if (now - lastSubmissionRef.current < 1000) {
      console.log('🚫 Rapid submission blocked');
      return;
    }
    
    console.log('✅ Submitting message:', messageToSend);
    
    // Set submission state and tracking
    setIsSubmitting(true);
    lastSubmissionRef.current = now;
    lastMessageRef.current = messageToSend;
    
    // Send the message
    onSendMessage(messageToSend);
    
    // Clear the input
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = isLoading || isSubmitting || disabled || !message.trim();

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-end w-full glass-morphism rounded-xl overflow-hidden">
        <Textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isSubmitting || disabled}
          className="min-h-10 max-h-40 glass-input border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none py-3 px-4 pr-14"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isDisabled}
          className="absolute right-2 bottom-2 h-8 w-8 bg-primary/90 hover:bg-primary rounded-full transition-colors"
        >
          {isLoading || isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
