export const formatResponse = (data: any): string => {
  if (typeof data === 'string') {
    // First, clean and normalize the text
    let text = data.trim();
    
    // Remove common markdown formatting while preserving content
    text = text
      // Remove markdown headers (# ## ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold/italic (**text** or *text*)
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown code blocks ```
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code `text`
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown list markers (- * +) and preserve line breaks
      .replace(/^[\s]*[-*+]\s+(.+)$/gm, '$1\n')
      // Remove numbered list markers (1. 2. etc.) and preserve line breaks
      .replace(/^[\s]*\d+\.\s+(.+)$/gm, '$1\n')
      // Remove markdown blockquotes (>)
      .replace(/^>\s+/gm, '')
      // Remove horizontal rules (--- or ***)
      .replace(/^[-*]{3,}$/gm, '')
      // Clean up any remaining markdown artifacts
      .replace(/[_~`]/g, '');
    
    // Normalize whitespace and line breaks
    text = text
      // Replace multiple spaces with single space
      .replace(/ {2,}/g, ' ')
      // Replace multiple line breaks with double line breaks (paragraph spacing)
      .replace(/\n{3,}/g, '\n\n')
      // Ensure sentences end with proper spacing
      .replace(/\.\s*\n/g, '.\n\n')
      // Clean up any trailing whitespace on lines
      .replace(/[ \t]+$/gm, '')
      // Ensure questions end with proper spacing
      .replace(/\?\s*\n/g, '?\n\n')
      // Handle exclamations with proper spacing
      .replace(/!\s*\n/g, '!\n\n');
    
    // Split into paragraphs and clean each one
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Format each paragraph properly
    const formattedParagraphs = paragraphs.map(paragraph => {
      return paragraph
        .trim()
        // Ensure proper sentence spacing within paragraphs
        .replace(/\.\s+/g, '. ')
        .replace(/\?\s+/g, '? ')
        .replace(/!\s+/g, '! ')
        // Remove any extra internal line breaks within paragraphs
        .replace(/\n+/g, ' ')
        // Clean up multiple spaces again
        .replace(/ {2,}/g, ' ');
    });
    
    // Join paragraphs with double line breaks for clean spacing
    return formattedParagraphs.join('\n\n');
  }
  
  // Handle object responses
  const possibleFields = ['output', 'reply', 'response', 'message', 'text', 'content', 'result'];
  for (const field of possibleFields) {
    if (data[field]) {
      const content = data[field];
      if (typeof content === 'string') {
        return formatResponse(content); // Apply the same formatting to nested content
      }
      if (typeof content === 'object') {
        return JSON.stringify(content, null, 2);
      }
    }
  }
  
  return JSON.stringify(data, null, 2);
};
