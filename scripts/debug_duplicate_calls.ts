#!/usr/bin/env node

// Script to analyze duplicate webhook calls

const logs = [
  {
    timestamp: "1750868752564",
    readable: new Date(1750868752564).toISOString(),
    requestId: "2927ea1a-18d1-4e60-884a-9366426b7cd6-build me a linkedin post"
  },
  {
    timestamp: "1750868785335", 
    readable: new Date(1750868785335).toISOString(),
    requestId: "2927ea1a-18d1-4e60-884a-9366426b7cd6-build me a linkedin post"
  }
];

console.log("🔍 Analyzing Duplicate Webhook Calls\n");

console.log("First call:", logs[0].readable);
console.log("Second call:", logs[1].readable);
console.log("\nTime difference:", (parseInt(logs[1].timestamp) - parseInt(logs[0].timestamp)) / 1000, "seconds");

console.log("\n🤔 Possible causes:");
console.log("1. Browser network retry (33s is unusual for automatic retry)");
console.log("2. User manually clicking send again");
console.log("3. React component re-rendering and re-triggering");
console.log("4. Service worker or browser extension interference");
console.log("5. N8N webhook configuration issue");

console.log("\n✅ Solution implemented:");
console.log("- Added 60-second deduplication window");
console.log("- Tracks recent requests even after completion");
console.log("- Prevents same message within time window");
console.log("- Added unique timestamp to each request");
console.log("- Enhanced logging with stack traces"); 