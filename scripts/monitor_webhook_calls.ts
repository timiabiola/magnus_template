import dotenv from 'dotenv';
dotenv.config();

// Simple webhook call monitor to help debug duplicate issues
const webhookCalls: Array<{
  timestamp: number;
  message: string;
  sessionId: string;
  attempt: number;
}> = [];

const logWebhookCall = (message: string, sessionId: string, attempt: number = 1) => {
  const call = {
    timestamp: Date.now(),
    message: message.substring(0, 50), // First 50 chars
    sessionId: sessionId.substring(0, 8), // First 8 chars
    attempt
  };
  
  webhookCalls.push(call);
  console.log(`[${new Date().toISOString()}] Webhook Call #${webhookCalls.length}:`, call);
  
  // Check for recent duplicates
  const recentCalls = webhookCalls.filter(c => call.timestamp - c.timestamp < 10000); // Last 10 seconds
  const duplicates = recentCalls.filter(c => 
    c.message === call.message && 
    c.sessionId === call.sessionId && 
    c !== call
  );
  
  if (duplicates.length > 0) {
    console.warn(`⚠️  POTENTIAL DUPLICATE DETECTED! ${duplicates.length} similar calls in last 10 seconds`);
    duplicates.forEach((dup, i) => {
      console.warn(`   Duplicate ${i + 1}:`, dup);
    });
  }
  
  // Keep only last 100 calls to prevent memory issues
  if (webhookCalls.length > 100) {
    webhookCalls.splice(0, webhookCalls.length - 100);
  }
};

const analyzeCallPatterns = () => {
  console.log('\n📊 Webhook Call Analysis:');
  console.log(`Total calls: ${webhookCalls.length}`);
  
  if (webhookCalls.length === 0) {
    console.log('No calls recorded yet.');
    return;
  }
  
  // Group by session
  const sessionGroups = new Map();
  webhookCalls.forEach(call => {
    const key = call.sessionId;
    if (!sessionGroups.has(key)) {
      sessionGroups.set(key, []);
    }
    sessionGroups.get(key).push(call);
  });
  
  console.log(`Sessions: ${sessionGroups.size}`);
  
  // Check for rapid successive calls (potential duplicates)
  let rapidCalls = 0;
  for (let i = 1; i < webhookCalls.length; i++) {
    if (webhookCalls[i].timestamp - webhookCalls[i-1].timestamp < 2000) { // Less than 2 seconds apart
      rapidCalls++;
    }
  }
  
  console.log(`Rapid successive calls (< 2s apart): ${rapidCalls}`);
  
  // Show recent calls
  const recent = webhookCalls.slice(-5);
  console.log('\n🕐 Last 5 calls:');
  recent.forEach((call, i) => {
    console.log(`  ${i + 1}. [${new Date(call.timestamp).toLocaleTimeString()}] ${call.message}... (Session: ${call.sessionId}, Attempt: ${call.attempt})`);
  });
};

// Export for use in other modules
export { logWebhookCall, analyzeCallPatterns };

// CLI usage
if (require.main === module) {
  console.log('🔍 N8N Webhook Call Monitor');
  console.log('This script helps identify duplicate webhook calls causing multiple Airtable entries.');
  console.log('\nImport and use logWebhookCall() in your chat service to track calls.');
  console.log('\nExample usage:');
  console.log('  import { logWebhookCall } from "./scripts/monitor_webhook_calls";');
  console.log('  logWebhookCall(message, sessionId, attemptNumber);');
  
  // Run analysis if there are recorded calls
  analyzeCallPatterns();
} 