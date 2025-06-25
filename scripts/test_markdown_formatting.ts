import { formatResponse } from '../src/utils/chatFormatting';

// Test cases for markdown to plain text conversion
const testCases = [
  {
    name: "Your example text with proper formatting",
    input: `Nurses drive healthcare innovation.
Most wait for permission to lead.

I've watched countless nurses transform healthcare without fancy titles or executive approval.

The real innovators join committees where decisions happen. They pilot solutions to problems others just complain about. They document results that build influence.

These nurses don't just use new technology. They shape how it works.

A nurse on my team noticed patient falls increasing during shift changes. She gathered data, proposed a simple communication protocol, and reduced falls by 23%.

No one asked her to solve this problem.

She saw an opportunity and took action.

Want to build your influence in healthcare?

Learn one new skill outside your comfort zone.

Join a project where you can apply this skill.

Document your results and share them widely.

Your career grows when you solve problems no one asked you to fix.

Lead from where you stand today.

What problem will you solve this month?`,
    description: "Should preserve clean paragraph structure with proper spacing"
  },
  {
    name: "Markdown with headers and formatting",
    input: `# Main Title

## Subtitle

**Bold text** and *italic text* should become normal text.

- List item 1
- List item 2
- List item 3

1. Numbered item 1
2. Numbered item 2

> This is a blockquote

\`\`\`
Code block content
\`\`\`

Inline \`code\` here.

[Link text](https://example.com) should just show the text.

---

Final paragraph after horizontal rule.`,
    description: "Should remove all markdown formatting and preserve clean text"
  },
  {
    name: "Mixed spacing and line breaks",
    input: `First paragraph.


Second paragraph with    multiple    spaces.



Third paragraph after many line breaks.

Fourth paragraph.    

Final paragraph.`,
    description: "Should normalize spacing and line breaks"
  },
  {
    name: "Questions and exclamations",
    input: `Is this working correctly?
Yes it is!
What about this question?
Another exclamation!

Final statement.`,
    description: "Should handle punctuation spacing properly"
  }
];

const runFormattingTests = () => {
  console.log('🧪 Testing Markdown to Plain Text Formatting\n');
  
  testCases.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}`);
    console.log(`Description: ${test.description}`);
    console.log('\n--- INPUT ---');
    console.log(test.input);
    console.log('\n--- OUTPUT ---');
    const result = formatResponse(test.input);
    console.log(result);
    console.log('\n--- END ---');
    console.log('='.repeat(60));
  });
  
  console.log('\n✅ Formatting tests completed!');
  console.log('\nCheck the output above to verify:');
  console.log('- Markdown formatting is removed');
  console.log('- Clean paragraph spacing (double line breaks)');
  console.log('- Proper sentence spacing');
  console.log('- No extra whitespace');
};

const showFormattingTips = () => {
  console.log('\n💡 Plain Text Formatting Tips:');
  console.log('');
  console.log('The response formatter will:');
  console.log('✅ Remove markdown headers (# ## ###)');
  console.log('✅ Remove bold/italic formatting (**text** *text*)');
  console.log('✅ Remove links, keeping only text [text](url) → text');
  console.log('✅ Remove code blocks and inline code');
  console.log('✅ Remove list markers (- * + 1. 2.)');
  console.log('✅ Remove blockquotes (>)');
  console.log('✅ Normalize spacing and line breaks');
  console.log('✅ Create clean paragraph separation');
  console.log('');
  console.log('Result: Clean, readable plain text like your Airtable example!');
};

// Run tests if this file is executed directly
runFormattingTests();
showFormattingTips();

export { runFormattingTests, showFormattingTips }; 