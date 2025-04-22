import React from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Avatar } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
interface ChatMessageProps {
  message: ChatMessageType;
}
const ChatMessage: React.FC<ChatMessageProps> = ({
  message
}) => {
  const isUser = message.sender === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  return <div className={cn("flex gap-3 w-full max-w-3xl mx-auto px-4 animate-fade-in", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={cn("h-8 w-8 border", isUser ? "bg-primary/10 border-primary/20" : "bg-white/10 border-white/20")}>
          {isUser ? <User className="h-4 w-4 my-[7px] px-0 mx-[7px]" /> : <Bot className="h-4 w-4" />}
        </Avatar>
      </div>

      {/* Message bubble */}
      <div className={cn("glass-card p-3 rounded-xl my-1 max-w-[80%] animate-scale-in", isUser ? "rounded-tr-sm bg-primary/10" : "rounded-tl-sm")}>
        <div className="text-sm">{message.content}</div>
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {timestamp}
        </div>
      </div>
    </div>;
};
export default ChatMessage;