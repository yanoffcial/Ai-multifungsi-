import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './icons/FeatureIcons';

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

const CodeBlock: React.FC<{ content: string }> = ({ content }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 p-3 my-2 rounded-lg border border-zinc-600/50 overflow-x-auto">
        <code className="font-mono text-sm text-zinc-300">{content}</code>
      </pre>
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-zinc-700/50 rounded-md text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
        aria-label="Copy code"
      >
        {isCopied ? (
          <CheckIcon className="w-4 h-4 text-green-400" />
        ) : (
          <ClipboardIcon className="w-4 h-4 hover:text-white" />
        )}
      </button>
    </div>
  );
};

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  const parsedContent = parseMessage(text);

  return (
    <div className="text-sm whitespace-pre-wrap leading-relaxed">
      {parsedContent.map((part, index) => {
        if (part.type === 'code') {
          return <CodeBlock key={index} content={part.content} />;
        }
        return <span key={index}>{part.content}</span>;
      })}
    </div>
  );
};

export default MessageContent;
