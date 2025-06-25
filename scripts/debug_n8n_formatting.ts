import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.enlightenedmediacollective.com/webhook/df1ffdf6-241c-4b39-9def-88ad5add8675';

async function debugN8NResponse() {
  console.log("🧪 Testing N8N Response Formatting\n");
  
  try {
    const testMessage = "build me a linkedin post about nursing";
    const sessionId = `debug-${Date.now()}`;
    
    const queryParams = new URLSearchParams({
      UUID: sessionId,
      message: testMessage,
      timestamp: Date.now().toString()
    }).toString();
    
    console.log(`📤 Sending: ${testMessage}\n`);
    
    const response = await axios.get(`${N8N_WEBHOOK_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log("📦 Raw response:", JSON.stringify(response.data).substring(0, 500));
    console.log("\n📄 Full response:", JSON.stringify(response.data, null, 2));
    
    if (Array.isArray(response.data) && response.data[0]?.fields?.Content) {
      const content = response.data[0].fields.Content;
      console.log("\n📝 Content field:", content);
      console.log("\n🔍 Line break analysis:");
      console.log("  - Has \\n:", content.includes('\n'));
      console.log("  - Has \\r\\n:", content.includes('\r\n'));
      console.log("  - Number of \\n:", (content.match(/\n/g) || []).length);
      console.log("  - Number of \\r\\n:", (content.match(/\r\n/g) || []).length);
      
      console.log("\n📊 First 10 character codes:");
      console.log("  ", Array.from(content.substring(0, 10)).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
      
      // Check for any special line break positions
      const lineBreakPositions = [];
      for (let i = 0; i < content.length; i++) {
        if (content[i] === '\n' || content[i] === '\r') {
          lineBreakPositions.push({
            position: i,
            char: content[i],
            code: content.charCodeAt(i),
            context: content.substring(Math.max(0, i-5), Math.min(content.length, i+5))
          });
        }
      }
      
      if (lineBreakPositions.length > 0) {
        console.log("\n🎯 Line break positions found:");
        lineBreakPositions.slice(0, 5).forEach(lb => {
          console.log(`  - Position ${lb.position}: ${lb.char === '\n' ? '\\n' : '\\r'} (${lb.code})`);
          console.log(`    Context: "${lb.context.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`);
        });
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the debug
debugN8NResponse();
