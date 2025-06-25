
export const formatResponse = (data: any): string => {
  if (typeof data === 'string') {
    // Split text by double newlines or ### to handle section headers
    const sections = data.split(/\n\n|(?=###)/);
    
    // Process each section and preserve intentional line breaks
    return sections
      .map(section => section.trim())
      .filter(section => section.length > 0)
      .join('\n\n');
  }
  
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
