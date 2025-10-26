import React, { useState, useRef, useEffect } from 'react';
import { createChat } from '../../services/geminiService';
import type { Chat } from '@google/genai';
import MessageContent from '../../components/MessageContent';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const CodeAssistant: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Using a more powerful model for coding tasks
    const systemInstruction = "You are an expert Code Generator AI. Your primary purpose is to write high-quality, functional code based on the user's description. When providing code, always wrap it in markdown code blocks with the appropriate language identifier (e.g., ```javascript).";
    const codeChat = createChat(systemInstruction);
    // @ts-ignore - a little hack to use a different model for this specific chat
    codeChat.model = 'gemini-2.5-pro'; 
    setChat(codeChat);
    setMessages([{ role: 'model', text: "Siap untuk membuat kode. Apa yang bisa saya buatkan untuk Anda? Jelaskan kebutuhan Anda, misalnya 'buatkan fungsi Python untuk validasi email'." }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await chat.sendMessageStream({ message: currentInput });
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
          newMessages[newMessages.length - 1].text = 'Sorry, I encountered an error. Please ensure your code is correct and try again.';
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
      <div className="p-4 border-b border-zinc-800 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white">Code Generator</h2>
        <p className="text-sm text-zinc-400">Hasilkan cuplikan kode, fungsi, atau seluruh skrip dari deskripsi teks.</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-3xl px-4 py-3 rounded-2xl shadow-md ${
              msg.role === 'user' 
                ? 'bg-violet-600 text-white rounded-br-lg' 
                : 'bg-zinc-700 text-zinc-200 rounded-bl-lg'
            }`}>
              <MessageContent text={msg.text + (isLoading && msg.role === 'model' && index === messages.length - 1 ? '...' : '')} />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center bg-zinc-800 rounded-xl ring-1 ring-zinc-700 focus-within:ring-violet-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="Jelaskan kode yang ingin dibuat... (contoh: fungsi javascript untuk mengurutkan array)"
            className="flex-1 bg-transparent px-4 py-3 text-white placeholder-zinc-500 focus:outline-none resize-none h-12 max-h-40"
            rows={1}
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 text-zinc-400 hover:text-violet-400 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors mr-1 self-end">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeAssistant;