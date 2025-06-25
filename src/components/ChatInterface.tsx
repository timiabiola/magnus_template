
import React, { useRef, useEffect } from 'react';
import useChat from '@/hooks/useChat';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { Button } from '@/components/ui/button';
import { Trash2, Info, AlertTriangle, Database, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const ChatInterface: React.FC = () => {
  const {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    sessionId
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [messages]);
  
  const handleDatabaseAccess = () => {
    window.open('https://airtable.com/apps9KndwF64mWHyK/paghTVLJOKqKZoGmq?911G4%3Asort=eyJwZWxKYlRQNndlaHdVY284WCI6eyJjb2x1bW5JZCI6ImZsZFZid2lsYjhnMHQxNXNnIiwiYXNjZW5kaW5nIjpmYWxzZX19', '_blank', 'noopener,noreferrer');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        description: "You have been logged out successfully",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        description: "Failed to log out. Please try again.",
      });
    }
  };
  
  return <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Header with session ID */}
      <div className="glass-morphism px-4 mb-4 flex flex-col items-center gap-2 py-2 rounded-md">
        <div className="flex w-full justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="flex items-center gap-1.5 hover:bg-destructive/10 transition-colors"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Log out</span>
          </Button>
          
          <h1 className="text-xl font-semibold text-gradient-primary">Magnus the Eloquent</h1>
          
          <Button variant="ghost" size="icon" onClick={clearMessages} className="h-6 w-6 rounded-full hover:bg-destructive/10 transition-colors" aria-label="Clear chat history">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                
                
                
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Full Session ID: {sessionId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button onClick={handleDatabaseAccess} variant="outline" size="sm" className="flex items-center gap-2 py-1 mb-1 mt-auto">
          <Database className="h-4 w-4" />
          Access the Database
        </Button>
      </div>

      {/* Error message */}
      {error && <Alert className="mb-4 border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>}

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-none space-y-4">
        {messages.length === 0 ? <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-center animate-pulse-slow">
              Send a message to start chatting
              <br />
              
            </p>
          </div> : messages.map(message => <ChatMessage key={message.id} message={message} />)}
        <div ref={messagesEndRef} />
      </div>

      {/* Database access button above input */}
      <div className="mb-2">
        <Button onClick={handleDatabaseAccess} variant="outline" size="sm" className="flex items-center gap-2 w-full">
          <Database className="h-4 w-4" />
          Access the Database
        </Button>
      </div>

      {/* Input area */}
      <div className="mt-4 pb-4">
        <ChatInput onSendMessage={sendMessage} isLoading={loading} />
      </div>
    </div>;
};
export default ChatInterface;
