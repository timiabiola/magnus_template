import React from 'react';

interface FormatTesterProps {
  content: string;
}

const FormatTester: React.FC<FormatTesterProps> = ({ content }) => {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-bold mb-2">Original (JSON):</h3>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs">
          {JSON.stringify(content)}
        </pre>
      </div>
      
      <div>
        <h3 className="font-bold mb-2">With whitespace-pre-wrap:</h3>
        <div className="whitespace-pre-wrap border p-2 rounded">
          {content}
        </div>
      </div>
      
      <div>
        <h3 className="font-bold mb-2">With line breaks as BR tags:</h3>
        <div 
          className="border p-2 rounded"
          dangerouslySetInnerHTML={{ 
            __html: content.replace(/\n/g, '<br>') 
          }} 
        />
      </div>
      
      <div>
        <h3 className="font-bold mb-2">Character analysis:</h3>
        <div className="text-xs bg-gray-100 p-2 rounded">
          <p>Total length: {content.length}</p>
          <p>Line breaks (\n): {(content.match(/\n/g) || []).length}</p>
          <p>Carriage returns (\r): {(content.match(/\r/g) || []).length}</p>
          <p>Double line breaks: {(content.match(/\n\n/g) || []).length}</p>
        </div>
      </div>
    </div>
  );
};

export default FormatTester;
