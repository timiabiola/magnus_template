
import React from 'react';
import ChatInterface from '@/components/ChatInterface';
import ParticleBackground from '@/components/ParticleBackground';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-[100vh] p-4">
      {/* Background particles */}
      <ParticleBackground />
      
      {/* Main content */}
      <div className="flex-1 w-full max-w-4xl mx-auto">
        <Alert className="mb-4 border-blue-500/20 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            This chat interface connects to an n8n webhook. Type a message and the webhook will process it.
          </AlertDescription>
        </Alert>
        <ChatInterface />
      </div>
      
      {/* Footer with attribution */}
      <footer className="text-center text-xs text-muted-foreground mt-4">
        <p>n8n Webhook Chat Interface</p>
      </footer>
    </div>
  );
};

export default Index;
