import React from 'react';

// This regex splits the text by markdown code blocks (```...```)
const codeBlockRegex = /(```[\s\S]*?```)/g;

const parseMessage = (text: string): { type: 'text' | 'code'; content: string }[] => {
  if (!text) return [];
  
  const parts = text.split(codeBlockRegex);

  // FIX: Explicitly typing the return of the map callback ensures TypeScript doesn't widen
  // the 'type' property to a generic 'string', resolving the assignment error.
  return parts.map((part): { type: 'text' | 'code'; content: string } => {
    if (codeBlockRegex.test(part)) {
      // It's a code block, remove the backticks and language identifier
      const codeContent = part.replace(/^```(?:\w+)?\n?/, '').replace(/```$/, '');
      return { type: 'code', content: codeContent };
    } else {
      return { type: 'text', content: part };
    }
  }).filter(part => part.content); // Filter out empty parts
};

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  const parsedContent = parseMessage(text);

  return (
    <div className="text-sm whitespace-pre-wrap leading-relaxed">
      {parsedContent.map((part, index) => {
        if (part.type === 'code') {
          return (
            <pre key={index} className="bg-zinc-950 p-3 my-2 rounded-lg border border-zinc-600/50 overflow-x-auto">
              <code className="font-mono text-sm text-zinc-300">{part.content}</code>
            </pre>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </div>
  );
};

export default MessageContent;