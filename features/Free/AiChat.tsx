import React, { useState, useRef, useEffect } from 'react';
import { createChat } from '../../services/geminiService';
import type { Chat } from '@google/genai';
import MessageContent from '../../components/MessageContent';
import { fileToBase64 } from '../../utils/helpers';
import { PaperClipIcon, XCircleIcon } from '../../components/icons/FeatureIcons';

interface Message {
  role: 'user' | 'model';
  text: string;
  filePreview?: string | null;
}

const AiChat: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);

  useEffect(() => {
    const systemInstruction = "You are YAN OFFICIAL, a helpful and versatile AI assistant. Answer any questions the user has accurately and concisely. You can help with a wide range of tasks, from drafting emails and writing code to brainstorming ideas and explaining complex topics. If the user provides an image, analyze it and respond to their query about it.";
    const newChat = createChat(systemInstruction);

    if (newChat) {
      setChat(newChat);
      setMessages([{ role: 'model', text: 'Halo, saya YAN OFFICIAL. Asisten AI serbaguna Anda. Ada yang bisa saya bantu hari ini?' }]);
    } else {
      setIsServiceAvailable(false);
      setMessages([{ role: 'model', text: 'Sorry, the AI Chat service is currently unavailable. The API Key may not be configured for this website.' }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 4 * 1024 * 1024) {
            alert("File size cannot exceed 4MB.");
            handleRemoveFile();
            return;
        }
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !file) || !chat || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, filePreview };
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    const currentInput = input;
    const currentFile = file;

    setInput('');
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    setIsLoading(true);

    try {
      let promptPayload: (string | { inlineData: { mimeType: string; data: string; }; })[] | string = currentInput;

      if (currentFile) {
        const base64Data = await fileToBase64(currentFile);
        const filePart = {
          inlineData: {
            mimeType: currentFile.type,
            data: base64Data,
          },
        };
        promptPayload = [currentInput, filePart];
      }
      
      const responseStream = await chat.sendMessageStream(promptPayload);
      
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text += chunkText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
          const newMessages = [...prev];
          const errorMessage = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again later.';
          newMessages[newMessages.length - 1].text = errorMessage;
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
      <div className="p-4 border-b border-zinc-800 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white">AI Chat</h2>
        <p className="text-sm text-zinc-400">Tanya apa saja, dari pengetahuan umum hingga ide kreatif.</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${
              msg.role === 'user' 
                ? 'bg-violet-600 text-white rounded-br-lg' 
                : 'bg-zinc-700 text-zinc-200 rounded-bl-lg'
            }`}>
                {msg.filePreview && (
                    <img src={msg.filePreview} alt="Uploaded content" className="mb-2 rounded-lg max-w-xs max-h-48 object-contain" />
                )}
               <MessageContent text={msg.text + (isLoading && msg.role === 'model' && index === messages.length - 1 ? '...' : '')} />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        {filePreview && (
            <div className="relative mb-2 w-28 h-28 p-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                <img src={filePreview} alt="File preview" className="w-full h-full object-contain rounded-md" />
                <button 
                    onClick={handleRemoveFile} 
                    className="absolute -top-2 -right-2 p-1 bg-zinc-700 hover:bg-zinc-600 rounded-full text-zinc-300"
                    aria-label="Remove file"
                >
                    <XCircleIcon className="w-5 h-5" />
                </button>
            </div>
        )}
        <div className="flex items-center bg-zinc-800 rounded-xl ring-1 ring-zinc-700 focus-within:ring-violet-500 transition-all">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            aria-label="Upload file"
          />
           <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isLoading || !isServiceAvailable} 
                className="p-3 text-zinc-400 hover:text-violet-400 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors ml-1"
                aria-label="Attach file"
            >
              <PaperClipIcon className="w-6 h-6" />
            </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isServiceAvailable ? "Type your message here..." : "Service unavailable"}
            className="flex-1 bg-transparent px-2 py-3 text-white placeholder-zinc-500 focus:outline-none"
            disabled={isLoading || !isServiceAvailable}
          />
          <button onClick={handleSend} disabled={isLoading || (!input.trim() && !file) || !isServiceAvailable} className="p-3 text-zinc-400 hover:text-violet-400 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;