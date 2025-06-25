export const formatResponse = (data: any): string => {
  if (typeof data === 'string') {
    // Preserve the original formatting - don't split and rejoin
    // Just trim the overall string and ensure it's not empty
    const trimmed = data.trim();
    return trimmed || 'Message processed successfully.';
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
