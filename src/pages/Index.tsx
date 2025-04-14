import React from 'react';
import ChatInterface from '@/components/ChatInterface';
import ParticleBackground from '@/components/ParticleBackground';

const Index = () => {
  return (
    <div className="flex flex-col min-h-[100vh] p-4">
      {/* Background particles */}
      <ParticleBackground />
      
      {/* Main content */}
      <div className="flex-1 w-full max-w-4xl mx-auto">
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
