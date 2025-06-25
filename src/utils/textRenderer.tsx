import React from 'react';

export const renderFormattedText = (text: string) => {
  // First normalize line breaks
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split by line breaks
  const lines = normalizedText.split('\n');
  
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Empty line indicates paragraph break
    if (trimmedLine === '') {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-4">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
    }
    // Numbered list item
    else if (/^\d+\./.test(trimmedLine)) {
      // Flush current paragraph if exists
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-4">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
      // Add list item
      elements.push(
        <div key={`li-${index}`} className="ml-4 mb-2">
          {trimmedLine}
        </div>
      );
    }
    // Regular line
    else {
      currentParagraph.push(trimmedLine);
    }
  });
  
  // Flush remaining paragraph
  if (currentParagraph.length > 0) {
    elements.push(
      <p key={`p-${elements.length}`} className="mb-4">
        {currentParagraph.join(' ')}
      </p>
    );
  }
  
  // If no elements were created, just return the original text with line breaks preserved
  if (elements.length === 0) {
    return <div className="whitespace-pre-wrap">{text}</div>;
  }
  
  return <>{elements}</>;
};

// Alternative simple renderer that just preserves formatting exactly
export const renderSimpleFormattedText = (text: string) => {
  // Normalize line breaks
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split into lines and render with proper spacing
  const lines = normalizedText.split('\n');
  
  return (
    <>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};
