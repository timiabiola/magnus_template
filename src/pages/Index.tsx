import React from 'react';
import ChatInterface from '@/components/ChatInterface';
import ParticleBackground from '@/components/ParticleBackground';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Database } from 'lucide-react';
const Index = () => {
  const handleDatabaseAccess = () => {
    window.open('https://airtable.com/apps9KndwF64mWHyK/paghTVLJOKqKZoGmq?911G4%3Asort=eyJwZWxKYlRQNndlaHdVY284WCI6eyJjb2x1bW5JZCI6ImZsZFZid2lsYjhnMHQxNXNnIiwiYXNjZW5kaW5nIjpmYWxzZX19', '_blank', 'noopener,noreferrer');
  };
  return <div className="flex flex-col min-h-[100vh] p-4">
      {/* Background particles */}
      <ParticleBackground />
      
      {/* Main content */}
      <div className="flex-1 w-full max-w-4xl mx-auto">
        
        <ChatInterface />
      </div>
      
      {/* Footer with attribution and database access */}
      <footer className="text-center text-xs text-muted-foreground mt-4 flex flex-col items-center justify-center gap-2">
        
        <Button onClick={handleDatabaseAccess} variant="outline" size="sm" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Access the Database
        </Button>
      </footer>
    </div>;
};
export default Index;